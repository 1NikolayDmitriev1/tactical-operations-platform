import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { INPUT_BASE, SELECT_BASE } from "../../utils/styles";

interface TaskPriorityRadiusProps {
  priority: "low" | "medium" | "high" | "critical";
  threatRadius: number | null;
  onChangePriority: (priority: "low" | "medium" | "high" | "critical") => void;
  onChangeThreatRadius: (radius: number | null) => void;
  focusRing: string;
}

export function TaskPriorityRadius({
  priority,
  threatRadius,
  onChangePriority,
  onChangeThreatRadius,
  focusRing,
}: TaskPriorityRadiusProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setCustomValidity("");
    }
  }, [t]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.modal.fieldPriority}
        </label>
        <select
          value={priority}
          onChange={(e) =>
            onChangePriority(
              e.target.value as "low" | "medium" | "high" | "critical",
            )
          }
          className={`${SELECT_BASE} ${focusRing}`}
        >
          <option value="low">{t.priorities.low}</option>
          <option value="medium">{t.priorities.medium}</option>
          <option value="high">{t.priorities.high}</option>
          <option value="critical">{t.priorities.critical}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase truncate">
          {t.modal.fieldThreatRadius}
        </label>
        <input
          ref={inputRef}
          type="number"
          min="50"
          max="50000"
          step="1"
          value={threatRadius ?? ""}
          onChange={(e) =>
            onChangeThreatRadius(
              e.target.value === "" ? null : parseInt(e.target.value, 10),
            )
          }
          onInvalid={(e) => {
            const target = e.currentTarget;
            if (target.validity.rangeUnderflow) {
              target.setCustomValidity(t.validation.minThreatRadius);
            } else if (target.validity.rangeOverflow) {
              target.setCustomValidity(t.validation.maxThreatRadius);
            } else {
              target.setCustomValidity("");
            }
          }}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          placeholder={t.modal.placeholderThreatRadius}
          className={`${INPUT_BASE} ${focusRing}`}
        />
      </div>
    </div>
  );
}
