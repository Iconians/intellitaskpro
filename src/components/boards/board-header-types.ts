export interface BoardHeaderFilterState {
  assigneeId?: string;
  status?: string;
  priority?: string;
  tagId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchQuery?: string;
}

export interface BoardHeaderProps {
  boardId: string;
  boardName: string;
  boardDescription?: string | null;
  activeTab?: "board" | "sprints";
  onTabChange?: (tab: "board" | "sprints") => void;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  organizationId?: string;
  filters?: BoardHeaderFilterState;
  onFiltersChange?: (filters: BoardHeaderFilterState) => void;
}
