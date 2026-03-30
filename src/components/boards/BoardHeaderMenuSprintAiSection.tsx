interface BoardHeaderMenuSprintAiSectionProps {
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  hasPaidSubscription: boolean;
  closeMenu: () => void;
  onOpenCreateSprint: () => void;
  onOpenTaskGenerator: () => void;
  onOpenSprintPlanner: () => void;
}

export function BoardHeaderMenuSprintAiSection({
  userBoardRole,
  hasPaidSubscription,
  closeMenu,
  onOpenCreateSprint,
  onOpenTaskGenerator,
  onOpenSprintPlanner,
}: BoardHeaderMenuSprintAiSectionProps) {
  if (userBoardRole !== "ADMIN" && userBoardRole !== "MEMBER") {
    return null;
  }

  const itemClass =
    "w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2";

  return (
    <>
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-1">
        Sprint & AI
      </div>
      <button
        type="button"
        onClick={() => {
          onOpenCreateSprint();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>📅</span>
        <span>Create Sprint</span>
      </button>
      {hasPaidSubscription && (
        <>
          <button
            type="button"
            onClick={() => {
              onOpenTaskGenerator();
              closeMenu();
            }}
            className={itemClass}
          >
            <span>✨</span>
            <span>AI Generate Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenSprintPlanner();
              closeMenu();
            }}
            className={itemClass}
          >
            <span>🚀</span>
            <span>AI Plan Sprint</span>
          </button>
        </>
      )}
    </>
  );
}
