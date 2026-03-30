import { prisma } from "@/lib/prisma";
import { getGitHubClient } from "@/lib/github";
import { TaskStatus } from "@prisma/client";

function mapStatusToGitHubState(status: TaskStatus): "open" | "closed" {
  return status === "DONE" ? "closed" : "open";
}

function mapStatusToLabel(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    IN_REVIEW: "in-review",
    DONE: "done",
    BLOCKED: "blocked",
  };
  return statusMap[status] || "todo";
}

async function syncAssignees(
  githubClient: ReturnType<typeof getGitHubClient>,
  owner: string,
  repo: string,
  issueNumber: number,
  githubUsername?: string | null
) {
  const { data: issue } = await githubClient.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
  const currentAssignees = issue.assignees?.map((a) => a.login) || [];
  if (!githubUsername && currentAssignees.length > 0) {
    await githubClient.rest.issues.removeAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees: currentAssignees,
    });
    return;
  }
  if (githubUsername && !currentAssignees.includes(githubUsername)) {
    if (currentAssignees.length > 0) {
      await githubClient.rest.issues.removeAssignees({
        owner,
        repo,
        issue_number: issueNumber,
        assignees: currentAssignees,
      });
    }
    await githubClient.rest.issues.addAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees: [githubUsername],
    });
  }
}

async function syncStatusLabel(
  githubClient: ReturnType<typeof getGitHubClient>,
  owner: string,
  repo: string,
  issueNumber: number,
  status: TaskStatus
) {
  const statusLabel = mapStatusToLabel(status);
  const statusLabels = ["todo", "in-progress", "in-review", "done", "blocked"];
  const { data: labels } = await githubClient.rest.issues.listLabelsOnIssue({
    owner,
    repo,
    issue_number: issueNumber,
  });
  for (const label of labels.map((l) => l.name)) {
    if (statusLabels.includes(label.toLowerCase()) && label !== statusLabel) {
      try {
        await githubClient.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: issueNumber,
          name: label,
        });
      } catch {}
    }
  }
  try {
    await githubClient.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [statusLabel],
    });
  } catch {
    try {
      await githubClient.rest.issues.createLabel({
        owner,
        repo,
        name: statusLabel,
        color: "0e8a16",
      });
      await githubClient.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: [statusLabel],
      });
    } catch (createError) {
      console.error("Failed to create/add label:", createError);
    }
  }
}

export async function syncTaskToGitHub(taskId: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: true,
        assignee: { include: { user: true } },
        statusColumn: true,
      },
    });
    if (
      !task ||
      !task.githubIssueNumber ||
      !task.board.githubSyncEnabled ||
      !task.board.githubAccessToken ||
      !task.board.githubRepoName
    ) {
      return;
    }

    const githubClient = getGitHubClient(task.board.githubAccessToken);
    const [owner, repo] = task.board.githubRepoName.split("/");

    try {
      await syncAssignees(
        githubClient,
        owner,
        repo,
        task.githubIssueNumber,
        task.assignee?.user?.githubUsername
      );
    } catch (error) {
      console.error("Failed to sync assignees:", error);
    }

    if (task.statusColumn) {
      await syncStatusLabel(
        githubClient,
        owner,
        repo,
        task.githubIssueNumber,
        task.status
      );
    }

    await githubClient.rest.issues.update({
      owner,
      repo,
      issue_number: task.githubIssueNumber,
      title: task.title,
      body: task.description || "",
      state: mapStatusToGitHubState(task.status),
    });

    if (task.board.githubProjectId) {
      const { syncTaskToGitHubProject } = await import("@/lib/github-project-sync");
      await syncTaskToGitHubProject(
        githubClient,
        task.githubIssueNumber,
        task.board.githubProjectId,
        task.status,
        task.board.githubRepoName
      );
    }
  } catch (error) {
    console.error("Failed to sync task to GitHub:", error);
  }
}
