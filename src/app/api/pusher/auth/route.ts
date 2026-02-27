import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import {
  getCurrentUser,
  requireBoardAccess,
  requireMember,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { socket_id, channel_name } = body;

    if (
      typeof channel_name !== "string" ||
      (!channel_name.startsWith("private-") && !channel_name.startsWith("presence-"))
    ) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
    }

    // Validate the user has access to the resource before authorizing the channel
    const boardMatch = channel_name.match(/^(?:private|presence)-board-(.+)$/);
    const orgMatch = channel_name.match(
      /^(?:private|presence)-organization-(.+)$/
    );
    const userMatch = channel_name.match(/^(?:private|presence)-user-(.+)$/);

    if (boardMatch) {
      const boardId = boardMatch[1];
      try {
        await requireBoardAccess(boardId, "VIEWER");
      } catch {
        return NextResponse.json(
          { error: "No access to this board" },
          { status: 403 }
        );
    }
    } else if (orgMatch) {
      const organizationId = orgMatch[1];
      try {
        await requireMember(organizationId, "VIEWER");
      } catch {
        return NextResponse.json(
          { error: "No access to this organization" },
          { status: 403 }
        );
    }
    } else if (userMatch) {
      const channelUserId = userMatch[1];
      if (channelUserId !== user.id) {
        return NextResponse.json(
          { error: "No access to this channel" },
          { status: 403 }
        );
    }
    } else {
      return NextResponse.json(
        { error: "Invalid channel (unknown prefix)" },
        { status: 400 }
      );
    }

    const auth = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: user.id,
      user_info: {
        email: user.email,
        name: user.name,
      },
    });
    return NextResponse.json(auth);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to authenticate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
