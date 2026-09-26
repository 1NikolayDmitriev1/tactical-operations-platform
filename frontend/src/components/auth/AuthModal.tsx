import { Modal } from "../layout/Modal";
import { AuthForm } from "./AuthForm";
import { useLanguage } from "../../context/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      title={t.auth.modalTitle}
      subtitle={t.auth.modalSubtitle}
      isOpen={isOpen}
      onClose={() => onClose(false)}
    >
      <AuthForm onSuccess={() => onClose(false)} />
    </Modal>
  );
}
