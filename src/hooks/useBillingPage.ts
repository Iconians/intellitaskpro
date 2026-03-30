"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import type {
  PlanForBilling,
  SerializedSubscriptionForBilling,
  UsageForBilling,
} from "@/lib/data/billing";

export interface BillingPageClientProps {
  organizations: Array<{ id: string; name: string }>;
  plans: PlanForBilling[];
  initialSubscription: SerializedSubscriptionForBilling | null;
  initialUsage: UsageForBilling;
  defaultOrgId: string;
}

export function useBillingPage({
  organizations,
  plans,
  initialSubscription,
  initialUsage,
  defaultOrgId,
}: BillingPageClientProps) {
  const queryClient = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string>(defaultOrgId);

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", selectedOrgId],
    queryFn: async () => {
      if (!selectedOrgId) return null;
      const res = await fetch(
        `/api/subscriptions?organizationId=${selectedOrgId}`
      );
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch subscription");
      }
      return res.json();
    },
    initialData:
      selectedOrgId === defaultOrgId
        ? (initialSubscription ?? undefined)
        : undefined,
    enabled: !!selectedOrgId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { data: usage } = useQuery({
    queryKey: ["usage", selectedOrgId],
    queryFn: async () => {
      if (!selectedOrgId) return null;
      const res = await fetch(`/api/usage?organizationId=${selectedOrgId}`);
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    initialData:
      selectedOrgId === defaultOrgId ? initialUsage : undefined,
    enabled: !!selectedOrgId,
  });

  const createSubscriptionMutation = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", selectedOrgId],
      });
    },
  });

  const manageSubscriptionMutation = useMutation({
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
    onError: (error: Error) => {
      alert(`Failed to manage subscription: ${error.message}`);
    },
  });

  const syncSubscriptionMutation = useMutation({
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", selectedOrgId],
      });
      if (data?.subscription) {
        if (!data.subscription.plan) {
          queryClient.invalidateQueries({
            queryKey: ["subscription", selectedOrgId],
          });
          return;
        }
        queryClient.setQueryData(
          ["subscription", selectedOrgId],
          data.subscription
        );
      }
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ["subscription", selectedOrgId],
        });
      }, 500);
    },
    onError: (error: Error) => {
      alert(`Failed to sync subscription: ${error.message}`);
    },
  });

  useRealtime({
    channelName: selectedOrgId ? `private-organization-${selectedOrgId}` : "",
    eventName: "subscription-updated",
    callback: () => {
      if (selectedOrgId) {
        queryClient.invalidateQueries({
          queryKey: ["subscription", selectedOrgId],
        });
        queryClient.refetchQueries({
          queryKey: ["subscription", selectedOrgId],
        });
      }
    },
  });

  useEffect(() => {
    if (
      subscription?.stripeSubscriptionId &&
      subscription.plan?.name === "Free" &&
      selectedOrgId &&
      !syncSubscriptionMutation.isPending &&
      !syncSubscriptionMutation.isSuccess
    ) {
      syncSubscriptionMutation.mutate(selectedOrgId);
    }
  }, [
    subscription?.stripeSubscriptionId,
    subscription?.plan?.name,
    selectedOrgId,
    syncSubscriptionMutation,
  ]);

  const currentPlan =
    subscription?.plan ||
    (plans ? plans.find((p) => p.name === "Free") ?? null : null);
  const actualCounts = usage?.actualCounts ?? {
    boards: 0,
    members: 0,
    tasks: 0,
  };

  return {
    organizations,
    plans,
    selectedOrgId,
    setSelectedOrgId,
    subscription,
    isLoadingSubscription,
    currentPlan,
    actualCounts,
    createSubscriptionMutation,
    manageSubscriptionMutation,
  };
}

export type UseBillingPageResult = ReturnType<typeof useBillingPage>;
