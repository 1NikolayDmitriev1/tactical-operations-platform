import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export type ModalType =
  | "CREATE_TASK"
  | "EDIT_TASK"
  | "DRONE_RECON"
  | "SITREP"
  | null;

export interface PendingTargetDraft {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  id?: number;
  threat_radius?: number | null;
  image_url?: string | null;
}

interface ModalContextType {
  activeModal: ModalType;
  modalData: unknown;
  pendingTarget: PendingTargetDraft | null;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;
  setPendingTarget: (target: PendingTargetDraft | null) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<unknown>(null);
  const [pendingTarget, setPendingTarget] = useState<PendingTargetDraft | null>(null);

  const openModal = (type: ModalType, data: unknown = null) => {
    setActiveModal(type);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        modalData,
        pendingTarget,
        openModal,
        closeModal,
        setPendingTarget,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
