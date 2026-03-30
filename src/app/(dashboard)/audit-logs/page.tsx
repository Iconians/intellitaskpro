import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAuditLogsForOrganization,
  serializeAuditLogForClient,
} from "@/lib/data/audit-logs";
import { AuditLogsPageClient } from "./audit-logs-client";

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const members = await prisma.member.findMany({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
    include: {
      organization: true,
    },
  });

  const organizations = members.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
  }));

  const firstOrgId = organizations[0]?.id;
  const initialAuditLogs = firstOrgId
    ? (
        await getAuditLogsForOrganization({
          organizationId: firstOrgId,
          limit: 100,
        })
      ).map(serializeAuditLogForClient)
    : [];

  return (
    <AuditLogsPageClient
      organizations={organizations}
      initialAuditLogs={initialAuditLogs}
      defaultOrganizationId={firstOrgId ?? ""}
    />
  );
}

