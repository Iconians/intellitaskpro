interface BoardHeaderTitleBlockProps {
  boardName: string;
  boardDescription?: string | null;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  isEditingTitle: boolean;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
}

export function BoardHeaderTitleBlock({
  boardName,
  boardDescription,
  userBoardRole,
  isEditingTitle,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onSaveTitle,
  onCancelEdit,
}: BoardHeaderTitleBlockProps) {
  const canEdit = userBoardRole === "ADMIN" || userBoardRole === "MEMBER";

  return (
    <div className="flex-1 min-w-0 w-full">
      {isEditingTitle && canEdit ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          className="w-full px-2 py-1 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveTitle();
            else if (e.key === "Escape") onCancelEdit();
          }}
          onBlur={onSaveTitle}
        />
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {boardName}
          </h1>
          {canEdit && (
            <button
              type="button"
              onClick={onStartEdit}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex-shrink-0"
              title="Edit board title"
            >
              ✏️
            </button>
          )}
        </div>
      )}
      {boardDescription && (
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {boardDescription}
        </p>
      )}
    </div>
  );
}
