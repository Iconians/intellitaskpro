"use client";

import Link from "next/link";
import type { WatchingTask } from "@/lib/data/watching";

interface WatchingTasksListProps {
  tasks: WatchingTask[];
}

export function WatchingTasksList({ tasks }: WatchingTasksListProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Tasks You&apos;re Watching
      </h1>

      {tasks.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          You&apos;re not watching any tasks yet. Watch tasks to get notified of
          changes.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/boards/${task.board.id}`}
                    className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Board: {task.board.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {task.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
