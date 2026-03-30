"use client";

import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import {
  useAnalyticsPage,
  type AnalyticsPageClientProps,
} from "@/hooks/useAnalyticsPage";

export type { AnalyticsPageClientProps };

export function AnalyticsPageClient(props: AnalyticsPageClientProps) {
  const state = useAnalyticsPage(props);
  return <AnalyticsPageView {...props} {...state} />;
}
