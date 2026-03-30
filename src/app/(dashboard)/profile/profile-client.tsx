"use client";

import { ProfilePageView } from "@/components/profile/ProfilePageView";
import { useProfilePage, type ProfilePageClientProps } from "@/hooks/useProfilePage";

export type { ProfilePageClientProps };

export function ProfilePageClient(props: ProfilePageClientProps) {
  const state = useProfilePage(props);
  return <ProfilePageView {...state} />;
}
