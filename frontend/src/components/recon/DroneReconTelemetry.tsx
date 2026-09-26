import { useState } from "react";
import { Upload, Sliders, Cpu, Loader2, Target, RefreshCw } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";
import type { ReconMetrics } from "../../hooks/useDroneRecon";

interface DroneReconTelemetryProps {
  metrics: ReconMetrics;
  isLoading: boolean;
  hasFile: boolean;
  onAnalyze: (confidence: number) => void;
  onReset: () => void;
  onBrowseClick: () => void;
}

export function DroneReconTelemetry({
  metrics,
  isLoading,
  hasFile,
  onAnalyze,
  onReset,
  onBrowseClick,
}: DroneReconTelemetryProps) {
  const { theme } = useAccent();
  const { t } = useLanguage();

  const [confidence, setConfidence] = useState<number>(0.25);

  const { detections, inferenceTime, imageSize } = metrics;

  return (
    <aside className="w-full md:w-80 bg-zinc-900/60 flex flex-col shrink-0 overflow-y-auto divide-y divide-zinc-800/80">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
            <Sliders size={13} className={theme.textAccent} />
            {t.recon.confidenceThreshold}
          </span>
          <span className="text-[11px] font-mono text-zinc-300 font-bold bg-zinc-800 px-2 py-0.5 rounded">
            {Math.round(confidence * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.05"
          max="1.0"
          step="0.05"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onAnalyze(confidence)}
            disabled={!hasFile || isLoading}
            className={`col-span-2 py-2.5 px-3 rounded font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !hasFile || isLoading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/10 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t.recon.analyzingFeed}
              </>
            ) : (
              <>
                <Cpu size={14} />
                {t.recon.runRecon}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBrowseClick}
            className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload size={12} />
            {t.recon.newFeed}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
            {t.recon.reset}
          </button>
        </div>
      </div>
      <div className="p-4 space-y-2 bg-zinc-950/40">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
          {t.recon.scanMetrics}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <div className="text-[9px] font-mono text-zinc-500">
              {t.recon.targets}
            </div>
            <div className="text-lg font-mono font-bold text-zinc-100">
              {detections.length}
            </div>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <div className="text-[9px] font-mono text-zinc-500">
              {t.recon.latency}
            </div>
            <div className="text-lg font-mono font-bold text-zinc-100">
              {inferenceTime ? `${inferenceTime}ms` : "--"}
            </div>
          </div>
        </div>
        {imageSize && (
          <div className="text-[10px] font-mono text-zinc-500 flex justify-between pt-1">
            <span>{t.recon.feedRes}</span>
            <span className="text-zinc-400">
              {imageSize.width} × {imageSize.height} PX
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col min-h-0">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1 pb-2">
          <Target size={12} />
          {t.recon.acquiredTargets} ({detections.length})
        </span>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {detections.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-center text-zinc-600 font-mono text-[11px]">
              <div>{t.recon.noTargets}</div>
              <div className="text-[9px] text-zinc-700 mt-1">
                {t.recon.noTargetsHint}
              </div>
            </div>
          ) : (
            detections.map((target, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-mono text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase text-zinc-200">
                      {target.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {t.recon.class}: {target.class_id}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {Math.round(target.confidence * 100)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
