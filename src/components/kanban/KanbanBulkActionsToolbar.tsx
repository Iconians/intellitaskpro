interface KanbanBulkActionsToolbarProps {
  selectedCount: number;
  onEditSelected: () => void;
  onClearSelection: () => void;
}

export function KanbanBulkActionsToolbar({
  selectedCount,
  onEditSelected,
  onClearSelection,
}: KanbanBulkActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="shrink-0 bg-blue-600 text-white px-2 xs:px-3 sm:px-4 py-2 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
      <span className="text-xs xs:text-sm font-medium">
        {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="flex gap-1.5 xs:gap-2 w-full xs:w-auto">
        <button
          onClick={onEditSelected}
          className="px-2 xs:px-3 py-1 text-xs xs:text-sm bg-white text-blue-600 rounded hover:bg-blue-50 flex-1 xs:flex-none whitespace-nowrap"
        >
          Edit Selected
        </button>
        <button
          onClick={onClearSelection}
          className="px-2 xs:px-3 py-1 text-xs xs:text-sm bg-blue-700 rounded hover:bg-blue-800 flex-1 xs:flex-none whitespace-nowrap"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}
