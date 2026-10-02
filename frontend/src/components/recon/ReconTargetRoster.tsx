import { Target, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { VisionDetection } from "../../types";

interface ReconTargetRosterProps {
  detections: VisionDetection[];
  hasValidCoords: boolean;
  onDeployObject: (target: VisionDetection) => void;
}

export function ReconTargetRoster({
  detections,
  hasValidCoords,
  onDeployObject,
}: ReconTargetRosterProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 pt-1">
      <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
        <Target size={14} />
        {t.recon.acquiredTargets} ({detections.length})
      </span>

      {detections.length === 0 ? (
        <div className="h-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg text-center p-3 text-zinc-500">
          <Target size={20} className="mb-1 opacity-50" />
          <span className="text-xs font-mono font-semibold">
            {t.recon.noTargets}
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {detections.map((target, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-xs">
                    #{idx + 1}
                  </span>
                  <span className="font-mono text-xs md:text-sm font-bold uppercase text-zinc-100">
                    {target.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
                  {Math.round(target.confidence * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDeployObject(target)}
                className="py-1.5 px-2.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>
                  {hasValidCoords ? t.recon.deployToMap : t.recon.selectTarget}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
