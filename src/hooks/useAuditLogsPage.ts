"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SerializedAuditLog } from "@/lib/data/audit-logs";
import { fetchAuditLogsForOrg } from "@/lib/audit-logs-client";

export interface AuditLogsPageClientProps {
  organizations: Array<{ id: string; name: string }>;
  initialAuditLogs: SerializedAuditLog[];
  defaultOrganizationId: string;
}

export function useAuditLogsPage({
  organizations,
  initialAuditLogs,
  defaultOrganizationId,
}: AuditLogsPageClientProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || ""
  );
  const [entityType, setEntityType] = useState<string>("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs", selectedOrgId, entityType],
    queryFn: () =>
      !selectedOrgId
        ? Promise.resolve([])
        : fetchAuditLogsForOrg(selectedOrgId, entityType),
    enabled: !!selectedOrgId && organizations.length > 0,
    initialData:
      selectedOrgId === defaultOrganizationId && entityType === "all"
        ? initialAuditLogs
        : undefined,
  });

  return {
    organizations,
    selectedOrgId,
    setSelectedOrgId,
    entityType,
    setEntityType,
    auditLogs,
    isLoading,
  };
}

export type UseAuditLogsPageResult = ReturnType<typeof useAuditLogsPage>;
