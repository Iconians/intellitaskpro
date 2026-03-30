import { redirect } from "next/navigation";
import { requireBoardAccess } from "@/lib/auth";
import { BoardPageFooter } from "@/components/boards/BoardPageFooter";
import { BoardPageClient } from "@/components/boards/BoardPageClient";

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
    <div className="flex min-h-0 flex-col overflow-y-auto overflow-x-hidden overflow-touch bg-gray-50 dark:bg-gray-900 max-h-[calc(100dvh-var(--navbar-height))]">
      <BoardPageClient
        boardId={id}
        boardName={board.name}
        boardDescription={board.description}
        userBoardRole={boardMember.role}
        organizationId={board.organizationId}
      />
      <BoardPageFooter />
    </div>
  );
}
