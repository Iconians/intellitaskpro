"use client";

import { useState } from "react";
import { KanbanBoard } from "../kanban/KanbanBoard";
import { ListView } from "../views/ListView";
import { CalendarView } from "../views/CalendarView";
import { TimelineView } from "../views/TimelineView";

type ViewType = "kanban" | "list" | "calendar" | "timeline";

interface FilterState {
  assigneeId?: string;
  status?: string;
  priority?: string;
  tagId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchQuery?: string;
}

interface BoardViewSelectorProps {
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  filters?: FilterState;
}

export function BoardViewSelector({
  boardId,
  organizationId,
  userBoardRole,
  filters = {},
}: BoardViewSelectorProps) {
  const [currentView, setCurrentView] = useState<ViewType>("kanban");

  const views: Array<{ id: ViewType; name: string; icon: string }> = [
    { id: "kanban", name: "Kanban", icon: "📋" },
    { id: "list", name: "List", icon: "📝" },
    { id: "calendar", name: "Calendar", icon: "📅" },
    { id: "timeline", name: "Timeline", icon: "📊" },
  ];

  return (
    <div className="flex w-full flex-col">
      {/* View Selector */}
      <div className="shrink-0 overflow-x-auto overflow-touch border-b border-gray-200 bg-white px-2 py-2 scrollbar-hide touch-pan-x xs:px-3 sm:px-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex min-w-max gap-1 xs:gap-2">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                currentView === view.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-1 xs:mr-2">{view.icon}</span>
              <span className="hidden xs:inline">{view.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className="flex w-full flex-col max-md:overflow-visible md:overflow-x-hidden md:overflow-y-visible">
        {currentView === "kanban" && (
          <KanbanBoard
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        )}
        {currentView === "list" && (
          <ListView
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        )}
        {currentView === "calendar" && (
          <CalendarView
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        )}
        {currentView === "timeline" && (
          <TimelineView
            boardId={boardId}
            organizationId={organizationId}
            userBoardRole={userBoardRole}
            filters={filters}
          />
        )}
      </div>
    </div>
  );
}

