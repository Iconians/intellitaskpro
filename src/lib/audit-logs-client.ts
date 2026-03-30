import { fetchJsonOrThrow } from "@/lib/http-client";
import type { SerializedAuditLog } from "@/lib/data/audit-logs";

export function buildAuditLogsQueryParams(
  organizationId: string,
  entityType: string
): URLSearchParams {
  const params = new URLSearchParams({
    organizationId,
    limit: "100",
  });
  if (entityType !== "all") {
    params.append("entityType", entityType);
  }
  return params;
}

export async function fetchAuditLogsForOrg(
  organizationId: string,
  entityType: string
): Promise<SerializedAuditLog[]> {
  const params = buildAuditLogsQueryParams(organizationId, entityType);
  const res = await fetch(`/api/audit-logs?${params.toString()}`);
  return fetchJsonOrThrow(res, "Failed to fetch audit logs");
}
