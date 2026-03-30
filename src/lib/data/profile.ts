import { prisma } from "@/lib/prisma";

export type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  githubUsername: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

/** Serializable for RSC → client props */
export type SerializedProfileForClient = Omit<ProfileUser, "createdAt"> & {
  createdAt: string;
};

export function serializeProfileForClient(
  profile: ProfileUser
): SerializedProfileForClient {
  return {
    ...profile,
    createdAt:
      profile.createdAt instanceof Date
        ? profile.createdAt.toISOString()
        : String(profile.createdAt),
  };
}

export async function getProfileForUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      githubUsername: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  return user;
}
