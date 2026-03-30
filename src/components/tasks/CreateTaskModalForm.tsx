import type { TaskPriority } from "@prisma/client";
import type { useCreateTaskModalState } from "../../hooks/useCreateTaskModalState";

type CreateTaskState = ReturnType<typeof useCreateTaskModalState>;

interface CreateTaskModalFormProps {
  state: CreateTaskState;
  onClose: () => void;
}

export function CreateTaskModalForm({
  state,
  onClose,
}: CreateTaskModalFormProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Create Task
        </h2>
        <button
          type="button"
          onClick={() => state.setShowTemplateSelector(true)}
          className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
        >
          📋 Use Template
        </button>
      </div>
      <form onSubmit={state.handleSubmit} className="space-y-4">
        <CreateTaskFields state={state} />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.createTaskMutation.isPending || !state.title.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {state.createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
      {state.createTaskMutation.isError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-medium">Failed to create task</p>
          <p className="mt-1">
            {state.createTaskMutation.error?.message ||
              "An error occurred. The task was not created."}
          </p>
        </div>
      )}
    </>
  );
}

function CreateTaskFields({ state }: { state: CreateTaskState }) {
  return (
    <>
      <input
        id="title"
        type="text"
        required
        value={state.title}
        onChange={(e) => state.setTitle(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="Task title"
      />
      <textarea
        id="description"
        value={state.description}
        onChange={(e) => state.setDescription(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="Task description"
      />
      <select
        id="priority"
        value={state.priority}
        onChange={(e) => state.setPriority(e.target.value as TaskPriority)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
      <TagPicker state={state} />
      <input
        id="dueDate"
        type="date"
        value={state.dueDate}
        onChange={(e) => state.setDueDate(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
      <input
        id="estimatedHours"
        type="number"
        min="0"
        step="0.5"
        value={state.estimatedHours}
        onChange={(e) => state.setEstimatedHours(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="e.g., 4.5"
      />
      {state.title.trim() && (
        <button
          type="button"
          onClick={() => state.generateDescriptionMutation.mutate()}
          disabled={state.generateDescriptionMutation.isPending}
          className="rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {state.generateDescriptionMutation.isPending
            ? "Generating..."
            : "✨ AI Generate"}
        </button>
      )}
    </>
  );
}

function TagPicker({ state }: { state: CreateTaskState }) {
  if (state.tagsLoading)
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading tags...
      </div>
    );
  if (state.tags.length === 0)
    return (
      <div className="text-sm italic text-gray-500 dark:text-gray-400">
        No tags available. Create tags in board settings to organize tasks.
      </div>
    );
  return (
    <div className="flex flex-wrap gap-2">
      {state.tags.map((tag) => {
        const selected = state.selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => state.toggleTag(tag.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
            style={{
              backgroundColor: selected ? tag.color : `${tag.color}20`,
              color: selected ? "#fff" : tag.color,
              borderColor: tag.color,
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
