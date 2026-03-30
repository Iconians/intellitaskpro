import { TaskSearch } from "../tasks/TaskSearch";
import { TaskFilters } from "../tasks/TaskFilters";
import type { BoardHeaderFilterState } from "./board-header-types";

interface BoardHeaderFiltersRowProps {
  boardId: string;
  filters: BoardHeaderFilterState;
  onFilterChange: (filters: BoardHeaderFilterState) => void;
}

export function BoardHeaderFiltersRow({
  boardId,
  filters,
  onFilterChange,
}: BoardHeaderFiltersRowProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="w-full max-w-full sm:max-w-md">
        <TaskSearch
          boardId={boardId}
          onTaskSelect={(taskId) => {
            console.log("Selected task:", taskId);
          }}
          onSearchChange={(searchQuery) => {
            onFilterChange({ ...filters, searchQuery });
          }}
          searchQuery={filters.searchQuery}
        />
      </div>
      <TaskFilters
        boardId={boardId}
        onFilterChange={onFilterChange}
        filters={filters}
      />
    </div>
  );
}
