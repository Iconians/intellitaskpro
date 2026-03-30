"use client";

import { AuditLogsPageView } from "@/components/audit-logs/AuditLogsPageView";
import {
  useAuditLogsPage,
  type AuditLogsPageClientProps,
} from "@/hooks/useAuditLogsPage";

export type { AuditLogsPageClientProps };

export function AuditLogsPageClient(props: AuditLogsPageClientProps) {
  const state = useAuditLogsPage(props);
  return <AuditLogsPageView {...state} />;
}
