import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import { useTask } from "../../context/TaskContext";
import { useModal } from "../../context/ModalContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { INPUT_BASE } from "../../utils/styles";
import { TaskPhotoUpload } from "./TaskPhotoUpload";
import { TaskFormCoords } from "./TaskFormCoords";
import { TaskPriorityRadius } from "./TaskPriorityRadius";

interface TaskFormProps {
  task?: Task | Partial<Task> | null;
  coords?: { lat: number; lng: number } | null;
  onSuccess?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  latitude: number | null;
  longitude: number | null;
  threat_radius: number | null;
  image_url: string | null;
}

const INITIAL_FORM: TaskFormData = {
  title: "", description: "", priority: "medium",
  latitude: null, longitude: null, threat_radius: null, image_url: null,
};

export function TaskForm({ task, coords, onSuccess }: TaskFormProps) {
  const { addTask, updateTask } = useTask();
  const { closeModal, setPendingTarget } = useModal();
  const { t } = useLanguage();
  const { theme } = useAccent();
  const isEdit = Boolean(task && "id" in task && (task as Task).id);
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.setCustomValidity("");
    }
  }, [t]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        latitude: typeof task.latitude === "number" ? task.latitude : (coords?.lat ?? null),
        longitude: typeof task.longitude === "number" ? task.longitude : (coords?.lng ?? null),
        threat_radius: task.threat_radius ?? null,
        image_url: task.image_url ?? null,
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
    field: keyof TaskFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const rawRadius = formData.threat_radius;
    const threat_radius =
      typeof rawRadius === "number" && !isNaN(rawRadius)
        ? Math.min(50000, Math.max(50, Math.round(rawRadius)))
        : null;

    const payload = {
      ...formData,
      latitude: typeof formData.latitude === "number" && !isNaN(formData.latitude) ? formData.latitude : null,
      longitude: typeof formData.longitude === "number" && !isNaN(formData.longitude) ? formData.longitude : null,
      threat_radius,
    };

    if (isEdit && task && "id" in task && typeof task.id === "number") {
      await updateTask(task.id, payload as Partial<Task>);
    } else {
      await addTask({
        ...payload,
        status: "pending",
      } as Omit<Task, "id">);
    }
    onSuccess?.();
  };

  const handlePickOnMap = () => {
    setPendingTarget({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      threat_radius: formData.threat_radius,
      image_url: formData.image_url,
      id: isEdit && task && "id" in task ? (task as Task).id : undefined,
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.modal.fieldTitle}
        </label>
        <input
          ref={titleInputRef}
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onInvalid={(e) => {
            const target = e.currentTarget;
            if (target.validity.valueMissing) {
              target.setCustomValidity(t.validation.requiredTitle);
            } else {
              target.setCustomValidity("");
            }
          }}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          placeholder={t.modal.placeholderTitle}
          className={`${INPUT_BASE} ${theme.focusRing}`}
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
          className={`${INPUT_BASE} ${theme.focusRing}`}
        />
      </div>

      <TaskPriorityRadius
        priority={formData.priority}
        threatRadius={formData.threat_radius}
        onChangePriority={(priority) => handleChange("priority", priority)}
        onChangeThreatRadius={(radius) => handleChange("threat_radius", radius)}
        focusRing={theme.focusRing}
      />

      <TaskFormCoords
        latitude={formData.latitude}
        longitude={formData.longitude}
        onChangeLat={(val) => handleChange("latitude", val)}
        onChangeLng={(val) => handleChange("longitude", val)}
        onPickOnMap={handlePickOnMap}
        focusRing={theme.focusRing}
        gridTargetLabel={t.modal.gridTarget}
        pickOnMapLabel={t.modal.pickOnMap}
        latLabel={t.modal.fieldLat}
        lngLabel={t.modal.fieldLng}
      />

      <TaskPhotoUpload
        value={formData.image_url}
        onChange={(url) => handleChange("image_url", url)}
        fieldLabel={t.modal.fieldPhoto}
        uploadLabel={t.modal.uploadPhoto}
        removeLabel={t.modal.removePhoto}
      />

      <button
        type="submit"
        className={`w-full mt-2 py-2.5 ${theme.primaryBtn} text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer active:scale-95`}
      >
        {isEdit ? t.modal.saveChanges : t.modal.deploy}
      </button>
    </form>
  );
}
