export type AccentColor = "amber" | "emerald" | "neutral" | "sky";

export interface AccentTheme {
  id: AccentColor;
  label: string;
  dotColor: string;
  primaryBtn: string;
  outlineBtn: string;
  activeTab: string;
  selectedBorder: string;
  textAccent: string;
  hoverText: string;
  focusRing: string;
  badge: string;
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
  amber: {
    id: "amber",
    label: "Amber",
    dotColor: "bg-amber-500",
    primaryBtn: "bg-amber-600 hover:bg-amber-500 text-white",
    outlineBtn: "border-amber-600/70 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-white",
    activeTab: "bg-amber-600 text-white",
    selectedBorder: "border-amber-500 ring-1 ring-amber-500",
    textAccent: "text-amber-400",
    hoverText: "hover:text-amber-400",
    focusRing: "focus:border-amber-500 focus:ring-1 focus:ring-amber-500",
    badge: "text-amber-400 bg-amber-950/60 border-amber-800/60",
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    dotColor: "bg-emerald-500",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-500 text-white",
    outlineBtn: "border-emerald-600/70 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white",
    activeTab: "bg-emerald-600 text-white",
    selectedBorder: "border-emerald-500 ring-1 ring-emerald-500",
    textAccent: "text-emerald-400",
    hoverText: "hover:text-emerald-400",
    focusRing: "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
    badge: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
  },
  neutral: {
    id: "neutral",
    label: "Neutral",
    dotColor: "bg-zinc-300",
    primaryBtn: "bg-zinc-200 hover:bg-white text-zinc-950 font-bold",
    outlineBtn: "border-zinc-500/70 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-200 hover:text-white",
    activeTab: "bg-zinc-200 text-zinc-950 font-bold",
    selectedBorder: "border-zinc-400 ring-1 ring-zinc-400",
    textAccent: "text-zinc-300",
    hoverText: "hover:text-zinc-200",
    focusRing: "focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400",
    badge: "text-zinc-300 bg-zinc-800/80 border-zinc-700/80",
  },
  sky: {
    id: "sky",
    label: "Sky",
    dotColor: "bg-sky-500",
    primaryBtn: "bg-sky-600 hover:bg-sky-500 text-white",
    outlineBtn: "border-sky-500/70 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 hover:text-white",
    activeTab: "bg-sky-600 text-white",
    selectedBorder: "border-sky-500 ring-1 ring-sky-500",
    textAccent: "text-sky-400",
    hoverText: "hover:text-sky-400",
    focusRing: "focus:border-sky-500 focus:ring-1 focus:ring-sky-500",
    badge: "text-sky-400 bg-sky-950/60 border-sky-800/60",
  },
};
