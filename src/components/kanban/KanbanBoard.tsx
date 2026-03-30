"use client";

import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ShortcutHelp } from "../shared/ShortcutHelp";
import { RiskAlerts } from "../ai/RiskAlerts";
import { BulkEditModal } from "../tasks/BulkEditModal";
import type { TaskStatus } from "@prisma/client";
import { KanbanBulkActionsToolbar } from "./KanbanBulkActionsToolbar";
import { KanbanBoardContent } from "./KanbanBoardContent";
import { filterTasks } from "./filterTasks";
import { useKanbanRealtime } from "./useKanbanRealtime";
import type { Board, KanbanBoardProps } from "./types";

export function KanbanBoard({ boardId, organizationId, userBoardRole, filters = {} }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [boardInteractionLockCount, setBoardInteractionLockCount] = useState(0);
  const boardInteractionLocked = boardInteractionLockCount > 0;

  const acquireBoardInteractionLock = useCallback(() => {
    setBoardInteractionLockCount((c) => c + 1);
  }, []);

  const releaseBoardInteractionLock = useCallback(() => {
    setBoardInteractionLockCount((c) => Math.max(0, c - 1));
  }, []);

  const queryClient = useQueryClient();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      meta: true,
      handler: () => {
        // Focus search (Cmd+K or Ctrl+K)
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
    },
    {
      key: "f",
      meta: true,
      handler: () => {
        // Focus search (alternative shortcut)
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: "/",
      meta: true,
      handler: () => {
        setShowShortcuts(true);
      },
    },
    {
      key: "Escape",
      handler: () => {
        setShowShortcuts(false);
      },
    },
  ]);

  const isViewer = userBoardRole === "VIEWER";

  const { data: board, isLoading, error: boardError } = useQuery<Board>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to fetch board" }));
        throw new Error(error.error || "Failed to fetch board");
      }
      const data = await res.json();
      // Ensure statuses and tasks are arrays
      return {
        ...data,
        statuses: Array.isArray(data.statuses) ? data.statuses : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
      };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: 1000,
  });

  useKanbanRealtime({
    boardId,
    onBoardEvent: () => queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      status,
      order,
    }: {
      taskId: string;
      status: TaskStatus;
      order: number;
    }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, order }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onMutate: async ({ taskId, status, order }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previousBoard = queryClient.getQueryData<Board>(["board", boardId]);

      if (previousBoard) {
        queryClient.setQueryData<Board>(["board", boardId], (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === taskId ? { ...task, status, order } : task
            ),
          };
        });
      }

      return { previousBoard };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (isViewer) {
      return;
    }

    if (!over || !board) {
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    const statusColumn = board?.statuses?.find((s) => s.id === overId);

    if (!statusColumn) {
      const droppedOnTask = board?.tasks?.find((t) => t.id === overId);
      if (droppedOnTask) {
        const targetStatus = board?.statuses?.find(
          (s) => s.status === droppedOnTask.status
        );
        if (targetStatus) {
          const task = board?.tasks?.find((t) => t.id === taskId);
          if (task && task.status !== targetStatus.status) {
            const tasksInNewStatus = Array.isArray(board?.tasks)
              ? board.tasks.filter((t) => t.status === targetStatus.status)
              : [];
            const newOrder = tasksInNewStatus.length;

            updateTaskMutation.mutate({
              taskId,
              status: targetStatus.status,
              order: newOrder,
            });
          }
        }
      }
      return;
    }

    const task = board?.tasks?.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    if (task.status === statusColumn.status) {
      return;
    }

    const tasksInNewStatus = Array.isArray(board?.tasks)
      ? board.tasks.filter((t) => t.status === statusColumn.status)
      : [];
    const newOrder = tasksInNewStatus.length;

    updateTaskMutation.mutate({
      taskId,
      status: statusColumn.status,
      order: newOrder,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-gray-600 dark:text-gray-400">
        Loading board...
      </div>
    );
  }

  if (boardError) {
    return (
      <div className="p-8 text-red-600 dark:text-red-400">
        Error loading board: {boardError instanceof Error ? boardError.message : "Unknown error"}
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["board", boardId] })}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-8 text-gray-600 dark:text-gray-400">
        Board not found
      </div>
    );
  }

  const sortedStatuses = Array.isArray(board?.statuses)
    ? [...board.statuses].sort((a, b) => a.order - b.order)
    : [];
  const activeTask = board?.tasks?.find((t) => t.id === activeId);

  // Apply filters to tasks
  const allTasks = Array.isArray(board?.tasks) ? board.tasks : [];
  const filteredTasks = filterTasks(allTasks, filters);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedTaskIds(new Set());
  };

  return (
    <div className="flex w-full max-md:h-auto flex-col md:min-h-0">
      <div className="shrink-0">
        <RiskAlerts boardId={boardId} />
      </div>
      
      {/* Bulk Actions Toolbar */}
      {selectedTaskIds.size > 0 && !isViewer && (
        <KanbanBulkActionsToolbar
          selectedCount={selectedTaskIds.size}
          onEditSelected={() => setShowBulkEdit(true)}
          onClearSelection={clearSelection}
        />
      )}
      <KanbanBoardContent
        statuses={sortedStatuses}
        filteredTasks={filteredTasks}
        activeTask={activeTask}
        boardId={boardId}
        organizationId={organizationId}
        userBoardRole={userBoardRole}
        boardInteractionLocked={boardInteractionLocked}
        selectedTaskIds={selectedTaskIds}
        onTaskSelect={toggleTaskSelection}
        onClearSelection={clearSelection}
        onAcquireInteractionLock={acquireBoardInteractionLock}
        onReleaseInteractionLock={releaseBoardInteractionLock}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
      <ShortcutHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {showBulkEdit && (
        <BulkEditModal
          taskIds={Array.from(selectedTaskIds)}
          boardId={boardId}
          onClose={() => {
            setShowBulkEdit(false);
            clearSelection();
          }}
        />
      )}
    </div>
  );
}
