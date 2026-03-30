"use client";

import { useState, type CSSProperties } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ModalPortal } from "../shared/ModalPortal";
import { EditTaskModal } from "./EditTaskModal";
import { TagSelector } from "./TagSelector";
import { TaskChecklist } from "./TaskChecklist";
import { TaskDependencies } from "./TaskDependencies";
import { TimeTracker } from "./TimeTracker";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { CustomFieldsDisplay } from "./CustomFieldsDisplay";

export interface TaskDetailModalProps {
  taskId: string;
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  onClose: () => void;
}

export function TaskDetailModalContent({
  taskId,
  boardId,
  organizationId,
  userBoardRole,
  onClose,
}: TaskDetailModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"details" | "checklist" | "dependencies" | "time" | "approvals">("details");
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
  });
  const { data: watchers } = useQuery({
    queryKey: ["task-watchers", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/watchers`);
      if (!res.ok) throw new Error("Failed to fetch watchers");
      return res.json();
    },
  });

  const watchMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/watchers`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to watch task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-watchers", taskId] }),
  });
  const unwatchMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/watchers`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to unwatch task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-watchers", taskId] }),
  });
  const cloneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeSubtasks: true, includeChecklist: true, includeTags: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to clone task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      alert("Task cloned successfully!");
    },
  });

  const currentUserId = session?.user?.id;
  const userIsWatching = watchers?.some((w: { userId: string }) => w.userId === currentUserId);
  if (isLoading) return <ModalPortal><div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-2 xs:p-4 pointer-events-auto"><div className="mx-2 max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-3 xs:mx-4 xs:p-4 sm:p-6 dark:bg-gray-800"><div className="text-center">Loading task...</div></div></div></ModalPortal>;
  if (!task) return null;

  const canEdit = userBoardRole === "ADMIN" || userBoardRole === "MEMBER";
  const descriptionRows = task.description ? Math.min(28, Math.max(5, task.description.split("\n").length + 2)) : 5;
  const selectableSurfaceStyle: CSSProperties = { userSelect: "text", WebkitUserSelect: "text" };

  return (
    <ModalPortal>
      <>
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-2 xs:p-4 pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <div className="mx-2 my-2 max-h-[95vh] w-full max-w-4xl select-text overflow-y-auto rounded-lg bg-white xs:mx-4 xs:my-4 xs:max-h-[90vh] sm:my-8 dark:bg-gray-800" style={selectableSurfaceStyle} onClick={(e) => e.stopPropagation()}>
            <div className="pointer-events-none sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] gap-x-2 gap-y-3 p-2 xs:p-3 sm:p-4 min-[801px]:grid-cols-[minmax(0,1fr)_auto_auto] min-[801px]:grid-rows-1 min-[801px]:items-start min-[801px]:gap-x-4 min-[801px]:gap-y-0">
                <div className="pointer-events-auto col-start-1 row-start-1 min-w-0"><h2 className="mb-2 w-full break-words text-lg font-bold text-gray-900 xs:text-xl sm:text-2xl dark:text-white">{task.title}</h2><div className="flex flex-wrap items-center gap-1.5 xs:gap-2"><span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 xs:px-2 xs:py-1 dark:bg-blue-900 dark:text-blue-200">{task.status}</span><span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800 xs:px-2 xs:py-1 dark:bg-orange-900 dark:text-orange-200">{task.priority}</span>{task.assignee && <span className="max-w-[120px] truncate rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 xs:max-w-none xs:px-2 xs:py-1 dark:bg-purple-900 dark:text-purple-200">👤 {task.assignee.user?.name || task.assignee.user?.email}</span>}</div></div>
                <button type="button" onClick={onClose} className="pointer-events-auto col-start-2 row-start-1 self-start justify-self-end px-2 py-1 text-xs text-gray-600 hover:text-gray-800 xs:px-3 xs:text-sm min-[801px]:col-start-3 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
                {canEdit && <div className="pointer-events-auto col-span-2 row-start-2 flex flex-wrap items-center gap-2 min-[801px]:col-span-1 min-[801px]:col-start-2 min-[801px]:row-start-1 min-[801px]:flex-nowrap"><button type="button" onClick={() => userIsWatching ? unwatchMutation.mutate() : watchMutation.mutate()} className="whitespace-nowrap rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 xs:px-3 xs:text-sm dark:border-gray-600 dark:hover:bg-gray-700" title={userIsWatching ? "Unwatch" : "Watch"}><span className="hidden xs:inline">{userIsWatching ? "👁️ Watching" : "👁️ Watch"}</span><span className="xs:hidden">👁️</span></button><button type="button" onClick={() => cloneMutation.mutate()} disabled={cloneMutation.isPending} className="whitespace-nowrap rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 xs:px-3 xs:text-sm dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50" title="Clone task"><span className="hidden xs:inline">📋 Clone</span><span className="xs:hidden">📋</span></button><button type="button" onClick={() => setShowEditModal(true)} className="whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 xs:px-3 xs:text-sm">Edit</button></div>}
              </div>
            </div>
            <div className="overflow-x-auto border-b border-gray-200 px-2 xs:px-4 dark:border-gray-700"><div className="flex min-w-max gap-1 xs:gap-2 sm:gap-4">{(["details", "checklist", "dependencies", "time", "approvals"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 whitespace-nowrap border-b-2 px-2 py-1.5 text-xs font-medium xs:px-3 xs:py-2 xs:text-sm sm:px-4 ${activeTab === tab ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>)}</div></div>
            <div className="space-y-4 p-3 xs:space-y-6 xs:p-4 sm:p-6">
              {activeTab === "details" && <div className="space-y-6">{task.description && <div><h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Description</h3><textarea readOnly aria-label="Task description" value={task.description} rows={descriptionRows} spellCheck={false} style={selectableSurfaceStyle} className="min-h-[5rem] w-full resize-y rounded border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-900 shadow-none outline-none ring-0 focus:ring-2 focus:ring-blue-500/40 dark:text-white" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /></div>}{organizationId && <div><h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tags</h3><TagSelector taskId={taskId} boardId={boardId} organizationId={organizationId} userBoardRole={userBoardRole} /></div>}{task.dueDate && <div><h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</h3><p className="text-sm text-gray-900 dark:text-white">{new Date(task.dueDate).toLocaleDateString()}</p></div>}{(task.estimatedHours || task.actualHours) && <div><h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Time</h3><div className="space-y-1 text-sm text-gray-900 dark:text-white">{task.estimatedHours && <div>Estimated: {task.estimatedHours}h</div>}{task.actualHours && <div>Actual: {task.actualHours.toFixed(2)}h</div>}</div></div>}</div>}
              {activeTab === "checklist" && <TaskChecklist taskId={taskId} boardId={boardId} userBoardRole={userBoardRole} />}
              {activeTab === "dependencies" && <TaskDependencies taskId={taskId} boardId={boardId} userBoardRole={userBoardRole} />}
              {activeTab === "time" && <TimeTracker taskId={taskId} boardId={boardId} userBoardRole={userBoardRole} />}
              {activeTab === "approvals" && <ApprovalWorkflow taskId={taskId} boardId={boardId} organizationId={organizationId} />}
              {activeTab === "details" && <CustomFieldsDisplay taskId={taskId} boardId={boardId} userBoardRole={userBoardRole} />}
            </div>
          </div>
        </div>
        {showEditModal && <EditTaskModal taskId={taskId} boardId={boardId} currentTitle={task.title} currentDescription={task.description} onClose={() => { setShowEditModal(false); queryClient.invalidateQueries({ queryKey: ["task", taskId] }); }} />}
      </>
    </ModalPortal>
  );
}
