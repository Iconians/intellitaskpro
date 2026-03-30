import { BoardHeaderMenuBoardSection } from "./BoardHeaderMenuBoardSection";
import { BoardHeaderMenuTeamSection } from "./BoardHeaderMenuTeamSection";
import { BoardHeaderMenuSprintAiSection } from "./BoardHeaderMenuSprintAiSection";

interface BoardHeaderMenuDropdownProps {
  boardId: string;
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

export function BoardHeaderMenuDropdown(props: BoardHeaderMenuDropdownProps) {
  const {
    boardId,
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
    <div className="absolute right-0 mt-1 w-56 xs:w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="py-1">
        <BoardHeaderMenuBoardSection
          userBoardRole={userBoardRole}
          closeMenu={closeMenu}
          onOpenExport={() => setShowExportModal(true)}
          onOpenImport={() => setShowImportModal(true)}
          onOpenColumns={() => setShowManageColumns(true)}
          onOpenTags={() => setShowTagManager(true)}
          onOpenTemplates={() => setShowTemplateEditor(true)}
        />
        <BoardHeaderMenuTeamSection
          boardId={boardId}
          userBoardRole={userBoardRole}
          needsRepoName={needsRepoName}
          canConnectGitHub={canConnectGitHub}
          isGitHubConnected={isGitHubConnected}
          githubLimit={githubLimit}
          closeMenu={closeMenu}
          onOpenMembers={() => setShowBoardMembers(true)}
          onOpenGitHubRepo={() => setShowGitHubRepo(true)}
        />
        <BoardHeaderMenuSprintAiSection
          userBoardRole={userBoardRole}
          hasPaidSubscription={hasPaidSubscription}
          closeMenu={closeMenu}
          onOpenCreateSprint={() => setShowCreateSprint(true)}
          onOpenTaskGenerator={() => setShowTaskGenerator(true)}
          onOpenSprintPlanner={() => setShowSprintPlanner(true)}
        />
      </div>
    </div>
  );
}
