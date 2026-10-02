import { MapPin, CheckCircle2, AlertTriangle, Plus, ExternalLink } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";

interface ReconSectorCoordinatesProps {
  latInput: string;
  lngInput: string;
  hasExifCoords: boolean;
  hasValidCoords: boolean;
  onChangeLat: (value: string) => void;
  onChangeLng: (value: string) => void;
  onDeployDirect: () => void;
  onOpenInFullModal: () => void;
}

export function ReconSectorCoordinates({
  latInput,
  lngInput,
  hasExifCoords,
  hasValidCoords,
  onChangeLat,
  onChangeLng,
  onDeployDirect,
  onOpenInFullModal,
}: ReconSectorCoordinatesProps) {
  const { theme } = useAccent();
  const { t } = useLanguage();

  return (
    <div className="space-y-3 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg">
      <div className="flex items-center gap-2">
        <MapPin size={16} className={theme.textAccent} />
        <span className="text-xs md:text-sm font-mono font-bold tracking-wider uppercase text-zinc-200">
          {t.recon.targetCoordinates}
        </span>
      </div>

      {hasExifCoords ? (
        <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs font-mono">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
          <span>{t.recon.exifFound}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-2.5 rounded bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs font-mono">
          <AlertTriangle size={15} className="shrink-0 text-amber-400 mt-0.5" />
          <span>{t.recon.coordsHint}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-mono text-zinc-400 block mb-1 font-semibold">
            {t.recon.latitude}
          </label>
          <input
            type="text"
            placeholder="48.4602"
            value={latInput}
            onChange={(e) => onChangeLat(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs md:text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-zinc-400 block mb-1 font-semibold">
            {t.recon.longitude}
          </label>
          <input
            type="text"
            placeholder="35.0405"
            value={lngInput}
            onChange={(e) => onChangeLng(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs md:text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onDeployDirect}
          className="w-full py-2.5 px-3 rounded-lg font-mono text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>
            {hasValidCoords
              ? t.recon.deployVisionTarget
              : t.recon.createTaskNoCoords}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenInFullModal}
          className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-700/60"
        >
          <ExternalLink size={14} />
          <span>{t.recon.editInFullModal}</span>
        </button>

        {!hasValidCoords && (
          <p className="text-[11px] font-mono text-zinc-400 text-center leading-tight pt-0.5">
            {t.recon.coordsRequiredHint}
          </p>
        )}
      </div>
    </div>
  );
}
