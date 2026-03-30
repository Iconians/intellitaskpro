import type { SerializedProfileForClient } from "@/lib/data/profile";

interface ProfileAccountInfoProps {
  profile: SerializedProfileForClient;
}

export function ProfileAccountInfo({ profile }: ProfileAccountInfoProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account Information
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
          {!profile.emailVerified && (
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Email not verified
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
