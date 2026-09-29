import { useState } from "react";
import { Map, Crosshair, Layers, FileText } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";
import { useModal } from "../../context/ModalContext";
import { useMapLayers } from "../../context/MapLayersContext";
import { MapLayersWidget } from "../map/MapLayersWidget";

export function NavRail() {
  const { theme } = useAccent();
  const { t } = useLanguage();
  const { openModal } = useModal();
  const { isLayersOpen, toggleLayers } = useMapLayers();
  const [activeTab, setActiveTab] = useState<"map" | "recon" | "layers" | "sitrep">("map");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const navItems = [
    {
      id: "map" as const,
      icon: Map,
      label: t.nav.map,
      code: "01",
    },
    {
      id: "recon" as const,
      icon: Crosshair,
      label: t.nav.recon,
      code: "02",
      badge: "AI",
    },
    {
      id: "layers" as const,
      icon: Layers,
      label: t.nav.layers,
      code: "03",
    },
    {
      id: "sitrep" as const,
      icon: FileText,
      label: t.nav.sitrep,
      code: "04",
    },
  ];

  const handleNavClick = (id: "map" | "recon" | "layers" | "sitrep") => {
    setActiveTab(id);
    if (id === "recon") {
      openModal("DRONE_RECON");
    } else if (id === "layers") {
      toggleLayers();
    } else if (id === "sitrep") {
      showToast("📄 Operational Sitrep: Summary ready for export");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  return (
    <>
      <aside className="fixed bottom-0 inset-x-0 h-14 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-row items-center justify-around z-30 md:relative md:z-30 md:w-14 md:h-full md:border-t-0 md:border-r md:bg-zinc-900/60 md:flex-col md:py-4 md:gap-4 md:justify-start shrink-0 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "layers" ? isLayersOpen : activeTab === item.id;

          return (
            <div key={item.id} className="relative group flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`p-2.5 rounded-lg transition-all cursor-pointer relative ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : `text-zinc-400 ${theme.hoverText} hover:bg-zinc-800/60`
                }`}
                aria-label={item.label}
              >
                {isActive && (
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
                <div className="fixed bottom-16 left-4 right-4 md:absolute md:left-full md:ml-3 md:top-0 md:bottom-auto md:w-76 z-[1002]">
                  <MapLayersWidget />
                </div>
              )}

              {(!isLayersOpen || item.id !== "layers") && (
                <div className="hidden md:flex absolute left-14 ml-2 z-1002 px-2.5 py-1.5 rounded bg-zinc-950/95 border border-zinc-700/80 text-zinc-200 text-[11px] font-mono shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all items-center gap-1.5 backdrop-blur-sm">
                  <span className="text-zinc-500 font-bold">[{item.code}]</span>
                  <span className="font-semibold tracking-wider uppercase">
                    {item.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {toastMsg && (
        <div className="fixed bottom-16 left-4 right-4 md:bottom-6 md:left-18 md:right-auto z-1002 px-3.5 py-2 rounded-lg bg-zinc-900/95 border border-zinc-700 text-zinc-200 text-xs font-mono shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-pulse`} />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}
    </>
  );
}
