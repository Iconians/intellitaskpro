import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPlans,
  getSubscriptionForOrg,
  getUsageForOrg,
} from "@/lib/data/billing";
import { BillingPageClient } from "./billing-client";
import Link from "next/link";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    select: { id: true, name: true },
  });

  if (organizations.length === 0) {
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

  const defaultOrgId = organizations[0].id;
  const [plans, initialSubscription, initialUsage] = await Promise.all([
    getPlans(),
    getSubscriptionForOrg(defaultOrgId),
    getUsageForOrg(defaultOrgId),
  ]);

  const serializedSubscription = initialSubscription
    ? {
        ...initialSubscription,
        currentPeriodStart: initialSubscription.currentPeriodStart
          ? (initialSubscription.currentPeriodStart instanceof Date
              ? initialSubscription.currentPeriodStart.toISOString()
              : initialSubscription.currentPeriodStart)
          : null,
        currentPeriodEnd: initialSubscription.currentPeriodEnd
          ? (initialSubscription.currentPeriodEnd instanceof Date
              ? initialSubscription.currentPeriodEnd.toISOString()
              : initialSubscription.currentPeriodEnd)
          : null,
      }
    : null;

  return (
    <BillingPageClient
      organizations={organizations}
      plans={plans}
      initialSubscription={serializedSubscription}
      initialUsage={initialUsage}
      defaultOrgId={defaultOrgId}
    />
  );
}
