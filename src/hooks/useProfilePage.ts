"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import type { SerializedProfileForClient } from "@/lib/data/profile";
import {
  deleteUserAccount,
  patchUserProfile,
  type PatchProfileBody,
} from "@/lib/profile-client";

export type ProfilePageClientProps = {
  initialProfile: SerializedProfileForClient;
};

export function useProfilePage({ initialProfile }: ProfilePageClientProps) {
  const [profile, setProfile] = useState<SerializedProfileForClient>(initialProfile);
  const [name, setName] = useState(initialProfile.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: PatchProfileBody) => {
      const updated = await patchUserProfile(data);
      return updated as Partial<SerializedProfileForClient>;
    },
    onSuccess: (updated) => {
      setProfile((prev) => ({
        ...prev,
        ...updated,
        createdAt: prev.createdAt,
      }));
      if (updated.name !== undefined) {
        setName(updated.name || "");
      }
      setSuccess("Profile updated successfully!");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteUserAccount(),
    onSuccess: async () => {
      await signOut({ callbackUrl: "/home" });
    },
    onError: (err: Error) => {
      setError(err.message);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    },
  });

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfileMutation.mutate({ name });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    updateProfileMutation.mutate({
      password: newPassword,
      currentPassword,
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type 'DELETE' to confirm");
      return;
    }
    deleteAccountMutation.mutate();
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setError(null);
  };

  return {
    profile,
    name,
    setName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmText,
    setDeleteConfirmText,
    isUpdatePending: updateProfileMutation.isPending,
    isDeletePending: deleteAccountMutation.isPending,
    handleUpdateName,
    handleUpdatePassword,
    handleDeleteAccount,
    closeDeleteModal,
  };
}

export type UseProfilePageResult = ReturnType<typeof useProfilePage>;
