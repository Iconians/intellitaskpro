import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfileForUser, serializeProfileForClient } from "@/lib/data/profile";
import { ProfilePageClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(user.id);
  if (!profile) {
    redirect("/login");
  }

  return (
    <ProfilePageClient initialProfile={serializeProfileForClient(profile)} />
  );
}
