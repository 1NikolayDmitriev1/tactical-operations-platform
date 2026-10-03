import { useMemo, useState } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type L from "leaflet";
import { AlertTriangle, Camera, ChevronDown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { Task } from "../../types";
import { TacticalIcon } from "./TacticalIcon";
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
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${color}`}>
      ● {label}
    </span>
  );
}

export interface TacticalMarkerItemProps {
  task: Task & { latitude: number; longitude: number };
  style: ReturnType<typeof getPriorityStyle>;
  statusLabel: string;
  showLabels: boolean;
  allTasks: (Task & { latitude: number; longitude: number })[];
  onRegisterMarker: (id: number, marker: L.Marker) => void;
  onUnregisterMarker: (id: number) => void;
  onSelectTask: (task: Task & { latitude: number; longitude: number }) => void;
}

export function TacticalMarkerItem({
  task,
  style,
  statusLabel,
  showLabels,
  allTasks,
  onRegisterMarker,
  onUnregisterMarker,
  onSelectTask,
}: TacticalMarkerItemProps) {
  const [showPhoto, setShowPhoto] = useState(false);
  const { t } = useLanguage();

  const intersectingTasks = useMemo(() => {
    const thisRad =
      task.threat_radius && task.threat_radius > 0
        ? task.threat_radius
        : style.radius;

    return allTasks.filter((other) => {
      if (other.id === task.id) return false;
      const otherRad =
        other.threat_radius && other.threat_radius > 0
          ? other.threat_radius
          : getPriorityStyle(other.priority).radius;
      const dLat = (other.latitude - task.latitude) * 111320;
      const dLng =
        (other.longitude - task.longitude) *
        (111320 * Math.cos((task.latitude * Math.PI) / 180));
      return Math.hypot(dLat, dLng) < thisRad + otherRad;
    });
  }, [task, allTasks, style.radius]);

  return (
    <Marker
      position={[task.latitude, task.longitude]}
      icon={TacticalIcon(task.priority)}
      ref={(marker) => {
        if (marker) onRegisterMarker(task.id, marker);
        else onUnregisterMarker(task.id);
      }}
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
        <div className="font-mono text-zinc-100 p-1 min-w-64 max-w-80">
          <div className="font-bold text-sm tracking-wider uppercase text-zinc-100 border-b border-zinc-800 pb-2 pr-7 flex items-center justify-between gap-2">
            <span className="truncate">{task.title}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0"
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
            <div className="text-zinc-200 my-2.5 text-xs leading-relaxed">
              {task.description}
            </div>
          )}

          {task.image_url && (
            <div className="my-2.5">
              <button
                type="button"
                onClick={() => setShowPhoto((prev) => !prev)}
                className="flex items-center justify-between w-full px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-200 font-mono transition-colors border border-zinc-700 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Camera size={13} className="text-amber-400" />
                  <span>{t.tasks.reconPhoto}</span>
                </span>
                <ChevronDown
                  size={13}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    showPhoto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showPhoto && (
                <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950">
                  <img
                    src={task.image_url}
                    alt={task.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {intersectingTasks.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
              <div className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                <span>
                  {t.tasks.overlappingZones} ({intersectingTasks.length}):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {intersectingTasks.map((other) => (
                  <button
                    key={other.id}
                    type="button"
                    onClick={() => onSelectTask(other)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer truncate max-w-52"
                  >
                    {other.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-zinc-800 gap-2 flex-wrap">
            <span className="text-zinc-400 font-mono">
              {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
              {task.threat_radius && ` (R: ${task.threat_radius}m)`}
            </span>
            {getStatusBadge(task.status, statusLabel)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
