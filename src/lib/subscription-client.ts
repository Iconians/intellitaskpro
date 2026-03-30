import type { QueryClient } from "@tanstack/react-query";

import type {
  SerializedSubscriptionForBilling,
  UsageForBilling,
} from "@/lib/data/billing";
import { fetchJsonOrThrow } from "@/lib/http-client";

export async function fetchSubscriptionForOrg(
  organizationId: string
): Promise<SerializedSubscriptionForBilling | null> {
  const res = await fetch(
    `/api/subscriptions?organizationId=${organizationId}`
  );
  if (res.status === 404) return null;
  return fetchJsonOrThrow<SerializedSubscriptionForBilling>(
    res,
    "Failed to fetch subscription"
  );
}

export async function fetchUsageForOrg(
  organizationId: string
): Promise<UsageForBilling> {
  const res = await fetch(`/api/usage?organizationId=${organizationId}`);
  return fetchJsonOrThrow<UsageForBilling>(res, "Failed to fetch usage");
}

export function applyCreateSubscriptionRedirects(data: unknown): void {
  if (!data || typeof data !== "object") return;
  const d = data as { message?: string; url?: string };
  if (d.message?.includes("Free plan")) {
    window.location.reload();
    return;
  }
  if (d.url) window.location.href = d.url;
}

export async function postCreateSubscription(params: {
  organizationId: string;
  planId: string;
}): Promise<unknown> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await fetchJsonOrThrow<unknown>(
    res,
    "Failed to create subscription"
  );
  applyCreateSubscriptionRedirects(data);
  return data;
}

export async function patchManageSubscription(
  organizationId: string
): Promise<unknown> {
  const res = await fetch("/api/subscriptions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, action: "manage" }),
  });
  const data = await fetchJsonOrThrow<unknown>(
    res,
    "Failed to manage subscription"
  );
  if (
    typeof data === "object" &&
    data !== null &&
    "url" in data &&
    typeof (data as { url: unknown }).url === "string"
  ) {
    window.location.href = (data as { url: string }).url;
  } else {
    throw new Error("No redirect URL received from server");
  }
  return data;
}

export async function patchSyncSubscription(
  organizationId: string
): Promise<unknown> {
  const res = await fetch("/api/subscriptions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, action: "sync" }),
  });
  return fetchJsonOrThrow(res, "Failed to sync subscription");
}

function subscriptionFromSyncPayload(
  data: unknown
): { plan?: unknown } | null {
  if (!data || typeof data !== "object") return null;
  if (!("subscription" in data)) return null;
  const sub = (data as { subscription: unknown }).subscription;
  if (!sub || typeof sub !== "object") return null;
  return sub as { plan?: unknown };
}

export function applySyncSubscriptionOnSuccess(
  queryClient: QueryClient,
  orgId: string,
  data: unknown
): void {
  queryClient.invalidateQueries({ queryKey: ["subscription", orgId] });
  const sub = subscriptionFromSyncPayload(data);
  if (sub && !sub.plan) {
    queryClient.invalidateQueries({ queryKey: ["subscription", orgId] });
    return;
  }
  if (sub) {
    queryClient.setQueryData(["subscription", orgId], sub);
  }
  setTimeout(() => {
    queryClient.refetchQueries({ queryKey: ["subscription", orgId] });
  }, 500);
}
