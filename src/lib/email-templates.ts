import { baseUrl } from "@/lib/email-core";

type EmailTemplate = { subject: string; html: string };

const wrap = (title: string, body: string) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>${title}</h1>
      ${body}
    </body>
  </html>
`;

export const emailTemplates = {
  verification: (name: string | null, token: string): EmailTemplate => ({
    subject: "Verify your email address",
    html: wrap(
      "Verify Your Email",
      `<p>Hi ${name || "there"},</p><p>Please verify your email address.</p><p><a href="${baseUrl}/api/auth/verify-email?token=${token}">Verify Email</a></p>`
    ),
  }),
  passwordReset: (name: string | null, token: string): EmailTemplate => ({
    subject: "Reset your password",
    html: wrap(
      "Reset Your Password",
      `<p>Hi ${name || "there"},</p><p>Reset your password using this link:</p><p><a href="${baseUrl}/reset-password?token=${token}">Reset Password</a></p>`
    ),
  }),
  passwordChanged: (name: string | null): EmailTemplate => ({
    subject: "Your password has been changed",
    html: wrap(
      "Password Changed",
      `<p>Hi ${name || "there"},</p><p>Your password has been successfully changed.</p>`
    ),
  }),
  welcome: (name: string | null, organizationName: string): EmailTemplate => ({
    subject: "Welcome to AI-Powered Project Management!",
    html: wrap(
      "Welcome!",
      `<p>Hi ${name || "there"},</p><p>Welcome! Your organization <strong>${organizationName}</strong> has been created.</p><p><a href="${baseUrl}/boards">Get Started</a></p>`
    ),
  }),
  subscriptionWelcome: (
    name: string | null,
    organizationName: string,
    planName: string
  ): EmailTemplate => ({
    subject: `Welcome to ${planName}!`,
    html: wrap(
      "Subscription Activated",
      `<p>Hi ${name || "there"},</p><p>Your organization <strong>${organizationName}</strong> is now on <strong>${planName}</strong>.</p><p><a href="${baseUrl}/boards">Start Using Features</a></p>`
    ),
  }),
  subscriptionRequired: (
    name: string | null,
    organizationName: string
  ): EmailTemplate => ({
    subject: "Upgrade to unlock AI features",
    html: wrap(
      "Unlock AI Features",
      `<p>Hi ${name || "there"},</p><p><strong>${organizationName}</strong> is on the Free plan. Upgrade to access AI features.</p><p><a href="${baseUrl}/billing">Upgrade Now</a></p>`
    ),
  }),
  taskAssignment: (
    name: string | null,
    taskTitle: string,
    boardName: string
  ): EmailTemplate => ({
    subject: `You've been assigned to: ${taskTitle}`,
    html: wrap(
      "New Task Assignment",
      `<p>Hi ${name || "there"},</p><p>You were assigned to <strong>${taskTitle}</strong> on <strong>${boardName}</strong>.</p><p><a href="${baseUrl}/boards">View Task</a></p>`
    ),
  }),
  boardInvitation: (
    inviterName: string | null,
    boardName: string,
    token: string
  ): EmailTemplate => ({
    subject: `You've been invited to ${boardName}`,
    html: wrap(
      "Board Invitation",
      `<p><strong>${inviterName || "Someone"}</strong> invited you to join <strong>${boardName}</strong>.</p><p><a href="${baseUrl}/api/boards/invite/accept?token=${token}">Accept Invitation</a></p>`
    ),
  }),
  organizationInvitation: (
    inviterName: string | null,
    organizationName: string,
    token: string
  ): EmailTemplate => ({
    subject: `You've been invited to ${organizationName}`,
    html: wrap(
      "Organization Invitation",
      `<p><strong>${inviterName || "Someone"}</strong> invited you to join <strong>${organizationName}</strong>.</p><p><a href="${baseUrl}/invite/accept?token=${token}">Accept Invitation</a></p>`
    ),
  }),
  paymentFailed: (name: string | null, organizationName: string): EmailTemplate => ({
    subject: "Payment failed - Action required",
    html: wrap(
      "Payment Failed",
      `<p>Hi ${name || "there"},</p><p>We were unable to process payment for <strong>${organizationName}</strong>.</p><p><a href="${baseUrl}/billing">Update Payment Method</a></p>`
    ),
  }),
  subscriptionCancelled: (
    name: string | null,
    organizationName: string,
    planName: string
  ): EmailTemplate => ({
    subject: "Subscription cancelled",
    html: wrap(
      "Subscription Cancelled",
      `<p>Hi ${name || "there"},</p><p>Your <strong>${planName}</strong> subscription for <strong>${organizationName}</strong> has been cancelled.</p><p><a href="${baseUrl}/billing">Manage Subscription</a></p>`
    ),
  }),
};
