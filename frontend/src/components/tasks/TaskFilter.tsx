import type { Task } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import type { TranslationSchema } from "../../locales";

export type PriorityFilter = "all" | Task["priority"];
export type StatusFilter = "all" | Task["status"];

interface TaskFilterProps {
  isListOpen: boolean;
  filterPriority: PriorityFilter;
  setFilterPriority: (priority: PriorityFilter) => void;
  filterStatus: StatusFilter;
  setFilterStatus: (status: StatusFilter) => void;
}

const PRIORITY_FILTERS: {
  id: PriorityFilter;
  labelKey: keyof TranslationSchema["priorities"];
  activeClass: string;
}[] = [
  {
    id: "all",
    labelKey: "all",
    activeClass: "",
  },
  {
    id: "critical",
    labelKey: "critical",
    activeClass: "bg-red-950/80 text-red-300 border-red-700",
  },
  {
    id: "high",
    labelKey: "high",
    activeClass: "bg-orange-950/80 text-orange-300 border-orange-700",
  },
  {
    id: "medium",
    labelKey: "medium",
    activeClass: "bg-yellow-950/80 text-yellow-300 border-yellow-700",
  },
  {
    id: "low",
    labelKey: "low",
    activeClass: "bg-zinc-800 text-zinc-200 border-zinc-600",
  },
];

const STATUS_FILTERS: {
  id: StatusFilter;
  labelKey: keyof TranslationSchema["status"];
  activeClass: string;
}[] = [
  {
    id: "all",
    labelKey: "all",
    activeClass: "",
  },
  {
    id: "pending",
    labelKey: "pending",
    activeClass: "bg-amber-950/80 text-amber-300 border-amber-700",
  },
  {
    id: "in_progress",
    labelKey: "in_progress",
    activeClass: "bg-cyan-950/80 text-cyan-300 border-cyan-700",
  },
  {
    id: "completed",
    labelKey: "completed",
    activeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
  },
];

export function TaskFilter({
  isListOpen,
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
}: TaskFilterProps) {
  const { t } = useLanguage();
  const { theme } = useAccent();

  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isListOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="space-y-1.5 mb-3">
        <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-md">
          {PRIORITY_FILTERS.map((f) => {
            const isActive = filterPriority === f.id;
            const activeClass =
              f.id === "all" ? `${theme.activeTab} border-transparent` : f.activeClass;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterPriority(f.id)}
                className={`py-1 text-[10px] font-mono font-bold tracking-wider rounded transition-all cursor-pointer select-none text-center border ${
                  isActive
                    ? activeClass
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                {t.priorities[f.labelKey]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-md">
          {STATUS_FILTERS.map((f) => {
            const isActive = filterStatus === f.id;
            const activeClass =
              f.id === "all" ? `${theme.activeTab} border-transparent` : f.activeClass;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterStatus(f.id)}
                className={`py-1 text-[9px] font-mono font-bold tracking-wider rounded transition-all cursor-pointer select-none text-center border truncate px-0.5 ${
                  isActive
                    ? activeClass
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
                title={t.status[f.labelKey]}
              >
                {t.status[f.labelKey]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
