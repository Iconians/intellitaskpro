import { sendEmail } from "@/lib/email-core";
import { emailTemplates } from "@/lib/email-templates";

export async function sendEmailVerificationEmail(
  user: { email: string; name: string | null },
  token: string
) {
  const template = emailTemplates.verification(user.name, token);
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendPasswordResetEmail(
  user: { email: string; name: string | null },
  token: string
) {
  const template = emailTemplates.passwordReset(user.name, token);
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendPasswordChangedEmail(user: {
  email: string;
  name: string | null;
}) {
  const template = emailTemplates.passwordChanged(user.name);
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendWelcomeEmail(
  user: { email: string; name: string | null },
  organization: { name: string }
) {
  const template = emailTemplates.welcome(user.name, organization.name);
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendSubscriptionWelcomeEmail(
  user: { email: string; name: string | null },
  organization: { name: string },
  plan: { name: string }
) {
  const template = emailTemplates.subscriptionWelcome(
    user.name,
    organization.name,
    plan.name
  );
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendSubscriptionRequiredEmail(
  user: { email: string; name: string | null },
  organization: { name: string }
) {
  const template = emailTemplates.subscriptionRequired(
    user.name,
    organization.name
  );
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendTaskAssignmentEmail(
  assignee: { email: string; name: string | null },
  task: { title: string },
  board: { name: string }
) {
  const template = emailTemplates.taskAssignment(
    assignee.name,
    task.title,
    board.name
  );
  await sendEmail(assignee.email, template.subject, template.html);
}

export async function sendBoardInvitationEmail(
  inviter: { name: string | null },
  board: { name: string },
  inviteeEmail: string,
  token: string
) {
  const template = emailTemplates.boardInvitation(
    inviter.name,
    board.name,
    token
  );
  await sendEmail(inviteeEmail, template.subject, template.html);
}

export async function sendOrganizationInvitationEmail(
  inviter: { name: string | null },
  organization: { name: string },
  inviteeEmail: string,
  token: string
) {
  const template = emailTemplates.organizationInvitation(
    inviter.name,
    organization.name,
    token
  );
  await sendEmail(inviteeEmail, template.subject, template.html);
}

export async function sendPaymentFailedEmail(
  user: { email: string; name: string | null },
  organization: { name: string },
  _subscription: { id: string }
) {
  const template = emailTemplates.paymentFailed(user.name, organization.name);
  await sendEmail(user.email, template.subject, template.html);
}

export async function sendSubscriptionCancelledEmail(
  user: { email: string; name: string | null },
  organization: { name: string },
  plan: { name: string }
) {
  const template = emailTemplates.subscriptionCancelled(
    user.name,
    organization.name,
    plan.name
  );
  await sendEmail(user.email, template.subject, template.html);
}
