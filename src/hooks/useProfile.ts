"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteUserAccount,
  patchUserProfile,
  type PatchProfileBody,
} from "@/lib/profile-client";

export interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
  githubUsername: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export function useProfile(initialProfile?: ProfileUser | null) {
  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    initialData: initialProfile ?? undefined,
  });
  return query;
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatchProfileBody) => patchUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useProfileDelete() {
  return useMutation({
    mutationFn: () => deleteUserAccount(),
  });
}
