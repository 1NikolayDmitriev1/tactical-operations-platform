import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { VisionAnalysisResult, VisionDetection } from "../../types";
import { useTask } from "../../context/TaskContext";
import { useModal } from "../../context/ModalContext";
import { ReconTelemetryHeader } from "./ReconTelemetryHeader";
import { ReconAssessmentCard } from "./ReconAssessmentCard";
import { ReconSectorCoordinates } from "./ReconSectorCoordinates";
import { ReconTargetRoster } from "./ReconTargetRoster";

interface DroneReconTelemetryProps {
  result: VisionAnalysisResult | null;
  isLoading: boolean;
  hasFile: boolean;
  previewUrl?: string | null;
  onAnalyze: (lang: string) => void;
  onReset: () => void;
  onBrowseClick: () => void;
}

export function DroneReconTelemetry({
  result,
  isLoading,
  hasFile,
  previewUrl,
  onAnalyze,
  onReset,
  onBrowseClick,
}: DroneReconTelemetryProps) {
  const { t } = useLanguage();
  const { closeModal, openModal, setPendingTarget } = useModal();
  const { addTask } = useTask();

  const [latInput, setLatInput] = useState<string>("");
  const [lngInput, setLngInput] = useState<string>("");

  useEffect(() => {
    if (
      result?.has_exif_coords &&
      result.latitude != null &&
      result.longitude != null
    ) {
      setLatInput(result.latitude.toFixed(6));
      setLngInput(result.longitude.toFixed(6));
    } else {
      setLatInput("");
      setLngInput("");
    }
  }, [result]);

  const hasValidCoords =
    latInput.trim() !== "" &&
    lngInput.trim() !== "" &&
    !isNaN(Number(latInput)) &&
    !isNaN(Number(lngInput));

  const buildTaskDescription = (res: VisionAnalysisResult) => {
    return [
      res.summary,
      res.detected_features?.length
        ? `${t.recon.featuresPrefix} ${res.detected_features.join("; ")}`
        : "",
      res.recommendation
        ? `${t.recon.recommendationPrefix} ${res.recommendation}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const handlePickOnMap = (customTitle?: string, customDesc?: string) => {
    if (!result) return;
    setPendingTarget({
      title: customTitle || result.title,
      description: customDesc || buildTaskDescription(result),
      priority: result.priority,
      image_url: previewUrl,
    });
    closeModal();
  };

  const handleDeployDirect = async () => {
    if (!result) return;
    await addTask({
      title: result.title,
      description: buildTaskDescription(result),
      priority: result.priority,
      status: "pending",
      latitude: hasValidCoords ? Number(latInput) : null,
      longitude: hasValidCoords ? Number(lngInput) : null,
      image_url: previewUrl,
    });
    closeModal();
  };

  const handleDeployObject = async (target: VisionDetection) => {
    const targetTitle = `${t.recon.targetPrefix} ${target.label.toUpperCase()} (${Math.round(target.confidence * 100)}%)`;
    const targetDesc = `${t.recon.detectedByVision} ${target.label} (${t.recon.confidence} ${Math.round(target.confidence * 100)}%).`;

    if (!hasValidCoords) {
      handlePickOnMap(targetTitle, targetDesc);
      return;
    }

    await addTask({
      title: targetTitle,
      description: targetDesc,
      priority: target.confidence > 0.8 ? "critical" : "high",
      status: "pending",
      latitude: Number(latInput),
      longitude: Number(lngInput),
      image_url: previewUrl,
    });
    closeModal();
  };

  const handleOpenInFullModal = (customTitle?: string, customDesc?: string) => {
    if (!result) return;
    const title = customTitle || result.title;
    const description = customDesc || buildTaskDescription(result);

    if (!hasValidCoords) {
      handlePickOnMap(customTitle, customDesc);
      return;
    }

    closeModal();
    openModal("CREATE_TASK", {
      task: {
        title,
        description,
        priority: result.priority,
        latitude: Number(latInput),
        longitude: Number(lngInput),
      },
      coords: {
        lat: Number(latInput),
        lng: Number(lngInput),
      },
    });
  };

  return (
    <aside className="w-full md:w-115 lg:w-125 bg-zinc-900/80 flex flex-col shrink-0 overflow-y-auto divide-y divide-zinc-800">
      <ReconTelemetryHeader
        isLoading={isLoading}
        hasFile={hasFile}
        imageSize={result?.image_size}
        onAnalyze={onAnalyze}
        onBrowseClick={onBrowseClick}
        onReset={onReset}
      />

      {result ? (
        <div className="p-4 space-y-4">
          <ReconAssessmentCard result={result} />

          <ReconSectorCoordinates
            latInput={latInput}
            lngInput={lngInput}
            hasExifCoords={result.has_exif_coords}
            hasValidCoords={hasValidCoords}
            onChangeLat={setLatInput}
            onChangeLng={setLngInput}
            onDeployDirect={handleDeployDirect}
            onOpenInFullModal={() => handleOpenInFullModal()}
          />

          <ReconTargetRoster
            detections={result.detections}
            hasValidCoords={hasValidCoords}
            onDeployObject={handleDeployObject}
          />
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 my-auto">
          <div className="p-4 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600">
            <Target size={36} />
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold text-zinc-300 uppercase">
              {t.recon.statusStandby}
            </h4>
            <p className="font-mono text-xs text-zinc-500 mt-1 max-w-xs">
              {t.recon.noTargetsHint}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
