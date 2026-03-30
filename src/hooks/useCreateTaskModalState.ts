"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskPriority, TaskStatus } from "@prisma/client";

import {
  attachTagIdsToTask,
  createTaskRequest,
  describeTaskFromTitle,
} from "@/lib/task-create-client";

interface Board {
  tasks: Array<{ id: string; status: TaskStatus }>;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TemplateTask {
  title: string;
  taskDescription?: string | null;
  priority: string;
  estimatedHours?: number | null;
}

interface UseCreateTaskModalStateParams {
  boardId: string;
  organizationId?: string;
  defaultStatus?: string;
  onClose: () => void;
}

function mergeTagsUnique(orgTags: Tag[], boardTags: Tag[]): Tag[] {
  return Array.from(
    new Map([...orgTags, ...boardTags].map((tag) => [tag.id, tag])).values()
  );
}

function buildOptimisticTask(
  title: string,
  description: string,
  defaultStatus: string | undefined,
  priority: TaskPriority,
  previousBoard: Board
) {
  const status = (defaultStatus as TaskStatus) || "TODO";
  return {
    id: `temp-${Date.now()}`,
    title,
    description: description || null,
    status,
    priority,
    assigneeId: null,
    assignee: null,
    order: previousBoard.tasks.filter((task) => task.status === status).length,
  };
}

export function useCreateTaskModalState({
  boardId,
  organizationId,
  defaultStatus,
  onClose,
}: UseCreateTaskModalStateParams) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const queryClient = useQueryClient();

  const { data: boardTags = [], isLoading: boardTagsLoading } = useQuery<Tag[]>({
    queryKey: ["tags", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/tags?boardId=${boardId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: Boolean(boardId),
  });

  const { data: orgTags = [], isLoading: orgTagsLoading } = useQuery<Tag[]>({
    queryKey: ["tags", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const res = await fetch(`/api/tags?organizationId=${organizationId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: Boolean(organizationId),
  });

  const tags = mergeTagsUnique(orgTags, boardTags);
  const tagsLoading = boardTagsLoading || orgTagsLoading;

  const generateDescriptionMutation = useMutation({
    mutationFn: () => describeTaskFromTitle({ title, boardId }),
    onSuccess: (data) => setDescription(data.description || ""),
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const task = await createTaskRequest({
        title,
        description,
        boardId,
        status: defaultStatus,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });
      const taskId = (task as { id?: string }).id;
      if (selectedTagIds.length > 0 && taskId) {
        await attachTagIdsToTask(taskId, selectedTagIds);
      }
      return task;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previousBoard = queryClient.getQueryData<Board>(["board", boardId]);
      if (!previousBoard) return { previousBoard };
      const optimisticTask = buildOptimisticTask(
        title,
        description,
        defaultStatus,
        priority,
        previousBoard
      );
      queryClient.setQueryData<Board>(["board", boardId], (old) =>
        old ? { ...old, tasks: [...old.tasks, optimisticTask] } : old
      );
      return { previousBoard };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
    },
    onSuccess: (task: unknown) => {
      const created = task as Board["tasks"][number];
      queryClient.setQueryData<Board>(["board", boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: [
            ...old.tasks.filter((item) => !item.id.startsWith("temp-")),
            created,
          ],
        };
      });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setSelectedTagIds([]);
      setDueDate("");
      setEstimatedHours("");
      onClose();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  });

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleTemplateSelect = (template: TemplateTask) => {
    setTitle(template.title);
    setDescription(template.taskDescription || "");
    setPriority(template.priority as TaskPriority);
    setEstimatedHours(template.estimatedHours?.toString() || "");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    createTaskMutation.mutate();
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    estimatedHours,
    setEstimatedHours,
    selectedTagIds,
    toggleTag,
    tags,
    tagsLoading,
    showTemplateSelector,
    setShowTemplateSelector,
    generateDescriptionMutation,
    createTaskMutation,
    handleTemplateSelect,
    handleSubmit,
  };
}
