import { useRealtime } from "@/hooks/useRealtime";

interface UseKanbanRealtimeParams {
  boardId: string;
  onBoardEvent: () => void;
}

function useBoardEventSubscription(
  boardId: string,
  eventName: string,
  onBoardEvent: () => void,
) {
  useRealtime({
    channelName: `private-board-${boardId}`,
    eventName,
    callback: onBoardEvent,
  });
}

export function useKanbanRealtime({
  boardId,
  onBoardEvent,
}: UseKanbanRealtimeParams) {
  useBoardEventSubscription(boardId, "task-updated", onBoardEvent);
  useBoardEventSubscription(boardId, "task-created", onBoardEvent);
  useBoardEventSubscription(boardId, "task-deleted", onBoardEvent);
  useBoardEventSubscription(boardId, "tasks-generated", onBoardEvent);
}
