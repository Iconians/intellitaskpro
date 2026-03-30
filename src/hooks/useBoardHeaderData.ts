"use client";

import { useQuery } from "@tanstack/react-query";
import { computeHasPaidSubscription } from "@/components/boards/board-header-utils";

export function useBoardHeaderData(boardId: string, organizationId?: string) {
  const { data: activeSprint } = useQuery({
    queryKey: ["sprints", boardId, "active"],
    queryFn: async () => {
      const res = await fetch(`/api/sprints?boardId=${boardId}&isActive=true`);
      if (!res.ok) return null;
      const sprints = await res.json();
      return sprints.length > 0 ? sprints[0] : null;
    },
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      try {
        const res = await fetch(
          `/api/subscriptions?organizationId=${organizationId}`
        );
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    enabled: !!organizationId,
    retry: false,
  });

  const { data: board } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const hasPaidSubscription = computeHasPaidSubscription(subscription);
  const isGitHubConnected = Boolean(
    board?.githubSyncEnabled && board?.githubAccessToken
  );
  const needsRepoName =
    Boolean(board?.githubSyncEnabled && board?.githubAccessToken) &&
    !board?.githubRepoName;

  const { data: githubLimit } = useQuery({
    queryKey: ["githubLimit", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const res = await fetch(
        `/api/organizations/${organizationId}/github-limit`
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!organizationId && !isGitHubConnected,
  });

  const canConnectGitHub =
    isGitHubConnected ||
    (githubLimit?.allowed !== false && !githubLimit?.error);

  return {
    activeSprint,
    subscription,
    board,
    hasPaidSubscription,
    isGitHubConnected,
    needsRepoName,
    githubLimit,
    canConnectGitHub,
  };
}
