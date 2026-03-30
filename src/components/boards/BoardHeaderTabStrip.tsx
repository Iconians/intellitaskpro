interface BoardHeaderTabStripProps {
  activeTab: "board" | "sprints";
  onTabChange: (tab: "board" | "sprints") => void;
}

const tabBtn =
  "px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0";
const activeTabClass =
  "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400";
const inactiveTabClass =
  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200";

export function BoardHeaderTabStrip({
  activeTab,
  onTabChange,
}: BoardHeaderTabStripProps) {
  return (
    <div className="-mx-2 flex gap-1 overflow-x-auto overflow-touch border-gray-200 px-2 scrollbar-hide xs:-mx-4 xs:px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-gray-700 touch-pan-x">
      <button
        type="button"
        onClick={() => onTabChange("board")}
        className={`${tabBtn} ${activeTab === "board" ? activeTabClass : inactiveTabClass}`}
      >
        📋 Board
      </button>
      <button
        type="button"
        onClick={() => onTabChange("sprints")}
        className={`${tabBtn} ${activeTab === "sprints" ? activeTabClass : inactiveTabClass}`}
      >
        📅 Sprints
      </button>
    </div>
  );
}
