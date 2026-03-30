import { fetchJsonOrThrow } from "@/lib/http-client";

export async function patchBoard(
  boardId: string,
  body: Record<string, unknown>,
  errorMessage = "Failed to update board"
): Promise<unknown> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return fetchJsonOrThrow(res, errorMessage);
}
