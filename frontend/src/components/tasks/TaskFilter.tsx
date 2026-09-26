import type { Task } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import type { TranslationSchema } from "../../locales";

export type PriorityFilter = "all" | Task["priority"];

interface TaskFilterProps {
  isListOpen: boolean;
  filterPriority: PriorityFilter;
  setFilterPriority: (priority: PriorityFilter) => void;
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

export function TaskFilter({
  isListOpen,
  filterPriority,
  setFilterPriority,
}: TaskFilterProps) {
  const { t } = useLanguage();
  const { theme } = useAccent();

  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isListOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-md mb-3">
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
    </div>
  );
}
