"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface InviteAcceptContentProps {
  token: string;
}

export function InviteAcceptContent({ token }: InviteAcceptContentProps) {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" && token) {
      router.replace(
        `/login?invite=${encodeURIComponent(token)}&type=organization`
      );
    }
  }, [status, token, router]);

  const handleAccept = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/organizations/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to accept invitation");
        setLoading(false);
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      router.push("/organizations");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "unauthenticated" && token)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accept invitation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You&apos;ve been invited to join an organization. Click below to accept.
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Accepting…" : "Accept invitation"}
          </button>
          <Link
            href="/boards"
            className="px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
