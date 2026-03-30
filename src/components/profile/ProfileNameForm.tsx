interface ProfileNameFormProps {
  name: string;
  setName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdatePending: boolean;
}

export function ProfileNameForm({
  name,
  setName,
  onSubmit,
  isUpdatePending,
}: ProfileNameFormProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Display Name
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>
        <button
          type="submit"
          disabled={isUpdatePending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUpdatePending ? "Updating..." : "Update Name"}
        </button>
      </form>
    </div>
  );
}
