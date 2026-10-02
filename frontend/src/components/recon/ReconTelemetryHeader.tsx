import { Upload, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface ReconTelemetryHeaderProps {
  isLoading: boolean;
  hasFile: boolean;
  imageSize?: { width: number; height: number };
  onAnalyze: (lang: string) => void;
  onBrowseClick: () => void;
  onReset: () => void;
}

export function ReconTelemetryHeader({
  isLoading,
  hasFile,
  imageSize,
  onAnalyze,
  onBrowseClick,
  onReset,
}: ReconTelemetryHeaderProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="p-4 bg-zinc-950/80 space-y-3">
      <button
        type="button"
        onClick={() => onAnalyze(lang)}
        disabled={!hasFile || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-mono text-xs md:text-sm font-bold tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
          !hasFile || isLoading
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/15 active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>{t.recon.analyzingVision}</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>{t.recon.runVision}</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onBrowseClick}
          className="py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase"
        >
          <Upload size={14} />
          <span>{t.recon.newFeed}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase"
        >
          <RefreshCw size={14} />
          <span>{t.recon.reset}</span>
        </button>
      </div>

      {imageSize && imageSize.width > 0 && (
        <div className="text-xs font-mono text-zinc-400 flex justify-between pt-1 px-1">
          <span>{t.recon.feedRes}</span>
          <span className="font-semibold text-zinc-300">
            {imageSize.width} × {imageSize.height} PX
          </span>
        </div>
      )}
    </div>
  );
}
