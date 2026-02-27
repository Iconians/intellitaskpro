"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PlanForBilling,
  SubscriptionForBilling,
  UsageForBilling,
} from "@/lib/data/billing";

export function usePlans(initialData?: PlanForBilling[]) {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
    initialData: initialData ?? undefined,
  });
}

export function useSubscription(
  organizationId: string | null,
  initialData?: SubscriptionForBilling | null
) {
  const isDefault = !!initialData && organizationId !== null;

  return useQuery({
    queryKey: ["subscription", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const res = await fetch(
        `/api/subscriptions?organizationId=${organizationId}`
      );
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch subscription");
      }
      return res.json();
    },
    initialData: isDefault ? (initialData ?? undefined) : undefined,
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useUsage(
  organizationId: string | null,
  initialData?: UsageForBilling | null
) {
  const isDefault = !!initialData && organizationId !== null;

  return useQuery({
    queryKey: ["usage", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const res = await fetch(`/api/usage?organizationId=${organizationId}`);
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    initialData: isDefault ? (initialData ?? undefined) : undefined,
    enabled: !!organizationId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      planId,
    }: {
      organizationId: string;
      planId: string;
    }) => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create subscription");
      }
      const data = await res.json();
      if (data.message && data.message.includes("Free plan")) {
        window.location.reload();
        return data;
      }
      if (data.url) {
        window.location.href = data.url;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", variables.organizationId],
      });
    },
  });
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, action: "manage" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to manage subscription");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL received from server");
      }
      return data;
    },
  });
}

export function useSyncSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, action: "sync" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to sync subscription");
      }
      return res.json();
    },
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", organizationId],
      });
    },
  });
}
