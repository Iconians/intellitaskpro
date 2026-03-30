interface ProfileDeleteAccountModalProps {
  show: boolean;
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isDeletePending: boolean;
}

export function ProfileDeleteAccountModal({
  show,
  deleteConfirmText,
  setDeleteConfirmText,
  onClose,
  onConfirm,
  isDeletePending,
}: ProfileDeleteAccountModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
          Delete Account
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This action cannot be undone. This will permanently delete your account
          and all associated data.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="DELETE"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isDeletePending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeletePending || deleteConfirmText !== "DELETE"}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeletePending ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
