import type { BoardTask, FilterState } from "./types";

function matchesStatus(task: BoardTask, filters: FilterState) {
  return !filters.status || task.status === filters.status;
}

function matchesPriority(task: BoardTask, filters: FilterState) {
  return !filters.priority || task.priority === filters.priority;
}

function matchesAssignee(task: BoardTask, filters: FilterState) {
  return !filters.assigneeId || task.assignee?.id === filters.assigneeId;
}

function matchesTag(task: BoardTask, filters: FilterState) {
  if (!filters.tagId || !task.tags) return true;
  return task.tags.some((taggedTask) => taggedTask.tag?.id === filters.tagId);
}

function matchesDueDate(task: BoardTask, filters: FilterState) {
  if (!task.dueDate) return true;

  const dueDate = new Date(task.dueDate);
  if (filters.dueDateFrom && dueDate < new Date(filters.dueDateFrom)) return false;

  if (filters.dueDateTo) {
    const toDate = new Date(filters.dueDateTo);
    toDate.setHours(23, 59, 59, 999);
    if (dueDate > toDate) return false;
  }

  return true;
}

function matchesSearchQuery(task: BoardTask, filters: FilterState) {
  if (!filters.searchQuery?.trim()) return true;

  const query = filters.searchQuery.toLowerCase();
  const titleMatch = task.title?.toLowerCase().includes(query);
  const descriptionMatch = task.description?.toLowerCase().includes(query);
  return Boolean(titleMatch || descriptionMatch);
}

export function filterTasks(tasks: BoardTask[], filters: FilterState): BoardTask[] {
  return tasks.filter((task) => {
    return (
      matchesStatus(task, filters) &&
      matchesPriority(task, filters) &&
      matchesAssignee(task, filters) &&
      matchesTag(task, filters) &&
      matchesDueDate(task, filters) &&
      matchesSearchQuery(task, filters)
    );
  });
}
