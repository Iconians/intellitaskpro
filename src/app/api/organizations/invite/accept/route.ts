import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function acceptInvitation(
  token: string,
  user: { id: string; email: string },
  baseUrl: string
): Promise<
  | { success: true; redirectUrl: string }
  | { success: false; error: string; status: number }
> {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation) {
    return { success: false, error: "Invalid or expired invitation token", status: 404 };
  }
  if (invitation.acceptedAt) {
    return { success: false, error: "This invitation has already been accepted", status: 400 };
  }
  if (invitation.expiresAt < new Date()) {
    return { success: false, error: "This invitation has expired", status: 400 };
  }
  if (invitation.type !== "ORGANIZATION" || !invitation.organizationId) {
    return { success: false, error: "Invalid invitation type", status: 400 };
  }
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return {
      success: false,
      error: `This invitation was sent to ${invitation.email}. Please log in with that email address.`,
      status: 403,
    };
  }

  const existingMember = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: invitation.organizationId,
      },
    },
  });

  if (!existingMember) {
    await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  const redirectUrl = `${baseUrl}/organizations?joined=${invitation.organizationId}`;
  return { success: true, redirectUrl };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      const loginUrl = `/login?invite=${encodeURIComponent(token)}&type=organization`;
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const result = await acceptInvitation(token, user, baseUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.redirect(new URL(result.redirectUrl, request.url));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Prefer POST for accepting invites (avoids CSRF via link prefetch). */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const token =
      typeof body.token === "string" ? body.token : null;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required in body" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const result = await acceptInvitation(token, user, baseUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

