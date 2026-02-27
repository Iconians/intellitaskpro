import { prisma } from "@/lib/prisma";

export type WatchingTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  board: {
    id: string;
    name: string;
    organizationId: string;
  };
};

export async function getWatchingTasks(userId: string): Promise<WatchingTask[]> {
  const watchers = await prisma.taskWatcher.findMany({
    where: { userId },
    include: {
      task: {
        include: {
          board: {
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return watchers.map((watcher) => ({
    id: watcher.task.id,
    title: watcher.task.title,
    status: watcher.task.status,
    priority: watcher.task.priority,
    board: watcher.task.board,
  }));
}
