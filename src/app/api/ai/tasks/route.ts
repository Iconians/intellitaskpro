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
        ? `\n\nContext: The input looks like ${listItems.length} distinct list entries (bullets or numbered lines). A senior engineer would make sure each real issue or ask is owned by a task—usually one task per entry, same rough order. Merge only if two lines are clearly duplicates; split an entry into two tasks only when it genuinely needs separate workstreams (e.g. backend vs email pipeline). You may also add extra tasks when one line implies multiple lifecycle stages (e.g. content + implementation + launch) if the input is rich—do not drop a substantive item.\n`
        : "";

    const systemPrompt = `You write task breakdowns the way a strong senior/staff engineer would before a sprint: practical, shippable, and easy for teammates to pick up.

Classify the input first (signals can overlap):
- **Greenfield / new build** (new site, MVP, launch, pages, content structure, marketing copy, sitemap): favor tasks that mirror the user’s sections and deliverables. Descriptions must quote or paraphrase their bullets (Hero, Services blocks, CTAs, forms, tone)—not a generic engineering template.
- **Maintenance / bugs** (fix, broken, regression, defect, error): favor repro → root cause → fix → regression check. Each bug task gets its own repro and verification tied to that issue.

Lifecycle (use only when the input or task clearly needs it—do not pad with unrelated CI/CD tickets):
- **Pre-development**: discovery, IA, acceptance criteria, content outline, stakeholder sign-off.
- **Development**: implementation (UI, API, CMS, integrations) scoped to the input.
- **DevOps**: pipelines, envs, secrets, deploy/rollback when shipping is implied.
- **Testing**: QA, accessibility, forms, cross-browser, monitoring hooks if relevant.
- **Hosting & launch**: DNS, SSL, production smoke, handoff when launch is in scope.

How to think:
- **Scope & granularity**: Decompose until each task is something one person could drive to done in a reasonable slice. Large briefs (many pages/sections) may yield more tasks or subtasks per section—each description must be **unique** and tied to that slice’s text.
- **Titles**: Specific and action-oriented (“Services page: offerings, proof, and primary CTA” not “Work on website”).
- **Descriptions**: **Forbidden**: repeating the same boilerplate paragraph on every task (e.g. identical “Scope: clarify behavior…” on all items). Each description should read like it only applies to that task. Include acceptance / verification grounded in the user’s wording.
- **Grounding**: Every task must trace to the user’s input. Don’t substitute a generic sprint template unless the user asked for that deliverable.
- **Priority & hours**: Use judgment—customer impact, risk, uncertainty. URGENT only for outages, security, or hard blockers.

Output ONLY valid JSON: an array of objects with keys:
- title (string)
- description (string)
- priority: one of LOW, MEDIUM, HIGH, URGENT
- estimatedHours (number)

Example A — bug / maintenance list (senior tone):
[
  {
    "title": "Correct post-match queue: next solo waiter, not winning duo",
    "description": "Repro: when a game ends, queue logic advances the winning pair into the next match instead of the next individual in the solo queue. Trace matchmaking/queue state transitions after game completion; align behavior with product rule (solo FIFO vs duo). Add regression test or integration check so this can’t slip again.",
    "priority": "HIGH",
    "estimatedHours": 6
  },
  {
    "title": "Define and validate behavior for \\"you're up next\\" notification timing",
    "description": "Stakeholders unclear when emails fire relative to game state. Trace send path (job vs inline), document actual timing, fix if it violates expected UX, and add logging or metrics if gaps remain.",
    "priority": "MEDIUM",
    "estimatedHours": 4
  }
]

Example B — marketing / site structure brief (each task description must reflect different page content from the input):
[
  {
    "title": "Homepage: hero, pain/solution, services teaser, process, proof, CTA",
    "description": "Implement the Home page per the brief: hero with clear offer + who it’s for; pain → solution; high-level services; 3–4 step process; proof block; primary CTA (e.g. Book a Call). Acceptance: each listed section maps to a visible block; CTA links work; copy can be draft but structure matches the spec.",
    "priority": "HIGH",
    "estimatedHours": 10
  },
  {
    "title": "Services page: per-offering structure and differentiation",
    "description": "For each service in the brief, ship blocks for what it is, who it’s for, problems solved, what’s included (and optional pricing range if provided). Acceptance: visitor can compare offerings; messaging matches the supplied outline, not generic placeholder text.",
    "priority": "HIGH",
    "estimatedHours": 8
  }
]`;

    const userPrompt = `${listContext}USER INPUT (source of truth—interpret like you’re breaking down your own team’s backlog):\n---\n${description}\n---\n\nReturn the JSON array now.`;

    let aiResponse: string;
    try {
      aiResponse = await generateWithAI(
        provider as "demo" | "gemini" | "ollama" | "openai" | "anthropic",
        userPrompt,
        systemPrompt,
        { temperature: 0.32, responseMimeType: "application/json" }
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
