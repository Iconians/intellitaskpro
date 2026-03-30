import Link from "next/link";

export function BillingNoOrganizations() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No organizations found. Create one to get started.
          </p>
          <Link
            href="/organizations/new"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Create Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
