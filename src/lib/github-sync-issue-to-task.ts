import { prisma } from "@/lib/prisma";
import { getGitHubClient } from "@/lib/github";
import { TaskStatus } from "@prisma/client";
import { GitHubIssue, GitHubRepository } from "@/lib/github-sync-types";

export async function syncGitHubIssueToTask(
  issue: GitHubIssue,
  repository: GitHubRepository,
  boardId: string
): Promise<
  ReturnType<typeof prisma.task.create> extends Promise<infer T> ? T : never
> {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        statuses: { orderBy: { order: "asc" } },
        organization: true,
      },
    });
    if (!board || !board.githubAccessToken) {
      throw new Error("Board not found or GitHub not configured");
    }

    const githubClient = getGitHubClient(board.githubAccessToken);
    const [owner, repo] = board.githubRepoName?.split("/") || [
      repository.owner.login,
      repository.name,
    ];

    let fullIssue = issue;
    try {
      const { data: fetchedIssue } = await githubClient.rest.issues.get({
        owner,
        repo,
        issue_number: issue.number,
      });
      fullIssue = fetchedIssue;
    } catch (error) {
      console.warn("Failed to fetch full issue from GitHub:", error);
    }

    let taskStatus: TaskStatus = fullIssue.state === "closed" ? "DONE" : "TODO";
    if (fullIssue.labels && Array.isArray(fullIssue.labels)) {
      const labelNames = fullIssue.labels
        .map((l) => {
          if (typeof l === "string") return l.toLowerCase();
          if (l && typeof l === "object" && "name" in l && l.name) {
            return l.name.toLowerCase();
          }
          return "";
        })
        .filter((name) => name !== "");
      if (labelNames.includes("in-progress")) taskStatus = "IN_PROGRESS";
      else if (labelNames.includes("in-review")) taskStatus = "IN_REVIEW";
      else if (labelNames.includes("blocked")) taskStatus = "BLOCKED";
      else if (labelNames.includes("done")) taskStatus = "DONE";
      else if (labelNames.includes("todo")) taskStatus = "TODO";
    }

    const statusColumn =
      board.statuses.find((s) => s.status === taskStatus) || board.statuses[0];
    const existingTask = await prisma.task.findFirst({
      where: { boardId, githubIssueNumber: fullIssue.number },
    });

    let assigneeId: string | null = null;
    const login = fullIssue.assignee?.login || fullIssue.assignees?.[0]?.login;
    if (login) {
      const user = await prisma.user.findFirst({ where: { githubUsername: login } });
      if (user) {
        const member = await prisma.member.findFirst({
          where: { userId: user.id, organizationId: board.organizationId },
        });
        assigneeId = member?.id || null;
      }
    }

    if (existingTask) {
      return prisma.task.update({
        where: { id: existingTask.id },
        data: {
          title: fullIssue.title,
          description: fullIssue.body ?? null,
          status: taskStatus,
          statusColumnId: statusColumn.id,
          assigneeId,
        },
      });
    }

    return prisma.task.create({
      data: {
        title: fullIssue.title,
        description: fullIssue.body ?? null,
        boardId,
        status: taskStatus,
        statusColumnId: statusColumn.id,
        githubIssueNumber: fullIssue.number,
        assigneeId,
        order: 0,
      },
    });
  } catch (error) {
    console.error("Failed to sync GitHub issue to task:", error);
    throw error;
  }
}
