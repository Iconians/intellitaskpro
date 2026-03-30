import { IntegrationProvider } from "@prisma/client";

interface ProviderConfigSectionProps {
  provider: IntegrationProvider;
  config: Record<string, unknown>;
  onConfigChange: (nextConfig: Record<string, unknown>) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password" | "email";
  required?: boolean;
  hint?: string;
}

function ProviderField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

function SlackConfig({
  config,
  onConfigChange,
}: Omit<ProviderConfigSectionProps, "provider">) {
  return (
    <div className="space-y-4">
      <ProviderField
        label="Webhook URL"
        required
        value={String(config.webhookUrl ?? "")}
        onChange={(value) => onConfigChange({ ...config, webhookUrl: value })}
        placeholder="https://hooks.slack.com/services/..."
        hint="For sending notifications from this app to Slack"
      />
      <ProviderField
        label="Signing secret (for incoming webhooks)"
        type="password"
        value={String(config.signingSecret ?? "")}
        onChange={(value) =>
          onConfigChange({ ...config, signingSecret: value })
        }
        placeholder="Optional: paste from Slack app → Basic Information → Signing Secret"
        hint="Required to verify requests from Slack (slash commands, events)."
      />
      <ProviderField
        label="Channel (optional)"
        value={String(config.channel ?? "")}
        onChange={(value) => onConfigChange({ ...config, channel: value })}
        placeholder="#general"
      />
      <ProviderField
        label="Username (optional)"
        value={String(config.username ?? "")}
        onChange={(value) => onConfigChange({ ...config, username: value })}
        placeholder="Project Management"
      />
    </div>
  );
}

function JiraConfig({
  config,
  onConfigChange,
}: Omit<ProviderConfigSectionProps, "provider">) {
  return (
    <div className="space-y-4">
      <ProviderField
        label="Base URL"
        required
        value={String(config.baseUrl ?? "")}
        onChange={(value) => onConfigChange({ ...config, baseUrl: value })}
        placeholder="https://yourcompany.atlassian.net"
      />
      <ProviderField
        label="Email"
        type="email"
        required
        value={String(config.email ?? "")}
        onChange={(value) => onConfigChange({ ...config, email: value })}
        placeholder="your@email.com"
      />
      <ProviderField
        label="API Token"
        type="password"
        required
        value={String(config.apiToken ?? "")}
        onChange={(value) => onConfigChange({ ...config, apiToken: value })}
        placeholder="Your Jira API token"
      />
      <ProviderField
        label="Project Key"
        required
        value={String(config.projectKey ?? "")}
        onChange={(value) => onConfigChange({ ...config, projectKey: value })}
        placeholder="PROJ"
      />
      <ProviderField
        label="Webhook secret (optional, for incoming webhooks)"
        type="password"
        value={String(config.webhookSecret ?? "")}
        onChange={(value) =>
          onConfigChange({ ...config, webhookSecret: value })
        }
        placeholder="If Jira webhook uses a shared secret, paste it here"
        hint="Used to verify incoming webhooks from Jira when configured."
      />
    </div>
  );
}

function LinearConfig({
  config,
  onConfigChange,
}: Omit<ProviderConfigSectionProps, "provider">) {
  return (
    <div className="space-y-4">
      <ProviderField
        label="API Key"
        type="password"
        required
        value={String(config.apiKey ?? "")}
        onChange={(value) => onConfigChange({ ...config, apiKey: value })}
        placeholder="lin_api_..."
      />
      <ProviderField
        label="Team ID"
        required
        value={String(config.teamId ?? "")}
        onChange={(value) => onConfigChange({ ...config, teamId: value })}
        placeholder="Team UUID"
      />
      <ProviderField
        label="Webhook secret (for incoming webhooks)"
        type="password"
        value={String(config.webhookSecret ?? "")}
        onChange={(value) =>
          onConfigChange({ ...config, webhookSecret: value })
        }
        placeholder="Paste the secret from Linear webhook settings"
        hint="Copy this from Linear webhook settings so incoming requests can be verified."
      />
    </div>
  );
}

function ZapierConfig({
  config,
  onConfigChange,
}: Omit<ProviderConfigSectionProps, "provider">) {
  return (
    <div className="space-y-4">
      <ProviderField
        label="Webhook URL"
        required
        value={String(config.webhookUrl ?? "")}
        onChange={(value) => onConfigChange({ ...config, webhookUrl: value })}
        placeholder="https://hooks.zapier.com/hooks/catch/..."
        hint="From Zapier: Webhooks by Zapier → Catch Hook. Keep this URL private."
      />
    </div>
  );
}

export function ProviderConfigSection({
  provider,
  config,
  onConfigChange,
}: ProviderConfigSectionProps) {
  if (provider === IntegrationProvider.SLACK) {
    return <SlackConfig config={config} onConfigChange={onConfigChange} />;
  }

  if (provider === IntegrationProvider.JIRA) {
    return <JiraConfig config={config} onConfigChange={onConfigChange} />;
  }

  if (provider === IntegrationProvider.LINEAR) {
    return <LinearConfig config={config} onConfigChange={onConfigChange} />;
  }

  if (provider === IntegrationProvider.ZAPIER) {
    return <ZapierConfig config={config} onConfigChange={onConfigChange} />;
  }

  return null;
}
