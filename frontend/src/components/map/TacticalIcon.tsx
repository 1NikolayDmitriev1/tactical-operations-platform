import type { Task } from "../../types";
import L from "leaflet";
export const TacticalIcon = (priority: Task["priority"]) => {
  const colors: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#10b981",
  };
  const color = colors[priority] || "#38bdf8";

  return L.divIcon({
    className: "tactical-marker",
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: ${color};
          opacity: 0.5;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></span>
        <span style="
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background-color: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 8px ${color};
        "></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};
