import { TaskGenerator } from "../ai/TaskGenerator";
import { SprintPlanner } from "../ai/SprintPlanner";
import { CreateSprintModal } from "../sprints/CreateSprintModal";
import { BoardMembersModal } from "./BoardMembersModal";
import { GitHubRepoModal } from "./GitHubRepoModal";
import { ManageColumnsModal } from "./ManageColumnsModal";
import { TagManagerModal } from "../tags/TagManagerModal";
import { ExportModal } from "./ExportModal";
import { ImportModal } from "./ImportModal";
import { TemplateEditor } from "../templates/TemplateEditor";
import { RecurringTaskManager } from "../recurring-tasks/RecurringTaskManager";
import type { UseBoardHeaderReturn } from "@/hooks/useBoardHeader";

export function BoardHeaderModals({ h }: { h: UseBoardHeaderReturn }) {
  return (
    <>
      {h.showTaskGenerator && (
        <TaskGenerator
          boardId={h.boardId}
          onClose={() => h.setShowTaskGenerator(false)}
        />
      )}
      {h.showCreateSprint && (
        <CreateSprintModal
          boardId={h.boardId}
          onClose={() => h.setShowCreateSprint(false)}
        />
      )}
      {h.showSprintPlanner && (
        <SprintPlanner
          boardId={h.boardId}
          sprintId={h.activeSprint?.id || null}
          onClose={() => h.setShowSprintPlanner(false)}
        />
      )}
      {h.showBoardMembers && (
        <BoardMembersModal
          boardId={h.boardId}
          onClose={() => h.setShowBoardMembers(false)}
        />
      )}
      {h.showGitHubRepo && (
        <GitHubRepoModal
          boardId={h.boardId}
          currentRepoName={h.board?.githubRepoName}
          currentProjectId={h.board?.githubProjectId}
          onClose={() => h.setShowGitHubRepo(false)}
        />
      )}
      {h.showManageColumns && (
        <ManageColumnsModal
          boardId={h.boardId}
          userBoardRole={h.userBoardRole}
          onClose={() => h.setShowManageColumns(false)}
        />
      )}
      {h.showTagManager && (
        <TagManagerModal
          boardId={h.boardId}
          organizationId={h.organizationId}
          userBoardRole={h.userBoardRole}
          onClose={() => h.setShowTagManager(false)}
        />
      )}
      {h.showExportModal && (
        <ExportModal
          boardId={h.boardId}
          boardName={h.boardName}
          onClose={() => h.setShowExportModal(false)}
        />
      )}
      {h.showImportModal && (
        <ImportModal
          boardId={h.boardId}
          onClose={() => h.setShowImportModal(false)}
        />
      )}
      {h.showTemplateEditor && (
        <TemplateEditor
          boardId={h.boardId}
          organizationId={h.organizationId}
          onClose={() => h.setShowTemplateEditor(false)}
        />
      )}
      {h.showRecurringTasks && (
        <RecurringTaskManager
          boardId={h.boardId}
          organizationId={h.organizationId}
          onClose={() => h.setShowRecurringTasks(false)}
        />
      )}
    </>
  );
}
