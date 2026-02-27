import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/boards");
  }

  return <ForgotPasswordForm />;
}
