import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useTask } from "../../context/TaskContext";
import { useMapLayers, TILE_CONFIGS } from "../../context/MapLayersContext";
import { MapResizeController } from "../map/MapResizeController";
import { TacticalIcon } from "../map/TacticalIcon";
import { MapCameraController } from "../map/MapCameraController";
import { MapClickController } from "../map/MapClickController";
import { getPriorityStyle } from "../../utils/priorityColor";

export function MapPanel() {
  const { isAuth } = useAuth();
  const { tasks } = useTask();
  const { activeTile, showThreatZones, showMarkers } = useMapLayers();

  const currentTile = TILE_CONFIGS[activeTile];

  const geoTasks = useMemo(
    () => tasks.filter((t) => t.latitude && t.longitude),
    [tasks],
  );

  return (
    <section className="flex-1 relative z-0 flex items-center justify-center bg-zinc-950 overflow-hidden w-full h-full pb-14 md:pb-0">
      <MapContainer
        className="w-full h-full"
        center={[48.46, 35.04]}
        zoom={13}
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

            return (
              <Marker
                key={task.id}
                position={[task.latitude, task.longitude]}
                icon={TacticalIcon(task.priority)}
              >
                <Popup>
                  <div className="font-mono text-xs text-zinc-900 p-0.5 min-w-35">
                    <div className="font-bold tracking-wider uppercase text-zinc-900 border-b border-zinc-200 pb-1">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-zinc-600 my-1 text-[11px]">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1 border-t border-zinc-200">
                      <span
                        className="font-bold uppercase"
                        style={{ color: style.hex }}
                      >
                        {task.priority}
                      </span>
                      <span className="text-zinc-500 font-semibold uppercase">
                        ● {task.status}
                      </span>
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
