import { MapPin } from "lucide-react";
import { INPUT_BASE } from "../../utils/styles";

interface TaskFormCoordsProps {
  latitude: number | null;
  longitude: number | null;
  onChangeLat: (val: number | null) => void;
  onChangeLng: (val: number | null) => void;
  onPickOnMap: () => void;
  focusRing: string;
  gridTargetLabel: string;
  pickOnMapLabel: string;
  latLabel: string;
  lngLabel: string;
}

export function TaskFormCoords({
  latitude,
  longitude,
  onChangeLat,
  onChangeLng,
  onPickOnMap,
  focusRing,
  gridTargetLabel,
  pickOnMapLabel,
  latLabel,
  lngLabel,
}: TaskFormCoordsProps) {
  return (
    <>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
          {gridTargetLabel}
        </span>
        <button
          type="button"
          onClick={onPickOnMap}
          className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <MapPin size={13} />
          <span>{pickOnMapLabel}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            {latLabel}
          </label>
          <input
            type="number"
            step="any"
            placeholder="—"
            value={latitude ?? ""}
            onChange={(e) =>
              onChangeLat(e.target.value === "" ? null : Number(e.target.value))
            }
            className={`${INPUT_BASE} ${focusRing}`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            {lngLabel}
          </label>
          <input
            type="number"
            step="any"
            placeholder="—"
            value={longitude ?? ""}
            onChange={(e) =>
              onChangeLng(e.target.value === "" ? null : Number(e.target.value))
            }
            className={`${INPUT_BASE} ${focusRing}`}
          />
        </div>
      </div>
    </>
  );
}
