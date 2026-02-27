import { prisma } from "@/lib/prisma";
import { getCurrentUsage, getActualCounts } from "@/lib/usage";
import { isDeveloperOrganization } from "@/lib/developer";

export type PlanForBilling = {
  id: string;
  name: string;
  price: number;
  interval: string;
  maxBoards: number;
  maxMembers: number;
  maxTasks: number | null;
  features: Record<string, boolean> | null;
};

export type SubscriptionForBilling = {
  id: string;
  organizationId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  stripeSubscriptionId: string | null;
  plan: PlanForBilling;
};

/** Serialized for passing from RSC to client (dates as ISO strings) */
export type SerializedSubscriptionForBilling = Omit<
  SubscriptionForBilling,
  "currentPeriodStart" | "currentPeriodEnd"
> & {
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
};

export type UsageForBilling = {
  usage: Record<string, number>;
  actualCounts: { boards: number; members: number; tasks: number };
};

function serializePlan(plan: {
  id: string;
  name: string;
  price: unknown;
  interval: string;
  maxBoards: number;
  maxMembers: number;
  maxTasks: number | null;
  features: unknown;
}): PlanForBilling {
  return {
    id: plan.id,
    name: plan.name,
    price:
      typeof plan.price === "object" &&
      plan.price !== null &&
      "toNumber" in plan.price
        ? (plan.price as { toNumber: () => number }).toNumber()
        : Number(plan.price),
    interval: plan.interval,
    maxBoards: plan.maxBoards,
    maxMembers: plan.maxMembers,
    maxTasks: plan.maxTasks,
    features: (plan.features as Record<string, boolean> | null) ?? null,
  };
}

export async function getPlans(): Promise<PlanForBilling[]> {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return plans.map(serializePlan);
}

export async function getSubscriptionForOrg(
  organizationId: string
): Promise<SubscriptionForBilling | null> {
  if (isDeveloperOrganization(organizationId)) {
    const enterprisePlan = await prisma.plan.findFirst({
      where: { name: "Enterprise" },
    });
    if (enterprisePlan) {
      return {
        id: `developer-${organizationId}`,
        organizationId,
        planId: enterprisePlan.id,
        status: "ACTIVE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        stripeSubscriptionId: null,
        plan: serializePlan(enterprisePlan),
      };
    }
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
  if (!subscription) return null;
  return {
    id: subscription.id,
    organizationId: subscription.organizationId,
    planId: subscription.planId,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    plan: serializePlan(subscription.plan),
  };
}

export async function getUsageForOrg(
  organizationId: string
): Promise<UsageForBilling> {
  const [usage, actualCounts] = await Promise.all([
    getCurrentUsage(organizationId),
    getActualCounts(organizationId),
  ]);
  return { usage, actualCounts };
}
