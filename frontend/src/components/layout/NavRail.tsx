import { Map, Crosshair, Layers, FileText } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";
import { useModal } from "../../context/ModalContext";
import { useMapLayers } from "../../context/MapLayersContext";
import { MapLayersWidget } from "../map/MapLayersWidget";

export function NavRail() {
  const { theme } = useAccent();
  const { t } = useLanguage();
  const { activeModal, openModal, closeModal } = useModal();
  const { isLayersOpen, toggleLayers } = useMapLayers();

  const toggleModal = (modal: "DRONE_RECON" | "SITREP") => {
    if (activeModal === modal) closeModal();
    else openModal(modal);
  };

  const navItems = [
    {
      id: "map",
      icon: Map,
      label: t.nav.map,
      code: "01",
      active: !isLayersOpen && !activeModal,
      onClick: () => {
        if (activeModal) closeModal();
        if (isLayersOpen) toggleLayers();
      },
    },
    {
      id: "layers",
      icon: Layers,
      label: t.nav.layers,
      code: "03",
      active: isLayersOpen,
      onClick: toggleLayers,
    },
    {
      id: "recon",
      icon: Crosshair,
      label: t.nav.recon,
      code: "02",
      badge: "AI",
      active: activeModal === "DRONE_RECON",
      onClick: () => toggleModal("DRONE_RECON"),
    },
    {
      id: "sitrep",
      icon: FileText,
      label: t.nav.sitrep,
      code: "04",
      badge: "AI",
      active: activeModal === "SITREP",
      onClick: () => toggleModal("SITREP"),
    },
  ];

  return (
    <aside className="fixed bottom-0 inset-x-0 h-14 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-row items-center justify-around z-30 md:relative md:z-30 md:w-14 md:h-full md:border-t-0 md:border-r md:bg-zinc-900/60 md:flex-col md:py-4 md:gap-4 md:justify-start shrink-0 select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              className={`p-2.5 rounded-lg transition-all cursor-pointer relative ${
                item.active
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : `text-zinc-400 ${theme.hoverText} hover:bg-zinc-800/60`
              }`}
            >
              {item.active && (
                <span
                  className={`absolute -top-2 left-2 right-2 h-0.5 rounded-b md:-left-2 md:top-1.5 md:bottom-1.5 md:w-1 md:h-auto md:rounded-r ${theme.dotColor}`}
                />
              )}
              <Icon size={20} />
              {item.badge && (
                <span
                  className={`absolute -top-1 -right-1 text-[8px] font-mono font-bold px-1 rounded-full ${theme.dotColor} text-zinc-950`}
                >
                  {item.badge}
                </span>
              )}
            </button>

            {item.id === "layers" && isLayersOpen && (
              <div className="fixed bottom-16 left-4 right-4 md:absolute md:left-full md:ml-3 md:top-0 md:bottom-auto md:w-76 z-1002">
                <MapLayersWidget />
              </div>
            )}

            {(!isLayersOpen || item.id !== "layers") && (
              <div className="hidden md:flex absolute left-14 ml-2 z-1002 px-2.5 py-1.5 rounded bg-zinc-950/95 border border-zinc-700/80 text-zinc-200 text-[11px] font-mono shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all items-center gap-1.5 backdrop-blur-sm">
                <span className="text-zinc-500 font-bold">[{item.code}]</span>
                <span className="font-semibold tracking-wider uppercase">{item.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
