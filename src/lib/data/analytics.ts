import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AnalyticsPayload = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
  averageCycleTime: number;
  velocity: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksOverTime: {
    date: string;
    status: string;
    completedAt: string | null;
  }[];
};

function startDateForPeriod(period: string, now: Date): Date {
  let startDate: Date;
  switch (period) {
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "year":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  return startDate;
}

/** Core analytics query; callers must enforce auth (e.g. requireMember / requireBoardAccess). */
export async function getAnalyticsPayload(params: {
  organizationId?: string | null;
  boardId?: string | null;
  sprintId?: string | null;
  period?: string;
}): Promise<AnalyticsPayload> {
  const { organizationId, boardId, sprintId, period = "month" } = params;
  if (!organizationId && !boardId) {
    throw new Error("organizationId or boardId is required");
  }

  const now = new Date();
  const startDate = startDateForPeriod(period, now);

  const where: Prisma.TaskWhereInput = {
    createdAt: { gte: startDate },
  };

  if (boardId) {
    where.boardId = boardId;
  } else if (organizationId) {
    where.board = { organizationId };
  }

  if (sprintId) {
    where.sprintId = sprintId;
  }

  const totalTasks = await prisma.task.count({ where });
  const completedTasks = await prisma.task.count({
    where: { ...where, status: "DONE" },
  });
  const inProgressTasks = await prisma.task.count({
    where: { ...where, status: "IN_PROGRESS" },
  });
  const blockedTasks = await prisma.task.count({
    where: { ...where, status: "BLOCKED" },
  });

  const tasksByStatus = await prisma.task.groupBy({
    by: ["status"],
    where,
    _count: true,
  });

  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where,
    _count: true,
  });

  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const completedTasksWithDates = await prisma.task.findMany({
    where: { ...where, status: "DONE" },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const cycleTimes = completedTasksWithDates.map((task) => {
    return (
      (new Date(task.updatedAt).getTime() -
        new Date(task.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
    );
  });

  const averageCycleTime =
    cycleTimes.length > 0
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
      : 0;

  const velocity = completedTasks;

  const tasksOverTimeRows = await prisma.task.findMany({
    where,
    select: {
      createdAt: true,
      status: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    completionRate: Math.round(completionRate * 100) / 100,
    averageCycleTime: Math.round(averageCycleTime * 100) / 100,
    velocity,
    tasksByStatus: tasksByStatus.map((item) => ({
      status: item.status,
      count: item._count,
    })),
    tasksByPriority: tasksByPriority.map((item) => ({
      priority: item.priority,
      count: item._count,
    })),
    tasksOverTime: tasksOverTimeRows.map((task) => ({
      date:
        task.createdAt instanceof Date
          ? task.createdAt.toISOString()
          : String(task.createdAt),
      status: task.status,
      completedAt:
        task.status === "DONE"
          ? task.updatedAt instanceof Date
            ? task.updatedAt.toISOString()
            : String(task.updatedAt)
          : null,
    })),
  };
}
