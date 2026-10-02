import { useLanguage } from "../../context/LanguageContext";
import type { VisionAnalysisResult } from "../../types";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-950/80 text-red-300 border-red-700/60",
  high: "bg-amber-950/80 text-amber-300 border-amber-700/60",
  medium: "bg-cyan-950/80 text-cyan-300 border-cyan-700/60",
  low: "bg-zinc-800 text-zinc-300 border-zinc-700",
};

interface ReconAssessmentCardProps {
  result: VisionAnalysisResult;
}

export function ReconAssessmentCard({ result }: ReconAssessmentCardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-2.5">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            {result.model_used}
          </span>
          <h4 className="text-sm md:text-base font-mono font-bold text-zinc-100 uppercase tracking-wide leading-tight">
            {result.title}
          </h4>
        </div>
        <span
          className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase border shrink-0 ${
            PRIORITY_STYLES[result.priority] || PRIORITY_STYLES.high
          }`}
        >
          {result.priority}
        </span>
      </div>

      {result.summary && (
        <div className="text-xs md:text-sm text-zinc-200 leading-relaxed bg-zinc-900/70 p-3 rounded border border-zinc-800/60 font-sans">
          {result.summary}
        </div>
      )}

      {result.detected_features && result.detected_features.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">
            {t.recon.detectedFeatures}
          </span>
          <div className="space-y-1.5">
            {result.detected_features.map((feat, i) => (
              <div
                key={i}
                className="text-xs md:text-sm font-mono text-zinc-200 flex items-start gap-2"
              >
                <span className="text-amber-400 shrink-0 font-bold">▸</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.recommendation && (
        <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-800/50 text-xs md:text-sm font-mono text-amber-200/90 leading-relaxed">
          <span className="font-bold text-amber-400 uppercase mr-1.5 block md:inline mb-1 md:mb-0">
            {t.recon.recommendation}:
          </span>
          {result.recommendation}
        </div>
      )}
    </div>
  );
}
