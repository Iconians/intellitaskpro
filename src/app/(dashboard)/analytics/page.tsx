import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnalyticsPayload } from "@/lib/data/analytics";
import { AnalyticsPageClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const members = await prisma.member.findMany({
    where: { userId: user.id },
    include: {
      organization: true,
    },
  });

  const organizations = members.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
  }));

  const defaultOrganizationId = organizations[0]?.id ?? "";
  const initialAnalytics =
    defaultOrganizationId.length > 0
      ? await getAnalyticsPayload({
          organizationId: defaultOrganizationId,
          period: "month",
        })
      : null;

  return (
    <AnalyticsPageClient
      organizations={organizations}
      initialAnalytics={initialAnalytics}
      defaultOrganizationId={defaultOrganizationId}
    />
  );
}

