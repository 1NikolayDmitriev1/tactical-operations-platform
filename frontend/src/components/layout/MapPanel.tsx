import { useMemo, useRef } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import L from "leaflet";
import { Target, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useTask } from "../../context/TaskContext";
import type { Task } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { useModal } from "../../context/ModalContext";
import { useMapLayers, TILE_CONFIGS } from "../../context/MapLayersContext";
import { MapResizeController } from "../map/MapResizeController";
import { MapCameraController } from "../map/MapCameraController";
import { MapClickController } from "../map/MapClickController";
import { TacticalMarkerItem } from "../map/TacticalMarkerItem";
import { getPriorityStyle } from "../../utils/priorityColor";

export function MapPanel() {
  const { isAuth } = useAuth();
  const { tasks, selectedTask, setSelectedTask } = useTask();
  const { t } = useLanguage();
  const { pendingTarget, setPendingTarget } = useModal();
  const { activeTile, showThreatZones, showMarkers, showLabels } = useMapLayers();
  const markerRefs = useRef<Record<number, L.Marker>>({});

  const currentTile = TILE_CONFIGS[activeTile];

  const geoTasks = useMemo(
    () =>
      tasks.filter(
        (t): t is Task & { latitude: number; longitude: number } =>
          typeof t.latitude === "number" && typeof t.longitude === "number",
      ),
    [tasks],
  );

  const sortedThreatTasks = useMemo(() => {
    return [...geoTasks].sort((a, b) => {
      const radA =
        a.threat_radius && a.threat_radius > 0
          ? a.threat_radius
          : getPriorityStyle(a.priority).radius;
      const radB =
        b.threat_radius && b.threat_radius > 0
          ? b.threat_radius
          : getPriorityStyle(b.priority).radius;
      return radB - radA;
    });
  }, [geoTasks]);

  const handleSelectTaskWithPopup = (
    target: Task & { latitude: number; longitude: number },
  ) => {
    setSelectedTask(target);
    const marker = markerRefs.current[target.id];
    if (marker) {
      marker.openPopup();
    }
  };

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
          sortedThreatTasks.map((task) => {
            const style = getPriorityStyle(task.priority);
            const isCrit = task.priority === "critical";
            const isSelected = selectedTask?.id === task.id;
            const radius =
              task.threat_radius && task.threat_radius > 0
                ? task.threat_radius
                : style.radius;

            return (
              <Circle
                key={`threat-${task.id}`}
                center={[task.latitude, task.longitude]}
                radius={radius}
                pathOptions={{
                  color: isSelected ? "#ffffff" : style.hex,
                  fillColor: style.hex,
                  fillOpacity: isSelected
                    ? Math.min(0.4, style.fillOpacity * 1.8)
                    : style.fillOpacity,
                  weight: isSelected ? 2.5 : 1.5,
                  dashArray: isCrit ? "4 3" : undefined,
                  className: "cursor-pointer",
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    const clickLat = e.latlng.lat;
                    const clickLng = e.latlng.lng;

                    const covering = geoTasks.filter((t) => {
                      const r =
                        t.threat_radius && t.threat_radius > 0
                          ? t.threat_radius
                          : getPriorityStyle(t.priority).radius;
                      const dLat = (t.latitude - clickLat) * 111320;
                      const dLng =
                        (t.longitude - clickLng) *
                        (111320 * Math.cos((clickLat * Math.PI) / 180));
                      return Math.hypot(dLat, dLng) <= r;
                    });

                    covering.sort((a, b) => {
                      const distA = Math.hypot(
                        (a.latitude - clickLat) * 111320,
                        (a.longitude - clickLng) *
                          (111320 * Math.cos((clickLat * Math.PI) / 180)),
                      );
                      const distB = Math.hypot(
                        (b.latitude - clickLat) * 111320,
                        (b.longitude - clickLng) *
                          (111320 * Math.cos((clickLat * Math.PI) / 180)),
                      );
                      return distA - distB;
                    });

                    const best = covering[0] || task;
                    handleSelectTaskWithPopup(best);
                  },
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
              <TacticalMarkerItem
                key={task.id}
                task={task}
                style={style}
                statusLabel={statusLabel}
                showLabels={showLabels}
                allTasks={geoTasks}
                onRegisterMarker={(id, marker) => {
                  markerRefs.current[id] = marker;
                }}
                onUnregisterMarker={(id) => {
                  delete markerRefs.current[id];
                }}
                onSelectTask={handleSelectTaskWithPopup}
              />
            );
          })}
      </MapContainer>
    </section>
  );
}
