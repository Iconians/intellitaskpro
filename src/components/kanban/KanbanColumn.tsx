"use client";

import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import type { BoardStatus, BoardTask } from "./types";

interface KanbanColumnProps {
  id: string;
  status: BoardStatus;
  tasks: BoardTask[];
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  selectedTaskIds?: Set<string>;
  onTaskSelect?: (taskId: string) => void;
  acquireBoardInteractionLock?: () => void;
  releaseBoardInteractionLock?: () => void;
  onClearBoardSelection?: () => void;
}

export function KanbanColumn({
  id,
  status,
  tasks,
  boardId,
  organizationId,
  userBoardRole,
  selectedTaskIds = new Set(),
  onTaskSelect,
  acquireBoardInteractionLock,
  releaseBoardInteractionLock,
  onClearBoardSelection,
}: KanbanColumnProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  useEffect(() => {
    if (!showCreateModal || !acquireBoardInteractionLock || !releaseBoardInteractionLock) {
      return;
    }
    acquireBoardInteractionLock();
    return () => releaseBoardInteractionLock();
  }, [
    showCreateModal,
    acquireBoardInteractionLock,
    releaseBoardInteractionLock,
  ]);

  return (
    <>
      <div
        ref={setNodeRef}
        className={`flex w-full shrink-0 flex-col rounded-lg bg-gray-100 p-2 xs:p-3 sm:p-4 max-md:h-auto max-md:min-h-0 md:h-full md:min-h-[550px] md:max-h-full md:w-80 md:shrink-0 md:snap-center md:[scroll-snap-align:none] dark:bg-gray-800 ${
          isOver ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate flex-1">
            {status.name}
          </h3>
          {userBoardRole !== "VIEWER" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
            >
              + Add
            </button>
          )}
        </div>
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="space-y-2 max-md:overflow-visible md:min-h-0 md:flex-1 md:overflow-y-auto md:max-h-[min(80vh,36rem)] overflow-touch scroll-smooth scrollbar-thin"
            style={{ touchAction: "pan-y" }}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                boardId={boardId}
                organizationId={organizationId}
                userBoardRole={userBoardRole}
                isSelected={selectedTaskIds.has(task.id)}
                onSelect={onTaskSelect ? () => onTaskSelect(task.id) : undefined}
                acquireBoardInteractionLock={acquireBoardInteractionLock}
                releaseBoardInteractionLock={releaseBoardInteractionLock}
                onClearBoardSelection={onClearBoardSelection}
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
                Drop tasks here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
      {showCreateModal && (
        <CreateTaskModal
          boardId={boardId}
          organizationId={organizationId}
          defaultStatus={status.status}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
