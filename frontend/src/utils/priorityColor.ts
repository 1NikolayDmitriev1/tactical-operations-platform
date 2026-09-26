import type { Task } from "../types";

export interface PriorityStyle {
  hex: string;
  textClass: string;
  badgeClass: string;
  fillOpacity: number;
  radius: number;
}

export const PRIORITY_MAP: Record<Task["priority"], PriorityStyle> = {
  critical: {
    hex: "#ef4444",
    textClass: "text-red-400",
    badgeClass: "bg-red-950/60 text-red-400 border-red-800/80",
    fillOpacity: 0.22,
    radius: 900,
  },
  high: {
    hex: "#f97316",
    textClass: "text-orange-400",
    badgeClass: "bg-orange-950/60 text-orange-400 border-orange-800/80",
    fillOpacity: 0.18,
    radius: 600,
  },
  medium: {
    hex: "#eab308",
    textClass: "text-yellow-400",
    badgeClass: "bg-yellow-950/60 text-yellow-400 border-yellow-800/80",
    fillOpacity: 0.16,
    radius: 400,
  },
  low: {
    hex: "#71717a",
    textClass: "text-zinc-400",
    badgeClass: "bg-zinc-800/80 text-zinc-300 border-zinc-700/80",
    fillOpacity: 0.12,
    radius: 250,
  },
};

export function getPriorityStyle(priority: Task["priority"]): PriorityStyle {
  return PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
}
