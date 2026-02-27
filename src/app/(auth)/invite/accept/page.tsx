import Link from "next/link";
import { Suspense } from "react";
import { InviteAcceptContent } from "@/components/auth/InviteAcceptContent";

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? null;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid invitation link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This link is missing a token. Please use the link from your
            invitation email.
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <InviteAcceptContent token={token} />
    </Suspense>
  );
}
