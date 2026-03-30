"use client";

import { BillingPageView } from "@/components/billing/BillingPageView";
import {
  useBillingPage,
  type BillingPageClientProps,
} from "@/hooks/useBillingPage";

export type { BillingPageClientProps };

export function BillingPageClient(props: BillingPageClientProps) {
  const state = useBillingPage(props);
  return <BillingPageView {...state} />;
}
