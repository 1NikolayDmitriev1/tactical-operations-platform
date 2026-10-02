import { Layers, X, Eye, EyeOff, Radio, Tag } from "lucide-react";
import { useMapLayers, type TileProviderType } from "../../context/MapLayersContext";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";

export function MapLayersWidget() {
  const {
    activeTile,
    setActiveTile,
    showThreatZones,
    setShowThreatZones,
    showMarkers,
    setShowMarkers,
    showLabels,
    setShowLabels,
    isLayersOpen,
    toggleLayers,
  } = useMapLayers();
  const { theme } = useAccent();
  const { t } = useLanguage();

  if (!isLayersOpen) {
    return null;
  }

  const tileOptions: { id: TileProviderType; label: string; icon: string }[] = [
    { id: "dark", label: t.layersModal.dark, icon: "🌑" },
    { id: "satellite", label: t.layersModal.satellite, icon: "🛰️" },
    { id: "topo", label: t.layersModal.topo, icon: "🗺️" },
  ];

  return (
    <div className="w-full bg-zinc-950/95 border border-zinc-700/80 rounded-xl shadow-2xl p-4 backdrop-blur-md text-zinc-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers size={16} className={theme.textAccent} />
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
              {t.layersModal.title}
            </div>
            <div className="text-[9px] font-mono text-zinc-500">
              {t.layersModal.subtitle}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleLayers}
          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
          {t.layersModal.baseProvider}
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {tileOptions.map((opt) => {
            const isSelected = activeTile === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveTile(opt.id)}
                className={`w-full px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between transition-all cursor-pointer border ${
                  isSelected
                    ? `bg-zinc-900 border-zinc-500 text-zinc-100 shadow-sm ${theme.textAccent}`
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span className="font-semibold">{opt.label}</span>
                </div>
                {isSelected && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${theme.dotColor} text-zinc-950`}>
                    {t.layersModal.active}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-zinc-800">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
          {t.layersModal.overlays}
        </span>
        
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowThreatZones((prev) => !prev)}
            className={`w-full px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between transition-all cursor-pointer border ${
              showThreatZones
                ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                : "bg-zinc-900/30 border-zinc-800/60 text-zinc-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio size={14} className={showThreatZones ? "text-amber-400" : "text-zinc-600"} />
              <span className="text-[11px]">{t.layersModal.threatZones}</span>
            </div>
            {showThreatZones ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setShowMarkers((prev) => !prev)}
            className={`w-full px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between transition-all cursor-pointer border ${
              showMarkers
                ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                : "bg-zinc-900/30 border-zinc-800/60 text-zinc-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${showMarkers ? theme.dotColor : "bg-zinc-600"}`} />
              <span className="text-[11px]">{t.layersModal.taskMarkers}</span>
            </div>
            {showMarkers ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`w-full px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between transition-all cursor-pointer border ${
              showLabels
                ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                : "bg-zinc-900/30 border-zinc-800/60 text-zinc-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag size={13} className={showLabels ? theme.textAccent : "text-zinc-600"} />
              <span className="text-[11px]">{t.layersModal.taskTitles}</span>
            </div>
            {showLabels ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
