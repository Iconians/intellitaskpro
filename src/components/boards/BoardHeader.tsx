import { useBoardHeader } from "@/hooks/useBoardHeader";
import type { BoardHeaderProps } from "./board-header-types";
import { BoardHeaderTitleBlock } from "./BoardHeaderTitleBlock";
import { BoardHeaderActionsBar } from "./BoardHeaderActionsBar";
import { BoardHeaderTabStrip } from "./BoardHeaderTabStrip";
import { BoardHeaderFiltersRow } from "./BoardHeaderFiltersRow";
import { BoardHeaderModals } from "./BoardHeaderModals";

export function BoardHeader(props: BoardHeaderProps) {
  const h = useBoardHeader(props);
  const activeTab = h.activeTab ?? "board";

  return (
    <>
      <div className="shrink-0 border-b border-gray-200 bg-white px-2 py-2 xs:px-4 xs:py-3 sm:px-6 sm:py-4 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3 sm:mb-4">
          <BoardHeaderTitleBlock
            boardName={h.boardName}
            boardDescription={h.boardDescription}
            userBoardRole={h.userBoardRole}
            isEditingTitle={h.isEditingTitle}
            editTitle={h.editTitle}
            onEditTitleChange={h.setEditTitle}
            onStartEdit={() => {
              h.setIsEditingTitle(true);
              h.setEditTitle(h.boardName);
            }}
            onSaveTitle={h.handleSaveTitle}
            onCancelEdit={() => {
              h.setIsEditingTitle(false);
              h.setEditTitle(h.boardName);
            }}
          />
          <BoardHeaderActionsBar
            boardId={h.boardId}
            menuRef={h.menuRef}
            showMenu={h.showMenu}
            onToggleMenu={() => h.setShowMenu(!h.showMenu)}
            userBoardRole={h.userBoardRole}
            needsRepoName={h.needsRepoName}
            canConnectGitHub={h.canConnectGitHub}
            isGitHubConnected={h.isGitHubConnected}
            hasPaidSubscription={h.hasPaidSubscription}
            githubLimit={h.githubLimit}
            closeMenu={h.closeMenu}
            setShowExportModal={h.setShowExportModal}
            setShowImportModal={h.setShowImportModal}
            setShowManageColumns={h.setShowManageColumns}
            setShowTagManager={h.setShowTagManager}
            setShowTemplateEditor={h.setShowTemplateEditor}
            setShowBoardMembers={h.setShowBoardMembers}
            setShowGitHubRepo={h.setShowGitHubRepo}
            setShowCreateSprint={h.setShowCreateSprint}
            setShowTaskGenerator={h.setShowTaskGenerator}
            setShowSprintPlanner={h.setShowSprintPlanner}
          />
        </div>

        {h.onTabChange && (
          <BoardHeaderTabStrip
            activeTab={activeTab}
            onTabChange={h.onTabChange}
          />
        )}

        {activeTab === "board" && (
          <BoardHeaderFiltersRow
            boardId={h.boardId}
            filters={h.filters}
            onFilterChange={h.handleFilterChange}
          />
        )}
      </div>

      <BoardHeaderModals h={h} />
    </>
  );
}

export type {
  BoardHeaderProps,
  BoardHeaderFilterState,
} from "./board-header-types";
