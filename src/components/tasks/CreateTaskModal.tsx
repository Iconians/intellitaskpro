import { ModalPortal } from "../shared/ModalPortal";
import { TemplateSelector } from "../templates/TemplateSelector";
import { useCreateTaskModalState } from "../../hooks/useCreateTaskModalState";
import { CreateTaskModalForm } from "./CreateTaskModalForm";

interface CreateTaskModalProps {
  boardId: string;
  organizationId?: string;
  defaultStatus?: string;
  onClose: () => void;
}

export function CreateTaskModal({
  boardId,
  organizationId,
  defaultStatus,
  onClose,
}: CreateTaskModalProps) {
  const state = useCreateTaskModalState({
    boardId,
    organizationId,
    defaultStatus,
    onClose,
  });

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-2 xs:p-4 pointer-events-auto">
        <div className="mx-2 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-3 shadow-xl xs:mx-4 xs:max-h-[90vh] xs:p-4 sm:p-6 dark:bg-gray-800">
          <CreateTaskModalForm state={state} onClose={onClose} />
        </div>

        {state.showTemplateSelector && (
          <TemplateSelector
            boardId={boardId}
            organizationId={organizationId}
            onSelect={state.handleTemplateSelect}
            onClose={() => state.setShowTemplateSelector(false)}
          />
        )}
      </div>
    </ModalPortal>
  );
}
