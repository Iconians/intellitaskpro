import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPlans,
  getSubscriptionForOrg,
  getUsageForOrg,
  serializeSubscriptionForClient,
} from "@/lib/data/billing";
import { BillingNoOrganizations } from "@/components/billing/BillingNoOrganizations";
import { BillingPageClient } from "./billing-client";

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
    return <BillingNoOrganizations />;
  }

  const defaultOrgId = organizations[0].id;
  const [plans, initialSubscription, initialUsage] = await Promise.all([
    getPlans(),
    getSubscriptionForOrg(defaultOrgId),
    getUsageForOrg(defaultOrgId),
  ]);

  return (
    <BillingPageClient
      organizations={organizations}
      plans={plans}
      initialSubscription={serializeSubscriptionForClient(initialSubscription)}
      initialUsage={initialUsage}
      defaultOrgId={defaultOrgId}
    />
  );
}
