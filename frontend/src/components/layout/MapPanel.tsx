import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from "react-leaflet";
import { Target, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useTask } from "../../context/TaskContext";
import type { Task } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { useModal } from "../../context/ModalContext";
import { useMapLayers, TILE_CONFIGS } from "../../context/MapLayersContext";
import { MapResizeController } from "../map/MapResizeController";
import { TacticalIcon } from "../map/TacticalIcon";
import { MapCameraController } from "../map/MapCameraController";
import { MapClickController } from "../map/MapClickController";
import { getPriorityStyle } from "../../utils/priorityColor";

function getStatusBadge(status: string, label: string) {
  let color = "bg-amber-950/80 text-amber-300 border-amber-700/60";
  if (status === "in_progress") {
    color = "bg-cyan-950/80 text-cyan-300 border-cyan-700/60";
  } else if (status === "completed") {
    color = "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
  } else if (status === "cancelled") {
    color = "bg-zinc-800 text-zinc-400 border-zinc-600";
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${color}`}>
      ● {label}
    </span>
  );
}

export function MapPanel() {
  const { isAuth } = useAuth();
  const { tasks } = useTask();
  const { t } = useLanguage();
  const { pendingTarget, setPendingTarget } = useModal();
  const { activeTile, showThreatZones, showMarkers, showLabels } = useMapLayers();

  const currentTile = TILE_CONFIGS[activeTile];

  const geoTasks = useMemo(
    () =>
      tasks.filter(
        (t): t is Task & { latitude: number; longitude: number } =>
          typeof t.latitude === "number" && typeof t.longitude === "number",
      ),
    [tasks],
  );

  return (
    <section className="flex-1 relative z-0 flex items-center justify-center bg-zinc-950 overflow-hidden w-full h-full pb-14 md:pb-0">
      {pendingTarget && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-950/95 border-2 border-amber-500 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto max-w-[90vw]">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <div className="flex flex-col min-w-0">
            <div className="text-[11px] font-mono font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
              <Target size={13} className="text-amber-400" />
              <span>{t.modal.pickLocationMode}</span>
            </div>
            <span className="text-xs font-mono text-zinc-200 truncate">
              {t.modal.clickMapToPlace}{" "}
              <strong className="text-amber-300 font-bold">{pendingTarget.title}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPendingTarget(null)}
            className="ml-2 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer border border-zinc-700 shrink-0 flex items-center gap-1"
          >
            <X size={12} />
            <span>{t.modal.cancelPick}</span>
          </button>
        </div>
      )}

      <MapContainer
        className={`w-full h-full ${pendingTarget ? "cursor-crosshair" : ""}`}
        center={[48.5, 31.5]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ minHeight: "100%", width: "100%" }}
      >
        <MapClickController />
        <MapResizeController />
        <MapCameraController />

        <TileLayer
          key={activeTile}
          attribution={currentTile.attribution}
          url={currentTile.url}
        />

        {showThreatZones &&
          isAuth &&
          geoTasks.map((task) => {
            const style = getPriorityStyle(task.priority);
            const isCrit = task.priority === "critical";

            return (
              <Circle
                key={`threat-${task.id}`}
                center={[task.latitude, task.longitude]}
                // TODO: custom radius
                radius={style.radius}
                pathOptions={{
                  color: style.hex,
                  fillColor: style.hex,
                  fillOpacity: style.fillOpacity,
                  weight: 1.5,
                  dashArray: isCrit ? "4 3" : undefined,
                }}
              />
            );
          })}

        {showMarkers &&
          isAuth &&
          geoTasks.map((task) => {
            const style = getPriorityStyle(task.priority);

            const statusKey = task.status as keyof typeof t.status;
            const statusLabel = t.status[statusKey] || task.status;

            return (
              <Marker
                key={task.id}
                position={[task.latitude, task.longitude]}
                icon={TacticalIcon(task.priority)}
              >
                {showLabels && (
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -18]}
                    className="tactical-marker-tooltip"
                  >
                    {task.title}
                  </Tooltip>
                )}

                <Popup>
                  <div className="font-mono text-xs text-zinc-100 p-0.5 min-w-56">
                    <div className="font-bold tracking-wider uppercase text-zinc-100 border-b border-zinc-800 pb-1.5 pr-7 flex items-center justify-between gap-2">
                      <span className="truncate">{task.title}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0"
                        style={{
                          color: style.hex,
                          backgroundColor: `${style.hex}18`,
                          border: `1px solid ${style.hex}40`,
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <div className="text-zinc-400 my-2 text-[11px] leading-relaxed">
                        {task.description}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] mt-2 pt-1.5 border-t border-zinc-800">
                      <span className="text-zinc-500 font-mono">
                        {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                      </span>
                      {getStatusBadge(task.status, statusLabel)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </section>
  );
}
