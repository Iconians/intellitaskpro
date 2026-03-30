import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    if (!GITHUB_CLIENT_ID) {
      return NextResponse.json(
        { error: "GitHub OAuth not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const state = boardId || crypto.randomBytes(16).toString("hex");

    const requestOrigin = new URL(request.url).origin.replace(/\/$/, "");
    const envOrigin = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
    if (envOrigin && envOrigin !== requestOrigin) {
      console.warn(
        `GitHub OAuth origin mismatch: NEXTAUTH_URL=${envOrigin}, request=${requestOrigin}`
      );
    }

    const appOrigin = requestOrigin;
    const callbackUrl = `${appOrigin}/api/github/callback`;

    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&scope=repo,read:org,read:project,project&state=${state}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to initiate GitHub OAuth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
