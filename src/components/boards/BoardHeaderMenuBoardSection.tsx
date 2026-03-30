interface BoardHeaderMenuBoardSectionProps {
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  closeMenu: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenColumns: () => void;
  onOpenTags: () => void;
  onOpenTemplates: () => void;
}

export function BoardHeaderMenuBoardSection({
  userBoardRole,
  closeMenu,
  onOpenExport,
  onOpenImport,
  onOpenColumns,
  onOpenTags,
  onOpenTemplates,
}: BoardHeaderMenuBoardSectionProps) {
  if (userBoardRole !== "ADMIN" && userBoardRole !== "MEMBER") {
    return null;
  }

  const itemClass =
    "w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2";

  return (
    <>
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        Board Management
      </div>
      <button
        type="button"
        onClick={() => {
          onOpenExport();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>📥</span>
        <span>Export Board</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onOpenImport();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>📤</span>
        <span>Import Tasks</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onOpenColumns();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>📊</span>
        <span>Manage Columns</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onOpenTags();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>🏷️</span>
        <span>Manage Tags</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onOpenTemplates();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>📋</span>
        <span>Manage Templates</span>
      </button>
    </>
  );
}
