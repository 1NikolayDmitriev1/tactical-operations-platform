import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAccent } from "../../context/AccentContext";

interface ModalProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { theme } = useAccent();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={`m-auto rounded-xl border border-zinc-700/80 bg-zinc-900 p-5 md:p-6 text-zinc-100 shadow-2xl ${maxWidth} w-full open:flex flex-col gap-4 backdrop:bg-zinc-950/80 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200`}
    >
      <div className="flex justify-between items-center pb-3 border-b border-zinc-700/60">
        <div className="flex flex-col">
          <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-200 uppercase">
            {title}
          </h3>
          {subtitle && (
            <span className={`text-[10px] font-mono ${theme.textAccent}`}>
              {subtitle}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-200 text-base p-1 cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>,
    document.body,
  );
}
