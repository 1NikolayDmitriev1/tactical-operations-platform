import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTask } from "../../context/TaskContext";
import { useModal } from "../../context/ModalContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { TaskFilter } from "./TaskFilter";

type PriorityFilter = "all" | Task["priority"];

export function TaskList() {
  const { isAuth } = useAuth();
  const { tasks, selectedTask, setSelectedTask, isLoading, error } = useTask();
  const { openModal } = useModal();
  const { t } = useLanguage();
  const { theme } = useAccent();
  const [isListOpen, setIsListOpen] = useState(true);
  const [filterPriority, setFilterPriority] = useState<PriorityFilter>("all");

  const filteredTasks =
    filterPriority === "all"
      ? tasks
      : tasks.filter((t) => t.priority === filterPriority);

  if (isLoading && tasks.length === 0)
    return (
      <div className="text-xs font-mono text-zinc-500 animate-pulse py-8 text-center">
        {t.tasks.loading}
      </div>
    );
  if (error && tasks.length === 0)
    return (
      <div className="p-3 rounded bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono">
        Error: {error}
      </div>
    );

  return (
    <section className="flex flex-col">
      <button
        disabled={!isAuth}
        onClick={() => openModal("CREATE_TASK")}
        className={`w-full mb-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
          isAuth
            ? `${theme.primaryBtn} cursor-pointer`
            : "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800"
        }`}
      >
        {isAuth ? t.tasks.newTask : t.tasks.loginToCreate}
      </button>

      <div
        onClick={() => setIsListOpen((prev) => !prev)}
        className="flex items-center justify-between px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 transition-colors select-none mb-2"
      >
        <div className="flex items-center gap-2">
          <Layers className={`w-3.5 h-3.5 ${theme.textAccent}`} />
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-300 uppercase">
            {t.tasks.title}
          </span>
          <span
            className={`px-1.5 py-0.2 text-[10px] font-mono rounded ${theme.badge}`}
          >
            {filterPriority === "all"
              ? tasks.length
              : `${filteredTasks.length}/${tasks.length}`}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            isListOpen ? `rotate-180 ${theme.textAccent}` : ""
          }`}
        />
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isListOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <TaskFilter
            isListOpen={isListOpen}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />

          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500 font-mono text-xs">
              {t.tasks.noObjectives}
            </div>
          ) : (
            <ul className="space-y-3 list-none p-0 m-0 pb-1">
              {filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  isSelected={selectedTask?.id === t.id}
                  onClick={() => setSelectedTask(t)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
