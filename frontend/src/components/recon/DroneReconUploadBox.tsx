import { useState } from "react";
import { Upload } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";
import type { VisionDetection } from "../../types";

interface DroneReconUploadBoxProps {
  previewUrl: string | null;
  detections: VisionDetection[];
  error: string | null;
  onBrowseClick: () => void;
  onFileDrop?: (file: File) => void;
}

export function DroneReconUploadBox({
  previewUrl,
  detections,
  error,
  onBrowseClick,
  onFileDrop,
}: DroneReconUploadBoxProps) {
  const { theme } = useAccent();
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      onFileDrop?.(droppedFile);
    }
  };

  return (
    <section className="flex-1 bg-black/90 relative flex items-center justify-center p-4 overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800 select-none">
      {!previewUrl ? (
        <div
          onClick={onBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-full min-h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-amber-400 bg-amber-500/10 scale-[1.01] shadow-lg shadow-amber-500/10"
              : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/30"
          } group`}
        >
          <div
            className={`p-4 rounded-full bg-zinc-900 border border-zinc-800 group-hover:scale-105 transition-transform ${
              isDragging ? "text-amber-400 scale-110" : theme.textAccent
            }`}
          >
            <Upload size={36} />
          </div>
          <div>
            <div className="font-mono text-sm md:text-base font-bold tracking-wider text-zinc-200">
              {isDragging ? t.recon.dropzoneDragging : t.recon.dropzoneTitle}
            </div>
            <div className="font-mono text-xs text-zinc-400 mt-1.5">
              {t.recon.dropzoneSubtitle}
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-300">
            {t.recon.pipelineBadge}
          </div>
        </div>
      ) : (
        <div className="relative inline-block max-w-full max-h-full rounded border border-zinc-800 shadow-2xl overflow-hidden">
          <img
            src={previewUrl}
            alt="Drone Feed"
            className="max-h-[75vh] w-auto h-auto object-contain block"
          />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {detections.map((target, idx) => {
              const [x1, y1, x2, y2] = target.normalized_box;
              const left = `${x1 * 100}%`;
              const top = `${y1 * 100}%`;
              const width = `${(x2 - x1) * 100}%`;
              const height = `${(y2 - y1) * 100}%`;

              return (
                <g key={idx}>
                  <rect
                    x={left}
                    y={top}
                    width={width}
                    height={height}
                    fill="rgba(245, 158, 11, 0.18)"
                    stroke="rgb(245, 158, 11)"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <foreignObject
                    x={left}
                    y={top}
                    width="240"
                    height="32"
                    style={{ overflow: "visible" }}
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono text-xs font-bold shadow-lg -translate-y-full">
                      <span className="uppercase">{target.label}</span>
                      <span className="opacity-90">{Math.round(target.confidence * 100)}%</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-800 text-red-200 px-3 py-2 rounded text-xs font-mono">
          {error}
        </div>
      )}
    </section>
  );
}
