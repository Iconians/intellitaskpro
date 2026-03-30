export const ISSUE_QUERY = `
  query GetIssue($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) { issue(number: $number) { id } }
  }
`;

export const USER_PROJECT_QUERY = `
  query GetUserProject($login: String!, $number: Int!) {
    user(login: $login) {
      projectV2(number: $number) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
          }
        }
      }
    }
  }
`;

export const ORG_PROJECT_QUERY = `
  query GetOrgProject($login: String!, $number: Int!) {
    organization(login: $login) {
      projectV2(number: $number) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
          }
        }
      }
    }
  }
`;

export const ITEMS_QUERY = `
  query GetProjectItems($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100) { nodes { id content { ... on Issue { id } } } }
      }
    }
  }
`;

export const ADD_ITEM_MUTATION = `
  mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }
`;

export const UPDATE_STATUS_MUTATION = `
  mutation UpdateProjectItem($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }
    ) { projectV2Item { id } }
  }
`;
