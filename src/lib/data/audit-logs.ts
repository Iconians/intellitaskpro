import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
  };
}>;

export type SerializedAuditLog = Omit<AuditLogWithUser, "createdAt"> & {
  createdAt: string;
};

export function serializeAuditLogForClient(
  log: AuditLogWithUser
): SerializedAuditLog {
  return {
    ...log,
    createdAt:
      log.createdAt instanceof Date
        ? log.createdAt.toISOString()
        : String(log.createdAt),
  };
}

export async function getAuditLogsForOrganization(options: {
  organizationId: string;
  entityType?: string | null;
  limit?: number;
}): Promise<AuditLogWithUser[]> {
  const { organizationId, entityType, limit = 100 } = options;
  const where: Prisma.AuditLogWhereInput = { organizationId };
  if (entityType) {
    where.entityType = entityType;
  }

  return prisma.auditLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
