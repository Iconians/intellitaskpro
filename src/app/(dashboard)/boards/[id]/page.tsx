import { redirect } from "next/navigation";
import { requireBoardAccess } from "@/lib/auth";
import { BoardPageClient } from "./board-client";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let board: Awaited<ReturnType<typeof requireBoardAccess>>["board"];
  let boardMember: Awaited<ReturnType<typeof requireBoardAccess>>["boardMember"];
  try {
    const result = await requireBoardAccess(id);
    board = result.board;
    boardMember = result.boardMember;
  } catch {
    redirect("/boards");
  }

  if (!board || !boardMember) return null;
  return (
    <BoardPageClient
      boardId={id}
      boardName={board.name}
      boardDescription={board.description}
      userBoardRole={boardMember.role}
      organizationId={board.organizationId}
    />
  );
}
