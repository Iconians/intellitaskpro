import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";

/** Client shape from `getGitHubClient` — REST + GraphQL for Projects v2. */
export type GitHubProjectSyncClient = {
  rest: Octokit;
  graphql: typeof graphql;
};

export interface GitHubIssueQueryResponse {
  repository: {
    issue: { id: string } | null;
  } | null;
}

export interface GitHubProjectField {
  id: string;
  name: string;
}

export interface GitHubProjectSingleSelectFieldOption {
  id: string;
  name: string;
}

export interface GitHubProjectSingleSelectField extends GitHubProjectField {
  options: GitHubProjectSingleSelectFieldOption[];
}

export type GitHubProjectFieldNode =
  | GitHubProjectField
  | GitHubProjectSingleSelectField;

export interface GitHubProjectV2 {
  id: string;
  fields: {
    nodes: (GitHubProjectFieldNode | null | undefined)[];
  };
}

export interface GitHubUserProjectQueryResponse {
  user: {
    projectV2: GitHubProjectV2 | null;
  } | null;
}

export interface GitHubOrgProjectQueryResponse {
  organization: {
    projectV2: GitHubProjectV2 | null;
  } | null;
}

export interface GitHubProjectItemNode {
  id: string;
  content: {
    id: string;
  } | null;
}

export interface GitHubProjectItemsQueryResponse {
  node: {
    items: {
      nodes: GitHubProjectItemNode[];
    };
  } | null;
}

export interface GitHubAddItemMutationResponse {
  addProjectV2ItemById: {
    item: { id: string } | null;
  } | null;
}

export function isSingleSelectStatusField(
  field: GitHubProjectFieldNode | null | undefined
): field is GitHubProjectSingleSelectField {
  return (
    field != null &&
    typeof field.name === "string" &&
    field.name.toLowerCase() === "status" &&
    "options" in field &&
    Array.isArray((field as GitHubProjectSingleSelectField).options)
  );
}

export function findStatusField(
  project: GitHubProjectV2
): GitHubProjectSingleSelectField | undefined {
  return project.fields.nodes.find(isSingleSelectStatusField);
}

export function findStatusOption(
  statusField: GitHubProjectSingleSelectField | undefined,
  statusValue: string
): GitHubProjectSingleSelectFieldOption | undefined {
  if (!statusField?.options?.length) return undefined;
  return statusField.options.find(
    (opt) => opt.name?.toLowerCase() === statusValue.toLowerCase()
  );
}
