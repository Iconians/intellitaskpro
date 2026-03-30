import Link from "next/link";
import type { UseProfilePageResult } from "@/hooks/useProfilePage";
import { ProfileAccountInfo } from "./ProfileAccountInfo";
import { ProfileDangerZone } from "./ProfileDangerZone";
import { ProfileDeleteAccountModal } from "./ProfileDeleteAccountModal";
import { ProfileFlashMessages } from "./ProfileFlashMessages";
import { ProfileNameForm } from "./ProfileNameForm";
import { ProfilePasswordForm } from "./ProfilePasswordForm";

type ProfilePageViewProps = UseProfilePageResult;

export function ProfilePageView(props: ProfilePageViewProps) {
  const {
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
    isUpdatePending,
    isDeletePending,
    handleUpdateName,
    handleUpdatePassword,
    handleDeleteAccount,
    closeDeleteModal,
  } = props;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/boards"
          className="text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 inline-block"
        >
          ← Back to Boards
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 lg:p-8 space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>

          <ProfileFlashMessages error={error} success={success} />
          <ProfileAccountInfo profile={profile} />
          <ProfileNameForm
            name={name}
            setName={setName}
            onSubmit={handleUpdateName}
            isUpdatePending={isUpdatePending}
          />
          <ProfilePasswordForm
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handleUpdatePassword}
            isUpdatePending={isUpdatePending}
          />
          <ProfileDangerZone onOpenDelete={() => setShowDeleteModal(true)} />
        </div>
      </div>

      <ProfileDeleteAccountModal
        show={showDeleteModal}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        isDeletePending={isDeletePending}
      />
    </div>
  );
}
