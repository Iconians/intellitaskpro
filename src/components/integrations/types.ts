import { IntegrationProvider } from "@prisma/client";

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSettingsProps {
  organizationId: string;
}
