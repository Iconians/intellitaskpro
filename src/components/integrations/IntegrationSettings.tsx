"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IntegrationProvider } from "@prisma/client";
import { ProviderConfigSection } from "./ProviderConfigSection";
import { ProviderSetupInstructions } from "./ProviderSetupInstructions";
import { IntegrationCardShell } from "./IntegrationCardShell";
import type { Integration, IntegrationSettingsProps } from "./types";

const PROVIDER_OPTIONS = [
  {
    provider: IntegrationProvider.SLACK,
    title: "Add Slack",
    description: "Receive notifications in Slack channels",
  },
  {
    provider: IntegrationProvider.JIRA,
    title: "Add Jira",
    description: "Sync tasks with Jira issues",
  },
  {
    provider: IntegrationProvider.LINEAR,
    title: "Add Linear",
    description: "Sync tasks with Linear issues",
  },
  {
    provider: IntegrationProvider.ZAPIER,
    title: "Add Zapier",
    description: "Connect with 6000+ apps via Zapier",
  },
] as const;

function buildWebhookUrl(provider: IntegrationProvider, organizationId: string) {
  if (typeof window === "undefined") return null;

  const baseUrl = window.location.origin;
  if (provider === IntegrationProvider.SLACK) {
    return `${baseUrl}/api/integrations/slack/webhook?organizationId=${organizationId}`;
  }
  if (provider === IntegrationProvider.JIRA) {
    return `${baseUrl}/api/integrations/jira/webhook?organizationId=${organizationId}`;
  }
  if (provider === IntegrationProvider.LINEAR) {
    return `${baseUrl}/api/integrations/linear/webhook?organizationId=${organizationId}`;
  }
  return null;
}

export function IntegrationSettings({ organizationId }: IntegrationSettingsProps) {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [editingIntegrationId, setEditingIntegrationId] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [showInstructions, setShowInstructions] = useState<IntegrationProvider | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: integrations, error: integrationsError } = useQuery({
    queryKey: ["integrations", organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations?organizationId=${organizationId}`);
      if (!res.ok) {
        // Return empty array if error - integrations are optional
        console.warn("Failed to fetch integrations:", res.statusText);
        return [] as Integration[];
      }
      return res.json() as Promise<Integration[]>;
    },
    retry: false, // Don't retry on error
  });

  const createMutation = useMutation({
    mutationFn: async (data: { provider: IntegrationProvider; config: Record<string, unknown> }) => {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          provider: data.provider,
          config: data.config,
        }),
      });
      if (!res.ok) throw new Error("Failed to create integration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", organizationId] });
      setSelectedProvider(null);
      setEditingIntegrationId(null);
      setConfig({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, config: newConfig, isActive }: { id: string; config?: Record<string, unknown>; isActive?: boolean }) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig, isActive }),
      });
      if (!res.ok) throw new Error("Failed to update integration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", organizationId] });
      setEditingIntegrationId(null);
      setSelectedProvider(null);
      setConfig({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete integration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", organizationId] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async ({ integrationId, action, payload }: { integrationId: string; action: string; payload?: Record<string, unknown> }) => {
      try {
        const res = await fetch(`/api/integrations/${integrationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            payload,
          }),
        });
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: "Test failed" }));
          throw new Error(error.error || "Test failed");
        }
        return res.json();
      } catch (error) {
        // Handle network errors gracefully
        throw error instanceof Error ? error : new Error("Network error");
      }
    },
  });

  const handleSave = () => {
    if (!selectedProvider) return;
    if (editingIntegrationId) {
      const existing = existingIntegrations.find((i) => i.id === editingIntegrationId);
      const existingConfig = (existing?.config || {}) as Record<string, unknown>;
      const secretKeys = ["signingSecret", "webhookSecret", "apiToken", "apiKey"];
      const mergedConfig = { ...config };
      for (const key of secretKeys) {
        if (mergedConfig[key] === "" && existingConfig[key]) {
          mergedConfig[key] = existingConfig[key];
        }
      }
      updateMutation.mutate({
        id: editingIntegrationId,
        config: mergedConfig,
      });
      setEditingIntegrationId(null);
    } else {
      createMutation.mutate({ provider: selectedProvider, config });
    }
  };

  const handleTest = async (integration: Integration) => {
    testMutation.mutate({
      integrationId: integration.id,
      action: "test",
    });
  };

  const handleCopyWebhookUrl = (provider: IntegrationProvider) => {
    const url = buildWebhookUrl(provider, organizationId);
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(provider);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const existingIntegrations = integrations || [];

  if (integrationsError) {
    // Silently handle errors - integrations are optional
    console.warn("Integrations not available:", integrationsError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Integrations (Optional)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your project management tools with external services. Configure API keys when ready.
        </p>
      </div>

      {/* Existing Integrations */}
      <div className="space-y-4">
        {existingIntegrations.map((integration) => {
          const webhookUrl = buildWebhookUrl(integration.provider, organizationId);
          return (
            <IntegrationCardShell
              key={integration.id}
              header={(
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{integration.provider}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {integration.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              )}
              actions={(
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEditingIntegrationId(integration.id);
                      setSelectedProvider(integration.provider);
                      setConfig(integration.config || {});
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTest(integration)}
                    disabled={testMutation.isPending}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {testMutation.isPending ? "Testing..." : "Test"}
                  </button>
                  <button
                    onClick={() =>
                      updateMutation.mutate({ id: integration.id, isActive: !integration.isActive })
                    }
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      integration.isActive
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {integration.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this integration?")) {
                        deleteMutation.mutate(integration.id);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </div>
              )}
            >
              {webhookUrl && integration.isActive && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                    📡 Webhook URL (for {integration.provider} to send events to your app)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-2 text-xs border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                      onClick={(event) => (event.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => handleCopyWebhookUrl(integration.provider)}
                      className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                      {copiedUrl === integration.provider ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                    Copy this URL and configure it in your {integration.provider} workspace settings
                  </p>
                </div>
              )}

              <div className="mt-3">
                <button
                  onClick={() =>
                    setShowInstructions(
                      showInstructions === integration.provider ? null : integration.provider
                    )
                  }
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showInstructions === integration.provider ? "▼" : "▶"} Setup Instructions
                </button>
                {showInstructions === integration.provider && (
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 text-xs space-y-3">
                    <ProviderSetupInstructions provider={integration.provider} webhookUrl={webhookUrl} />
                  </div>
                )}
              </div>

              {testMutation.isError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {testMutation.error?.message || "Test failed"}
                </p>
              )}
              {testMutation.isSuccess && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">Test successful!</p>
              )}
            </IntegrationCardShell>
          );
        })}
      </div>

      {/* Add New Integration */}
      {!selectedProvider ? (
        <div>
          {PROVIDER_OPTIONS.map((option, index) => (
            <button
              key={option.provider}
              onClick={() => setSelectedProvider(option.provider)}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left ${
                index > 0 ? "mt-2" : ""
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{option.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {editingIntegrationId ? `Edit ${selectedProvider}` : `Configure ${selectedProvider}`}
            </h4>
            <button
              onClick={() => {
                setSelectedProvider(null);
                setEditingIntegrationId(null);
                setConfig({});
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
          <ProviderConfigSection
            provider={selectedProvider}
            config={config}
            onConfigChange={setConfig}
          />

          {/* Show webhook URL for providers that need it */}
          {selectedProvider && selectedProvider !== IntegrationProvider.ZAPIER && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                📡 Your Webhook URL (for {selectedProvider} to send events to your app)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={buildWebhookUrl(selectedProvider, organizationId) || ""}
                  className="flex-1 px-3 py-2 text-xs border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => selectedProvider && handleCopyWebhookUrl(selectedProvider)}
                  className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                >
                  {copiedUrl === selectedProvider ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                After saving your credentials, copy this URL and configure it in your {selectedProvider} workspace
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {editingIntegrationId
                ? (updateMutation.isPending ? "Updating..." : "Update")
                : (createMutation.isPending ? "Saving..." : "Save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
