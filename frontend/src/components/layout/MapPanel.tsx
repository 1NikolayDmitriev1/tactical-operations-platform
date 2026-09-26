import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useTask } from "../../context/TaskContext";
import { useMapLayers, TILE_CONFIGS } from "../../context/MapLayersContext";
import { MapResizeController } from "../map/MapResizeController";
import { TacticalIcon } from "../map/TacticalIcon";
import { MapCameraController } from "../map/MapCameraController";
import { MapClickController } from "../map/MapClickController";

export function MapPanel() {
  const { isAuth } = useAuth();
  const { tasks } = useTask();
  const { activeTile, showThreatZones, showMarkers } = useMapLayers();

  const currentTile = TILE_CONFIGS[activeTile];

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

        {/* Dynamic Tile Layer Provider */}
        <TileLayer
          key={activeTile}
          attribution={currentTile.attribution}
          url={currentTile.url}
        />

        {/* Tactical Threat Density Zones (Heat Circles) */}
        {showThreatZones &&
          isAuth &&
          tasks
            .filter((t) => t.latitude && t.longitude)
            .map((task) => {
              const isCrit = task.priority === "critical";
              const isHigh = task.priority === "high";
              const radius = isCrit ? 900 : isHigh ? 600 : 350;
              const color = isCrit ? "#ef4444" : isHigh ? "#f97316" : "#eab308";

              return (
                <Circle
                  key={`threat-${task.id}`}
                  center={[task.latitude, task.longitude]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isCrit ? 0.22 : 0.16,
                    weight: 1.5,
                    dashArray: isCrit ? "4 3" : undefined,
                  }}
                />
              );
            })}

        {/* Operational Task Markers */}
        {showMarkers &&
          isAuth &&
          tasks
            .filter((t) => t.latitude && t.longitude)
            .map((task) => (
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
                        style={{
                          color:
                            task.priority === "critical"
                              ? "#dc2626"
                              : task.priority === "high"
                                ? "#ea580c"
                                : "#ca8a04",
                        }}
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
            ))}
      </MapContainer>
    </section>
  );
}
