import { fetchJsonOrThrow } from "@/lib/http-client";

export async function describeTaskFromTitle(body: {
  title: string;
  boardId: string;
}): Promise<{ description?: string }> {
  const res = await fetch("/api/ai/describe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return fetchJsonOrThrow(res, "Failed to generate description");
}

export async function createTaskRequest(
  payload: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return fetchJsonOrThrow(res, "Failed to create task");
}

export async function attachTagIdsToTask(
  taskId: string,
  tagIds: string[]
): Promise<void> {
  await Promise.all(
    tagIds.map(async (tagId) => {
      const res = await fetch(`/api/tasks/${taskId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      await fetchJsonOrThrow(res, "Failed to attach tag");
    })
  );
}
