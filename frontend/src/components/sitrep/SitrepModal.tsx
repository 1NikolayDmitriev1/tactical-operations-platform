import { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Download,
  Check,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Modal } from "../layout/Modal";
import { useModal } from "../../context/ModalContext";
import { useTask } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { apiRequest } from "../../api/client";

export function SitrepModal() {
  const { activeModal, closeModal } = useModal();
  const { tasks } = useTask();
  const { username } = useAuth();
  const { t, lang } = useLanguage();
  const { theme } = useAccent();

  const [copied, setCopied] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const isOpen = activeModal === "SITREP";

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      critical: tasks.filter((task) => task.priority === "critical").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await apiRequest("/sitrep/generate", "POST", {
        body: {
          operator: username || "GHOST-7",
          tasks,
          lang,
        },
      });
      if (data?.report) {
        setReportText(data.report);
      }
    } catch {
      setReportText(t.sitrepModal.errorAi);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SITREP_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title={t.sitrepModal.title}
      subtitle={t.sitrepModal.subtitle}
      isOpen={isOpen}
      onClose={closeModal}
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              {t.sitrepModal.totalTargets}
            </span>
            <span className="text-xl font-mono font-bold text-zinc-100 mt-1">
              {metrics.total}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-800/40 flex flex-col">
            <span className="text-[10px] font-mono text-red-400 uppercase flex items-center gap-1">
              <AlertTriangle size={11} />
              {t.sitrepModal.critical}
            </span>
            <span className="text-xl font-mono font-bold text-red-300 mt-1">
              {metrics.critical}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 flex flex-col">
            <span className="text-[10px] font-mono text-amber-400 uppercase">
              {t.sitrepModal.inProgress}
            </span>
            <span className="text-xl font-mono font-bold text-amber-300 mt-1">
              {metrics.inProgress}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex flex-col">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">
              {t.sitrepModal.completed}
            </span>
            <span className="text-xl font-mono font-bold text-emerald-300 mt-1">
              {metrics.completed}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-t border-x border-zinc-800 rounded-t-lg text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <FileText size={12} className={theme.textAccent} />
              {t.sitrepModal.previewTitle}
            </span>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Sparkles size={11} />
              )}
              <span>
                {isGenerating ? t.sitrepModal.generating : t.sitrepModal.generateAi}
              </span>
            </button>
          </div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder={t.sitrepModal.emptyNotice}
            rows={12}
            className="w-full p-3 font-mono text-[11px] leading-relaxed bg-black/90 border border-zinc-800 rounded-b-lg text-zinc-300 focus:outline-none resize-none select-text selection:bg-amber-500/30 selection:text-amber-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!reportText}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                copied
                  ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                  : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t.sitrepModal.copied : t.sitrepModal.copyReport}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!reportText}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-mono text-xs font-bold ${theme.primaryBtn} flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download size={14} />
              <span>{t.sitrepModal.downloadTxt}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
          >
            {t.sitrepModal.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}
