"use client";

import { useState } from "react";
import type { AnalyticsPayload } from "@/lib/data/analytics";

export interface AnalyticsPageClientProps {
  organizations: Array<{ id: string; name: string }>;
  initialAnalytics: AnalyticsPayload | null;
  defaultOrganizationId: string;
}

export function useAnalyticsPage({
  organizations,
}: AnalyticsPageClientProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || ""
  );
  return { selectedOrgId, setSelectedOrgId };
}

export type UseAnalyticsPageResult = ReturnType<typeof useAnalyticsPage>;
