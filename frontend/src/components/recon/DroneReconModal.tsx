import { useRef } from "react";
import { useModal } from "../../context/ModalContext";
import { useLanguage } from "../../context/LanguageContext";
import { Modal } from "../layout/Modal";
import { DroneReconUploadBox } from "./DroneReconUploadBox";
import { DroneReconTelemetry } from "./DroneReconTelemetry";
import { useDroneRecon } from "../../hooks/useDroneRecon";

export function DroneReconModal() {
  const { activeModal, closeModal } = useModal();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    feed,
    result,
    isLoading,
    error,
    selectFile,
    analyze,
    reset,
  } = useDroneRecon();

  const subtitle = isLoading
    ? t.recon.statusRunning
    : result
      ? `${result.title} // [${result.priority.toUpperCase()}] (${result.detections.length} ${t.recon.targets})`
      : t.recon.statusStandby;

  return (
    <Modal
      title={t.recon.modalTitle}
      subtitle={subtitle}
      isOpen={activeModal === "DRONE_RECON"}
      onClose={closeModal}
      maxWidth="max-w-[96vw] xl:max-w-7xl"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) selectFile(file);
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden border border-zinc-800 rounded-xl bg-zinc-950 min-h-[600px] max-h-[85vh]">
        <DroneReconUploadBox
          previewUrl={feed?.previewUrl ?? null}
          detections={result?.detections ?? []}
          error={error}
          onBrowseClick={() => fileInputRef.current?.click()}
          onFileDrop={selectFile}
        />

        <DroneReconTelemetry
          result={result}
          isLoading={isLoading}
          hasFile={!!feed}
          onAnalyze={analyze}
          onReset={reset}
          onBrowseClick={() => fileInputRef.current?.click()}
        />
      </div>
    </Modal>
  );
}
