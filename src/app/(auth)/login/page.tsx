import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; verified?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/boards");
  }

  const params = await searchParams;
  const message = params.message ? decodeURIComponent(params.message) : null;
  const verified = params.verified === "true";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <LoginForm initialMessage={message} initialVerified={verified} />
    </Suspense>
  );
}
