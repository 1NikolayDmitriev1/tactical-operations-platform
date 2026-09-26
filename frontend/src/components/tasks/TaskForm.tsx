import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Task } from "../../types";
import { useTask } from "../../context/TaskContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";

interface TaskFormProps {
  task?: Task | null;
  coords?: { lat: number; lng: number } | null;
  onSuccess?: () => void;
}

const INITIAL_FORM: Omit<Task, "id" | "status"> = {
  title: "",
  description: "",
  priority: "medium",
  latitude: 0,
  longitude: 0,
};
export function TaskForm({ task, coords, onSuccess }: TaskFormProps) {
  const { addTask, updateTask } = useTask();
  const { t } = useLanguage();
  const { theme } = useAccent();
  const isEdit = Boolean(task);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        latitude: task.latitude,
        longitude: task.longitude,
      });
    } else if (coords) {
      setFormData({
        ...INITIAL_FORM,
        latitude: coords.lat,
        longitude: coords.lng,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [task, coords]);

  const handleChange = (
    field: keyof typeof INITIAL_FORM,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEdit && task) {
      await updateTask(task.id, formData);
    } else {
      await addTask({
        ...formData,
        status: "pending",
      });
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.modal.fieldTitle}
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder={t.modal.placeholderTitle}
          className={`w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none ${theme.focusRing} transition-all`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.modal.fieldDesc}
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t.modal.placeholderDesc}
          className={`w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none ${theme.focusRing} transition-all`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.modal.fieldPriority}
        </label>
        <select
          value={formData.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          className={`w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none ${theme.focusRing} cursor-pointer`}
        >
          <option value="low">{t.priorities.low}</option>
          <option value="medium">{t.priorities.medium}</option>
          <option value="high">{t.priorities.high}</option>
          <option value="critical">{t.priorities.critical}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            {t.modal.fieldLat}
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.latitude}
            onChange={(e) => handleChange("latitude", Number(e.target.value))}
            className={`w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-100 focus:outline-none ${theme.focusRing} transition-all`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            {t.modal.fieldLng}
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.longitude}
            onChange={(e) => handleChange("longitude", Number(e.target.value))}
            className={`w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-100 focus:outline-none ${theme.focusRing} transition-all`}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`w-full mt-2 py-2.5 ${theme.primaryBtn} text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer active:scale-95`}
      >
        {isEdit ? t.modal.saveChanges : t.modal.deploy}
      </button>
    </form>
  );
}
