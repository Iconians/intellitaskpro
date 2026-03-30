import { Resend } from "resend";
import crypto from "crypto";

const resendApiKey = process.env.RESEND_API_KEY;
const customFromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM;
const fromEmail = customFromEmail || "onboarding@resend.dev";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  if (!resendApiKey || !resend) {
    console.warn("⚠️ Resend API key not configured, skipping email send");
    console.warn(
      "   Set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables"
    );
    return;
  }

  if (!fromEmail || !fromEmail.includes("@")) {
    console.error(
      "❌ RESEND_FROM_EMAIL must be a valid email address (e.g., noreply@yourdomain.com)"
    );
    console.error(`   Current value: ${fromEmail || "not set"}`);
    throw new Error("Invalid RESEND_FROM_EMAIL: must be a valid email address");
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (result.error) {
      if (result.error.message?.includes("domain is not verified")) {
        console.error("❌ Resend domain verification error:");
        console.error(
          `   Domain "${fromEmail.split("@")[1]}" is not verified in Resend`
        );
        console.error("   Options:");
        console.error("   1. Verify your domain at https://resend.com/domains");
        console.error(
          "   2. Use 'onboarding@resend.dev' for testing (remove RESEND_FROM_EMAIL from .env)"
        );
        console.error("   3. Or set RESEND_FROM_EMAIL=onboarding@resend.dev");
      }
      console.error("❌ Resend API error:", result.error);
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   To:", to);
      console.error("   From:", fromEmail);
      console.error("   Subject:", subject);
    }
    throw error;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
