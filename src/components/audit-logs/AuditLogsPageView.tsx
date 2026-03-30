import type { UseAuditLogsPageResult } from "@/hooks/useAuditLogsPage";
import { AuditLogsTable } from "./AuditLogsTable";

type AuditLogsPageViewProps = UseAuditLogsPageResult;

export function AuditLogsPageView({
  organizations,
  selectedOrgId,
  setSelectedOrgId,
  entityType,
  setEntityType,
  auditLogs,
  isLoading,
}: AuditLogsPageViewProps) {
  if (organizations.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be an organization admin to view audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Audit Logs
      </h1>

      <div className="mb-4 flex gap-4 items-center">
        <select
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Entities</option>
          <option value="TASK">Tasks</option>
          <option value="BOARD">Boards</option>
          <option value="MEMBER">Members</option>
          <option value="ORGANIZATION">Organizations</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading audit logs...</div>
      ) : auditLogs && auditLogs.length > 0 ? (
        <AuditLogsTable logs={auditLogs} />
      ) : (
        <div className="text-gray-500">No audit logs found</div>
      )}
    </div>
  );
}
