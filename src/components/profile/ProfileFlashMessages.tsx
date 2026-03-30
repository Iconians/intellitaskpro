interface ProfileFlashMessagesProps {
  error: string | null;
  success: string | null;
}

export function ProfileFlashMessages({
  error,
  success,
}: ProfileFlashMessagesProps) {
  return (
    <>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </>
  );
}
