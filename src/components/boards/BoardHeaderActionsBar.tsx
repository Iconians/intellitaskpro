import type { RefObject } from "react";
import Link from "next/link";
import { BoardHeaderMenuDropdown } from "./BoardHeaderMenuDropdown";

interface BoardHeaderActionsBarProps {
  boardId: string;
  menuRef: RefObject<HTMLDivElement | null>;
  showMenu: boolean;
  onToggleMenu: () => void;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  needsRepoName: boolean;
  canConnectGitHub: boolean;
  isGitHubConnected: boolean;
  hasPaidSubscription: boolean;
  githubLimit:
    | { allowed?: boolean; error?: string; limit?: number; current?: number }
    | null
    | undefined;
  closeMenu: () => void;
  setShowExportModal: (v: boolean) => void;
  setShowImportModal: (v: boolean) => void;
  setShowManageColumns: (v: boolean) => void;
  setShowTagManager: (v: boolean) => void;
  setShowTemplateEditor: (v: boolean) => void;
  setShowBoardMembers: (v: boolean) => void;
  setShowGitHubRepo: (v: boolean) => void;
  setShowCreateSprint: (v: boolean) => void;
  setShowTaskGenerator: (v: boolean) => void;
  setShowSprintPlanner: (v: boolean) => void;
}

export function BoardHeaderActionsBar(props: BoardHeaderActionsBarProps) {
  const {
    boardId,
    menuRef,
    showMenu,
    onToggleMenu,
    userBoardRole,
    needsRepoName,
    canConnectGitHub,
    isGitHubConnected,
    hasPaidSubscription,
    githubLimit,
    closeMenu,
    setShowExportModal,
    setShowImportModal,
    setShowManageColumns,
    setShowTagManager,
    setShowTemplateEditor,
    setShowBoardMembers,
    setShowGitHubRepo,
    setShowCreateSprint,
    setShowTaskGenerator,
    setShowSprintPlanner,
  } = props;

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={onToggleMenu}
          className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5 xs:gap-2 shadow-md transition-all text-xs sm:text-sm flex-shrink-0"
          title="Board Actions"
        >
          <span className="text-base xs:text-lg">⚙️</span>
          <span className="hidden xs:inline">Actions</span>
          <span className="text-xs xs:text-sm">▼</span>
        </button>

        {showMenu && (
          <BoardHeaderMenuDropdown
            boardId={boardId}
            userBoardRole={userBoardRole}
            needsRepoName={needsRepoName}
            canConnectGitHub={canConnectGitHub}
            isGitHubConnected={isGitHubConnected}
            hasPaidSubscription={hasPaidSubscription}
            githubLimit={githubLimit}
            closeMenu={closeMenu}
            setShowExportModal={setShowExportModal}
            setShowImportModal={setShowImportModal}
            setShowManageColumns={setShowManageColumns}
            setShowTagManager={setShowTagManager}
            setShowTemplateEditor={setShowTemplateEditor}
            setShowBoardMembers={setShowBoardMembers}
            setShowGitHubRepo={setShowGitHubRepo}
            setShowCreateSprint={setShowCreateSprint}
            setShowTaskGenerator={setShowTaskGenerator}
            setShowSprintPlanner={setShowSprintPlanner}
          />
        )}
      </div>

      <Link
        href="/boards"
        className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
      >
        ← Back
      </Link>
    </div>
  );
}
