import { Trash2, Pencil } from "lucide-react";
import type { Task, TaskCardProps } from "../../types";
import { useTask } from "../../context/TaskContext";
import { useModal } from "../../context/ModalContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";

export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const { deleteTask, updateTask } = useTask();
  const { openModal } = useModal();
  const { t } = useLanguage();
  const { theme } = useAccent();

  const priorityStyles: Record<Task["priority"], string> = {
    critical: "bg-red-950/80 text-red-400 border-red-800",
    high: "bg-orange-950/80 text-orange-400 border-orange-800",
    medium: "bg-yellow-950/80 text-yellow-400 border-yellow-800",
    low: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  const statusStyles: Record<
    Task["status"],
    { bg: string; dot: string; label: string }
  > = {
    pending: {
      bg: "bg-amber-950/40 border-amber-800/70 text-amber-300 hover:bg-amber-900/60 hover:border-amber-600",
      dot: "bg-amber-400",
      label: "PENDING",
    },
    in_progress: {
      bg: theme.outlineBtn,
      dot: `${theme.dotColor} animate-pulse`,
      label: "IN PROGRESS",
    },
    completed: {
      bg: "bg-emerald-950/40 border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-600",
      dot: "bg-emerald-400",
      label: "COMPLETED",
    },
    cancelled: {
      bg: "bg-rose-950/40 border-rose-800/70 text-rose-300 hover:bg-rose-900/60 hover:border-rose-600",
      dot: "bg-rose-400",
      label: "CANCELLED",
    },
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    let next: Task["status"] = "pending";
    if (task.status === "pending") next = "in_progress";
    else if (task.status === "in_progress") next = "completed";
    updateTask(task.id, { status: next });
  };

  return (
    <article
      onClick={onClick}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer bg-zinc-900/80 hover:border-zinc-700 group ${
        isSelected
          ? `${theme.selectedBorder} bg-zinc-800`
          : "border-zinc-800"
      }`}
    >
      <header className="flex items-center justify-between gap-2 mb-2">
        <h3 className={`text-sm font-semibold text-zinc-200 ${theme.hoverText} transition-colors`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${priorityStyles[task.priority]}`}
          >
            {t.priorities[task.priority]}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openModal("EDIT_TASK", { task });
            }}
            className={`p-1 text-zinc-500 ${theme.hoverText} hover:bg-zinc-800 rounded transition-colors cursor-pointer`}
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {task.description && (
        <p className="text-xs text-zinc-400 mb-3">{task.description}</p>
      )}

      {/* TODO: photo preview */}

      <footer className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            {t.tasks.grid}:
          </span>
          {task.latitude != null && task.longitude != null ? (
            <span className="tracking-tight text-zinc-200 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800/80">
              {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
            </span>
          ) : (
            <span className="tracking-tight text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/50 text-[10px] font-bold">
              {t.recon.noCoordinatesBadge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleStatusToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer select-none active:scale-95 ${
            statusStyles[task.status]?.bg ||
            "bg-zinc-800 text-zinc-300 border-zinc-700"
          }`}
          title="Change status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              statusStyles[task.status]?.dot || "bg-zinc-400"
            }`}
          />
          <span>{t.status[task.status]}</span>
        </button>
      </footer>
    </article>
  );
}
