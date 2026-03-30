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
    <>
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
      {activeTab === "board" ? (
        <div className="flex w-full shrink-0 flex-col min-h-[min(58dvh,560px)] md:min-h-[min(64dvh,720px)]">
          <BoardViewSelector
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        </div>
      ) : (
        <div className="flex min-h-[min(40dvh,360px)] flex-1 flex-col md:min-h-0">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-touch">
            <SprintsView boardId={boardId} userBoardRole={userBoardRole} />
          </div>
        </div>
      )}
    </>
  );
}
