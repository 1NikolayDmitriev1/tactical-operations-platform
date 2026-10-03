import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";

interface TaskPhotoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  fieldLabel: string;
  uploadLabel: string;
  removeLabel: string;
}

export function TaskPhotoUpload({
  value,
  onChange,
  fieldLabel,
  uploadLabel,
  removeLabel,
}: TaskPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1000;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        onChange(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
        {fieldLabel}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />
      {value ? (
        <div className="relative rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 group">
          <img src={value} alt="Preview" className="w-full h-32 object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute top-2 right-2 px-2 py-1 rounded bg-red-950/90 hover:bg-red-900 text-red-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors border border-red-800"
          >
            <Trash2 size={12} />
            <span>{removeLabel}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-3 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80"
        >
          <Camera size={14} className="text-zinc-400" />
          <span>{uploadLabel}</span>
        </button>
      )}
    </div>
  );
}
