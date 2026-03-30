"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import type {
  PlanForBilling,
  SerializedSubscriptionForBilling,
  UsageForBilling,
} from "@/lib/data/billing";
import {
  applySyncSubscriptionOnSuccess,
  fetchSubscriptionForOrg,
  fetchUsageForOrg,
  patchManageSubscription,
  patchSyncSubscription,
  postCreateSubscription,
} from "@/lib/subscription-client";

export interface BillingPageClientProps {
  organizations: Array<{ id: string; name: string }>;
  plans: PlanForBilling[];
  initialSubscription: SerializedSubscriptionForBilling | null;
  initialUsage: UsageForBilling;
  defaultOrgId: string;
}

function shouldAutoSyncStripeSubscription(
  subscription: {
    stripeSubscriptionId?: string | null;
    plan?: { name?: string | null } | null;
  } | null | undefined,
  syncPending: boolean,
  syncSuccess: boolean
): boolean {
  return Boolean(
    subscription?.stripeSubscriptionId &&
      subscription.plan?.name === "Free" &&
      !syncPending &&
      !syncSuccess
  );
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
    queryFn: () =>
      !selectedOrgId
        ? Promise.resolve(null)
        : fetchSubscriptionForOrg(selectedOrgId),
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
    queryFn: () =>
      !selectedOrgId
        ? Promise.resolve(null)
        : fetchUsageForOrg(selectedOrgId),
    initialData:
      selectedOrgId === defaultOrgId ? initialUsage : undefined,
    enabled: !!selectedOrgId,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: postCreateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", selectedOrgId],
      });
    },
  });

  const manageSubscriptionMutation = useMutation({
    mutationFn: patchManageSubscription,
    onError: (error: Error) => {
      alert(`Failed to manage subscription: ${error.message}`);
    },
  });

  const syncSubscriptionMutation = useMutation({
    mutationFn: patchSyncSubscription,
    onSuccess: (data) => {
      applySyncSubscriptionOnSuccess(queryClient, selectedOrgId, data);
    },
    onError: (error: Error) => {
      alert(`Failed to sync subscription: ${error.message}`);
    },
  });

  useRealtime({
    channelName: selectedOrgId ? `private-organization-${selectedOrgId}` : "",
    eventName: "subscription-updated",
    callback: () => {
      if (!selectedOrgId) return;
      queryClient.invalidateQueries({
        queryKey: ["subscription", selectedOrgId],
      });
      queryClient.refetchQueries({
        queryKey: ["subscription", selectedOrgId],
      });
    },
  });

  useEffect(() => {
    if (
      !selectedOrgId ||
      !shouldAutoSyncStripeSubscription(
        subscription,
        syncSubscriptionMutation.isPending,
        syncSubscriptionMutation.isSuccess
      )
    ) {
      return;
    }
    syncSubscriptionMutation.mutate(selectedOrgId);
  }, [subscription, selectedOrgId, syncSubscriptionMutation]);

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
