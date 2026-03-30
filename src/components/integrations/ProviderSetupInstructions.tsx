import { IntegrationProvider } from "@prisma/client";

interface ProviderSetupInstructionsProps {
  provider: IntegrationProvider;
  webhookUrl: string | null;
}

function ExternalLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {text}
    </a>
  );
}

export function ProviderSetupInstructions({
  provider,
  webhookUrl,
}: ProviderSetupInstructionsProps) {
  if (provider === IntegrationProvider.SLACK) {
    return (
      <>
        <div>
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Step 1: Create Slack Webhook (for notifications TO Slack)
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
            <li>
              Go to{" "}
              <ExternalLink
                href="https://api.slack.com/apps"
                text="api.slack.com/apps"
              />
            </li>
            <li>Create a new app or select existing</li>
            <li>Enable &quot;Incoming Webhooks&quot;</li>
            <li>Add webhook to workspace and copy the webhook URL</li>
            <li>Paste it in the Webhook URL field above</li>
          </ol>
        </div>
        {webhookUrl && (
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              Step 2: Configure Webhook URL in Slack (for events FROM Slack)
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
              <li>
                In your Slack app settings, go to &quot;Interactivity &amp;
                Shortcuts&quot; or &quot;Slash Commands&quot;
              </li>
              <li>Copy the Webhook URL shown above</li>
              <li>Paste it as the Request URL in Slack</li>
            </ol>
            <p className="font-medium text-gray-900 dark:text-white mt-2 mb-1">
              Step 3: Add Signing secret
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
              <li>
                In Slack app: Basic Information → App Credentials → Signing
                Secret
              </li>
              <li>Copy the signing secret and paste it in the field above</li>
            </ol>
          </div>
        )}
      </>
    );
  }

  if (provider === IntegrationProvider.JIRA) {
    return (
      <>
        <div>
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Step 1: Create Jira API Token
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
            <li>
              Go to{" "}
              <ExternalLink
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                text="Atlassian API Tokens"
              />
            </li>
            <li>Create a new API token</li>
            <li>Copy the token and paste it above</li>
          </ol>
        </div>
        {webhookUrl && (
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              Step 2: Configure Webhook in Jira
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
              <li>In Jira: Settings → System → Webhooks</li>
              <li>
                Create a new webhook and paste the Webhook URL shown above
              </li>
              <li>Select events: Issue Created, Issue Updated</li>
              <li>
                If Jira provides a shared secret, paste it in the webhook secret
                field
              </li>
            </ol>
          </div>
        )}
      </>
    );
  }

  if (provider === IntegrationProvider.LINEAR) {
    return (
      <>
        <div>
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Step 1: Create Linear API Key
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
            <li>
              Go to{" "}
              <ExternalLink
                href="https://linear.app/settings/api"
                text="Linear API Settings"
              />
            </li>
            <li>Create a new API key</li>
            <li>
              Copy the key (starts with{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                lin_api_
              </code>
              )
            </li>
            <li>Paste it above along with your Team ID</li>
          </ol>
        </div>
        {webhookUrl && (
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              Step 2: Configure Webhook in Linear
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
              <li>In Linear: Settings → API → Webhooks</li>
              <li>Create a new webhook</li>
              <li>Copy the Webhook URL shown above into Linear</li>
              <li>Copy the webhook secret and paste it in the field above</li>
              <li>Select events: Issue Created, Issue Updated</li>
            </ol>
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <p className="font-medium text-gray-900 dark:text-white mb-1">
        Zapier Setup
      </p>
      <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
        <li>
          Go to <ExternalLink href="https://zapier.com" text="Zapier" /> and
          create a Zap
        </li>
        <li>Choose &quot;Webhooks by Zapier&quot; as the trigger</li>
        <li>Select &quot;Catch Hook&quot;</li>
        <li>Copy the webhook URL from Zapier</li>
        <li>Paste it in the Webhook URL field above</li>
        <li>Task create/update events will be sent to your webhook</li>
      </ol>
    </div>
  );
}
