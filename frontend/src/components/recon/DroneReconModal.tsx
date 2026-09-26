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

  const { feed, scanResult, isLoading, error, selectFile, analyze, reset } =
    useDroneRecon();

  return (
    <Modal
      title={t.recon.modalTitle}
      subtitle={
        isLoading
          ? t.recon.statusRunning
          : scanResult && scanResult.detections.length > 0
            ? `${t.recon.targetsAcquiredPrefix} ${scanResult.detections.length} ${t.recon.targetsAcquiredSuffix}`
            : t.recon.statusStandby
      }
      isOpen={activeModal === "DRONE_RECON"}
      onClose={closeModal}
      maxWidth="max-w-5xl"
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

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden border border-zinc-800 rounded-lg bg-zinc-950 min-h-125 max-h-[72vh]">
        <DroneReconUploadBox
          previewUrl={feed?.previewUrl ?? null}
          detections={scanResult?.detections ?? []}
          error={error}
          onBrowseClick={() => fileInputRef.current?.click()}
          onFileDrop={selectFile}
        />

        <DroneReconTelemetry
          metrics={
            scanResult ?? {
              detections: [],
              inferenceTime: null,
              imageSize: null,
            }
          }
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
