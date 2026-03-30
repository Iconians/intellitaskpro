interface BoardHeaderMenuTeamSectionProps {
  boardId: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  needsRepoName: boolean;
  canConnectGitHub: boolean;
  isGitHubConnected: boolean;
  githubLimit:
    | { allowed?: boolean; error?: string; limit?: number; current?: number }
    | null
    | undefined;
  closeMenu: () => void;
  onOpenMembers: () => void;
  onOpenGitHubRepo: () => void;
}

export function BoardHeaderMenuTeamSection({
  boardId,
  userBoardRole,
  needsRepoName,
  canConnectGitHub,
  isGitHubConnected,
  githubLimit,
  closeMenu,
  onOpenMembers,
  onOpenGitHubRepo,
}: BoardHeaderMenuTeamSectionProps) {
  if (userBoardRole !== "ADMIN") {
    return null;
  }

  const itemClass =
    "w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2";

  return (
    <>
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-1">
        Team & Integration
      </div>
      <button
        type="button"
        onClick={() => {
          onOpenMembers();
          closeMenu();
        }}
        className={itemClass}
      >
        <span>👥</span>
        <span>Manage Members</span>
      </button>
      {needsRepoName ? (
        <button
          type="button"
          onClick={() => {
            onOpenGitHubRepo();
            closeMenu();
          }}
          className="w-full px-4 py-2 text-left text-sm text-yellow-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <span>🔗</span>
          <span>Set GitHub Repo</span>
        </button>
      ) : canConnectGitHub ? (
        <a
          href={`/api/github/connect?boardId=${boardId}`}
          className={itemClass}
          onClick={() => closeMenu()}
        >
          <span>🔗</span>
          <span>
            {isGitHubConnected ? "GitHub Connected" : "Connect GitHub"}
          </span>
        </a>
      ) : (
        <div
          className="w-full px-4 py-2 text-left text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center gap-2"
          title={
            githubLimit?.limit === 1
              ? `GitHub integration limit reached (${githubLimit.current}/1). Upgrade to Pro or Enterprise for unlimited integrations.`
              : "GitHub integration limit reached. Please upgrade your plan."
          }
        >
          <span>🔗</span>
          <span>Connect GitHub (Limit Reached)</span>
        </div>
      )}
    </>
  );
}
