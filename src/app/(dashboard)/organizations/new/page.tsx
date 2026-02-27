import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NewOrganizationForm } from "@/components/organizations/NewOrganizationForm";
import { Suspense } from "react";

export default async function NewOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 lg:p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <NewOrganizationForm isOnboarding={isOnboarding} />
    </Suspense>
  );
}
