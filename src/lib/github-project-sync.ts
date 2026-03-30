import { TaskStatus } from "@prisma/client";
import {
  ISSUE_QUERY,
  USER_PROJECT_QUERY,
  ORG_PROJECT_QUERY,
  ITEMS_QUERY,
  ADD_ITEM_MUTATION,
  UPDATE_STATUS_MUTATION,
} from "@/lib/github-project-sync-queries";
import {
  findStatusField,
  findStatusOption,
  type GitHubProjectSyncClient,
  type GitHubIssueQueryResponse,
  type GitHubUserProjectQueryResponse,
  type GitHubOrgProjectQueryResponse,
  type GitHubProjectItemsQueryResponse,
  type GitHubAddItemMutationResponse,
} from "@/lib/github-project-sync-types";

const STATUS_MAP: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  BLOCKED: "Blocked",
};

async function updateProjectItemStatus(
  githubClient: GitHubProjectSyncClient,
  projectId: string,
  itemId: string,
  fieldId: string,
  optionId: string
): Promise<void> {
  await githubClient.graphql(UPDATE_STATUS_MUTATION, {
    projectId,
    itemId,
    fieldId,
    optionId,
  });
}

export async function syncTaskToGitHubProject(
  githubClient: GitHubProjectSyncClient,
  issueNumber: number,
  projectId: number,
  taskStatus: TaskStatus,
  repoName: string
): Promise<void> {
  try {
    const statusValue = STATUS_MAP[taskStatus] || "Todo";
    const [owner, repo] = repoName.split("/");

    const issueData = await githubClient.graphql<GitHubIssueQueryResponse>(
      ISSUE_QUERY,
      { owner, repo, number: issueNumber }
    );
    const issueNodeId = issueData.repository?.issue?.id;
    if (!issueNodeId) {
      console.warn(`Issue #${issueNumber} not found in ${repoName}`);
      return;
    }

    const userProject =
      await githubClient.graphql<GitHubUserProjectQueryResponse>(
        USER_PROJECT_QUERY,
        { login: owner, number: projectId }
      );
    const orgProject = userProject.user?.projectV2
      ? null
      : await githubClient.graphql<GitHubOrgProjectQueryResponse>(
          ORG_PROJECT_QUERY,
          { login: owner, number: projectId }
        );
    const project =
      userProject.user?.projectV2 ?? orgProject?.organization?.projectV2 ?? null;
    if (!project) throw new Error(`Project ${projectId} not found`);

    const statusField = findStatusField(project);
    const statusOption = findStatusOption(statusField, statusValue);
    const itemsData =
      await githubClient.graphql<GitHubProjectItemsQueryResponse>(ITEMS_QUERY, {
        projectId: project.id,
      });
    const existingItem = itemsData.node?.items?.nodes?.find(
      (item) => item.content?.id === issueNodeId
    );
    const addResult = existingItem
      ? null
      : await githubClient.graphql<GitHubAddItemMutationResponse>(
          ADD_ITEM_MUTATION,
          { projectId: project.id, contentId: issueNodeId }
        );
    const itemId =
      existingItem?.id ?? addResult?.addProjectV2ItemById?.item?.id;

    if (itemId && statusField?.id && statusOption?.id) {
      await updateProjectItemStatus(
        githubClient,
        project.id,
        itemId,
        statusField.id,
        statusOption.id
      );
    }
  } catch (error) {
    console.error("Failed to sync to GitHub Project:", error);
    throw error;
  }
}
