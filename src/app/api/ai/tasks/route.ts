import { NextRequest, NextResponse } from "next/server";
import {
  requireBoardAccess,
  requirePaidSubscription,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { generateWithAI } from "@/lib/ai/client";
import { TaskStatus } from "@prisma/client";
import { syncTaskToGitHub } from "@/lib/github-sync";
import { extractUserListItems } from "@/lib/ai/extract-list-items";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      description,
      boardId,
      provider = process.env.AI_PROVIDER || "gemini",
    } = body;

    if (!description || !boardId) {
      return NextResponse.json(
        { error: "Description and boardId are required" },
        { status: 400 }
      );
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        organizationId: true,
        githubSyncEnabled: true,
        githubAccessToken: true,
        githubRepoName: true,
        githubProjectId: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    
    try {
      await requirePaidSubscription(board.organizationId);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "AI features require a paid subscription (Pro or Enterprise)",
        },
        { status: 403 }
      );
    }

    
    await requireBoardAccess(boardId, "MEMBER");

    const listItems = extractUserListItems(description);
    const listContext =
      listItems.length >= 2
        ? `\n\nContext: The input looks like ${listItems.length} distinct list entries (bullets or numbered lines). A senior engineer would make sure each real issue or ask is owned by a task—usually one task per entry, same rough order. Merge only if two lines are clearly duplicates; split an entry into two tasks only when it genuinely needs separate workstreams (e.g. backend vs email pipeline). Do not drop a substantive item.\n`
        : "";

    const systemPrompt = `You write task breakdowns the way a strong senior/staff engineer would before a sprint: practical, shippable, and easy for teammates to pick up.

How to think:
- **Scope & granularity**: Decompose until each task is something one person could drive to done in a reasonable slice. Not micro-tickets (unless the input is already tiny), not vague epics. Prefer vertical slices when the work is feature-shaped; prefer clear repro → fix → verify when it’s bug-shaped.
- **Titles**: Specific and action-oriented, like you’d use in Jira/Linear—read standalone and signal the real work (“Fix queue prioritization after match end” not “Fix bug” or “Work on queue”).
- **Descriptions**: Short but senior: current behavior or gap, intended outcome, key technical angles to check, how you’ll know it’s done (acceptance / verification). Call out ambiguities or open questions in-line if the input is fuzzy—don’t invent product decisions; note what needs clarification.
- **Grounding**: Every task must trace to the user’s input. Don’t substitute a generic “sprint template” (standalone code-review-only, CI/CD, or doc tasks) unless the user’s text is clearly asking for that deliverable.
- **Priority & hours**: Use judgment—customer impact, risk, and uncertainty. URGENT only for real outages, security, or hard blockers.

Output ONLY valid JSON: an array of objects with keys:
- title (string)
- description (string)
- priority: one of LOW, MEDIUM, HIGH, URGENT
- estimatedHours (number)

Example (bug list style, senior tone):
[
  {
    "title": "Correct post-match queue: next solo waiter, not winning duo",
    "description": "Repro: when a game ends, queue logic advances the winning pair into the next match instead of the next individual in the solo queue. Trace matchmaking/queue state transitions after game completion; align behavior with product rule (solo FIFO vs duo). Add regression test or integration check so this can’t slip again.",
    "priority": "HIGH",
    "estimatedHours": 6
  },
  {
    "title": "Define and validate behavior for \"you're up next\" notification timing",
    "description": "Stakeholders unclear when emails fire relative to game state. Trace send path (job vs inline), document actual timing, fix if it violates expected UX, and add logging or metrics if gaps remain.",
    "priority": "MEDIUM",
    "estimatedHours": 4
  }
]`;

    const userPrompt = `${listContext}USER INPUT (source of truth—interpret like you’re breaking down your own team’s backlog):\n---\n${description}\n---\n\nReturn the JSON array now.`;

    let aiResponse: string;
    try {
      aiResponse = await generateWithAI(
        provider as "demo" | "gemini" | "ollama" | "openai" | "anthropic",
        userPrompt,
        systemPrompt,
        { temperature: 0.32 }
      );
    } catch (error) {
      
      console.error("AI generation failed, falling back to demo mode:", error);
      try {
        // Demo parser expects raw user text (bullets/keywords), not the wrapped prompt
        aiResponse = await generateWithAI("demo", description, systemPrompt);
      } catch (_fallbackError) {
        return NextResponse.json(
          {
            error:
              "AI generation failed. Please check your API key and try again.",
          },
          { status: 500 }
        );
      }
    }

    
    let tasks;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        tasks = JSON.parse(aiResponse);
      }
    } catch (_error) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "AI did not return a valid task array" },
        { status: 500 }
      );
    }

    
    const statusColumn = await prisma.taskStatusColumn.findFirst({
      where: {
        boardId,
        status: TaskStatus.TODO,
      },
    });

    
    const maxOrderTask = await prisma.task.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });

    
    const createdTasks = await Promise.all(
      tasks.map((task, index) =>
        prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            boardId,
            status: TaskStatus.TODO,
            priority: task.priority || "MEDIUM",
            estimatedHours: task.estimatedHours || null,
            statusColumnId: statusColumn?.id || null,
            order: (maxOrderTask?.order || 0) + index + 1,
          },
          include: {
            assignee: {
              select: {
                id: true,
                userId: true,
                role: true,
              },
            },
            statusColumn: true,
            board: {
              select: {
                id: true,
                organizationId: true,
                githubSyncEnabled: true,
                githubAccessToken: true,
                githubRepoName: true,
                githubProjectId: true,
              },
            },
          },
        })
      )
    );

    // Sync each task to GitHub if GitHub sync is enabled
    for (const task of createdTasks) {
      if (
        task.board.githubSyncEnabled &&
        task.board.githubAccessToken &&
        task.board.githubRepoName
      ) {
        try {
          await syncTaskToGitHub(task.id);
          console.log(
            `✅ Synced AI-generated task ${task.id} to GitHub`
          );
        } catch (githubError) {
          console.error(
            `❌ Failed to sync AI-generated task ${task.id} to GitHub:`,
            githubError
          );
          // Continue with other tasks even if one fails
        }
      }
    }

    
    try {
      await pusherServer.trigger(`private-board-${boardId}`, "tasks-generated", {
        tasks: createdTasks,
        count: createdTasks.length,
      });
    } catch (pusherError) {
      console.error("Pusher error:", pusherError);
      
    }

    return NextResponse.json({ tasks: createdTasks }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate tasks",
      },
      { status: 500 }
    );
  }
}
