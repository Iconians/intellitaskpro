"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: async (data: {
      name?: string;
      password?: string;
      currentPassword?: string;
    }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useProfileDelete() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }
      return res.json();
    },
  });
}
