import { NextRequest, NextResponse } from "next/server";
import { requireMember, requireBoardAccess } from "@/lib/auth";
import { getAnalyticsPayload } from "@/lib/data/analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const boardId = searchParams.get("boardId");
    const sprintId = searchParams.get("sprintId");
    const period = searchParams.get("period") || "month";

    if (!organizationId && !boardId) {
      return NextResponse.json(
        { error: "organizationId or boardId is required" },
        { status: 400 }
      );
    }

    if (organizationId) {
      await requireMember(organizationId, "VIEWER");
    }

    if (boardId) {
      await requireBoardAccess(boardId, "VIEWER");
    }

    const payload = await getAnalyticsPayload({
      organizationId,
      boardId,
      sprintId,
      period,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch analytics";
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
