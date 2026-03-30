import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import type { BoardTask, BoardStatus } from "./types";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

interface KanbanBoardContentProps {
  statuses: BoardStatus[];
  filteredTasks: BoardTask[];
  activeTask?: BoardTask;
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  boardInteractionLocked: boolean;
  selectedTaskIds: Set<string>;
  onTaskSelect: (taskId: string) => void;
  onClearSelection: () => void;
  onAcquireInteractionLock: () => void;
  onReleaseInteractionLock: () => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function KanbanBoardContent({
  statuses,
  filteredTasks,
  activeTask,
  boardId,
  organizationId,
  userBoardRole,
  boardInteractionLocked,
  selectedTaskIds,
  onTaskSelect,
  onClearSelection,
  onAcquireInteractionLock,
  onReleaseInteractionLock,
  onDragStart,
  onDragEnd,
}: KanbanBoardContentProps) {
  const isViewer = userBoardRole === "VIEWER";
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
      disabled: isViewer || boardInteractionLocked,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 10 },
      disabled: isViewer || boardInteractionLocked,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={onDragStart}
      onDragOver={() => {}}
      onDragEnd={onDragEnd}
    >
      <div className="flex max-md:h-auto flex-col md:min-h-0">
        <div
          className={`flex gap-2 p-1 pb-3 pt-1 scrollbar-thin xs:gap-3 xs:p-2 sm:p-4 max-md:flex-col max-md:overflow-x-hidden max-md:overflow-y-visible md:min-h-0 md:flex-row md:flex-nowrap md:overflow-x-auto md:overflow-y-hidden md:overscroll-x-contain md:snap-x md:snap-mandatory md:overflow-touch md:touch-pan-x ${
            boardInteractionLocked ? "pointer-events-none" : ""
          }`}
          {...(boardInteractionLocked ? { inert: true } : {})}
        >
          {statuses.map((status) => {
            const columnTasks = filteredTasks
              .filter((task) => task.status === status.status)
              .sort((a, b) => a.order - b.order);

            return (
              <KanbanColumn
                key={status.id}
                id={status.id}
                status={status}
                tasks={columnTasks}
                boardId={boardId}
                organizationId={organizationId}
                userBoardRole={userBoardRole}
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={onTaskSelect}
                acquireBoardInteractionLock={onAcquireInteractionLock}
                releaseBoardInteractionLock={onReleaseInteractionLock}
                onClearBoardSelection={onClearSelection}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging
              boardId={boardId}
              organizationId={organizationId}
              userBoardRole={userBoardRole}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
