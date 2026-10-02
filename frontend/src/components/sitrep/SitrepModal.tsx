import { useState, useMemo } from "react";
import { Copy, Download, Check, Sparkles, Loader2 } from "lucide-react";
import { Modal } from "../layout/Modal";
import { useModal } from "../../context/ModalContext";
import { useTask } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { apiRequest } from "../../api/client";
import { SitrepMetricsGrid } from "./SitrepMetricsGrid";
import { SitrepDocumentViewer } from "./SitrepDocumentViewer";

export function SitrepModal() {
  const { activeModal, closeModal } = useModal();
  const { tasks } = useTask();
  const { username } = useAuth();
  const { t, lang } = useLanguage();
  const { theme } = useAccent();

  const [copied, setCopied] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  const isOpen = activeModal === "SITREP";

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      critical: tasks.filter((task) => task.priority === "critical").length,
      high: tasks.filter((task) => task.priority === "high").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      low: tasks.filter((task) => task.priority === "low").length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      cancelled: tasks.filter((task) => task.status === "cancelled").length,
    };
  }, [tasks]);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const sanitizedTasks = tasks.map((t) => ({
        title: t.title,
        description: t.description || "",
        priority: t.priority,
        status: t.status,
        latitude: t.latitude ?? null,
        longitude: t.longitude ?? null,
      }));
      const data = await apiRequest("/sitrep/generate", "POST", {
        body: {
          operator: username || "GHOST-7",
          tasks: sanitizedTasks,
          lang,
        },
      });
      if (data?.report) {
        setReportText(data.report);
        setViewMode("formatted");
      }
    } catch (err) {
      console.error("SITREP generation error:", err);
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
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        <SitrepMetricsGrid metrics={metrics} />

        <SitrepDocumentViewer
          reportText={reportText}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onChangeReportText={setReportText}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!reportText}
              className={`px-3.5 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                copied
                  ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                  : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t.sitrepModal.copied : t.sitrepModal.copyReport}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!reportText}
              className="px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              <span>{t.sitrepModal.downloadTxt}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold ${theme.primaryBtn} flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50`}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>
              {isGenerating ? t.sitrepModal.generating : t.sitrepModal.generateAi}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
