import type { SerializedAuditLog } from "@/lib/data/audit-logs";

interface AuditLogsTableProps {
  logs: SerializedAuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Action
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Entity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Changes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {log.user.name || log.user.email}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {log.entityType} ({log.entityId.slice(0, 8)}...)
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {log.changes ? (
                  <details>
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                      View changes
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-w-md">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </details>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
