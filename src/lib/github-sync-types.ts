export interface GitHubIssueLabel {
  name: string;
  id?: number;
  color?: string;
  description?: string | null;
}

export interface GitHubIssueAssignee {
  login: string;
  id?: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body?: string | null;
  state: "open" | "closed" | string;
  assignee?: GitHubIssueAssignee | null;
  assignees?: GitHubIssueAssignee[] | null;
  labels?:
    | (string | GitHubIssueLabel | { name?: string; [key: string]: unknown })[]
    | null;
}

export interface GitHubRepository {
  owner: {
    login: string;
  };
  name: string;
}
