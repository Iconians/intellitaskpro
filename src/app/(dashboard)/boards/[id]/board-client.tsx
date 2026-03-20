"use client";

import { useState } from "react";
import { BoardViewSelector } from "@/components/boards/BoardViewSelector";
import { BoardHeader } from "@/components/boards/BoardHeader";
import { SprintsView } from "@/components/sprints/SprintsView";

interface FilterState {
  assigneeId?: string;
  status?: string;
  priority?: string;
  tagId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchQuery?: string;
}

interface BoardPageClientProps {
  boardId: string;
  boardName: string;
  boardDescription: string | null;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  organizationId?: string;
}

export function BoardPageClient({
  boardId,
  boardName,
  boardDescription,
  userBoardRole,
  organizationId,
}: BoardPageClientProps) {
  const [activeTab, setActiveTab] = useState<"board" | "sprints">("board");
  const [filters, setFilters] = useState<FilterState>({});

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 max-md:max-h-[calc(100dvh-var(--navbar-height))] max-md:overflow-y-auto max-md:overflow-x-hidden md:h-[calc(100dvh-var(--navbar-height))] md:max-h-[calc(100dvh-var(--navbar-height))] md:min-h-0 md:overflow-hidden">
      <BoardHeader
        boardId={boardId}
        boardName={boardName}
        boardDescription={boardDescription}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userBoardRole={userBoardRole}
        organizationId={organizationId}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <div className="flex min-h-0 flex-col max-md:flex-none md:flex-1 md:overflow-hidden">
        {activeTab === "board" ? (
          <BoardViewSelector
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        ) : (
          <div className="max-md:flex-none max-md:overflow-visible md:min-h-0 md:flex-1 md:overflow-y-auto overflow-touch">
            <SprintsView boardId={boardId} userBoardRole={userBoardRole} />
          </div>
        )}
      </div>
    </div>
  );
}
