import type { ReactNode } from "react";

interface IntegrationCardShellProps {
  header: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function IntegrationCardShell({
  header,
  actions,
  children,
  footer,
}: IntegrationCardShellProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {header}
        {actions}
      </div>
      {children}
      {footer}
    </div>
  );
}
