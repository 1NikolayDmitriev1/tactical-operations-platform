import type { Task } from "../../types";
import { useModal } from "../../context/ModalContext";
import { useLanguage } from "../../context/LanguageContext";
import { TaskForm } from "./TaskForm";
import { Modal } from "../layout/Modal";

interface TaskModalData {
  task?: Task;
  coords?: { lat: number; lng: number } | null;
}

export function TaskModal() {
  const { activeModal, closeModal, modalData } = useModal();
  const { t } = useLanguage();

  const isEdit = activeModal === "EDIT_TASK";
  const isOpen = activeModal === "CREATE_TASK" || isEdit;
  const data = modalData as TaskModalData | null | undefined;
  const editingTask = data?.task;
  const coords = data?.coords;

  const title = isEdit ? t.modal.editTitle : t.modal.createTitle;
  const subtitle = isEdit
    ? `${t.modal.targetId}: #${editingTask?.id}`
    : coords
      ? `${t.modal.gridTarget}: ${coords.lat}, ${coords.lng}`
      : t.modal.manualGrid;

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      isOpen={isOpen}
      onClose={closeModal}
    >
      <TaskForm task={editingTask} coords={coords} onSuccess={closeModal} />
    </Modal>
  );
}
