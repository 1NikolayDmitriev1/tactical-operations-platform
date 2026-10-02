import ReactMarkdown from "react-markdown";
import { FileText, Eye, Edit3 } from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";

interface SitrepDocumentViewerProps {
  reportText: string;
  viewMode: "formatted" | "raw";
  onChangeViewMode: (mode: "formatted" | "raw") => void;
  onChangeReportText: (text: string) => void;
}

const BADGE_RULES: [RegExp, string][] = [
  [/crit|крит/i, "text-red-300 font-bold bg-red-950/80 border-red-700/70"],
  [/high|висок/i, "text-orange-300 font-bold bg-orange-950/80 border-orange-700/70"],
  [/med|середн/i, "text-amber-300 font-bold bg-amber-950/80 border-amber-700/70"],
  [/low|низьк/i, "text-blue-300 font-bold bg-blue-950/80 border-blue-700/70"],
  [/complet|викон/i, "text-emerald-300 font-semibold bg-emerald-950/60 border-emerald-800/60"],
  [/progress|робот/i, "text-cyan-300 font-semibold bg-cyan-950/60 border-cyan-800/60"],
  [/pending|очікує/i, "text-zinc-300 font-medium bg-zinc-800/80 border-zinc-700"],
];

function getBadgeStyle(text: string): string {
  const match = BADGE_RULES.find(([pattern]) => pattern.test(text));
  return match ? match[1] : "text-zinc-100 font-bold";
}

export function SitrepDocumentViewer({
  reportText,
  viewMode,
  onChangeViewMode,
  onChangeReportText,
}: SitrepDocumentViewerProps) {
  const { theme } = useAccent();
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col border border-zinc-800 rounded-lg overflow-hidden bg-black/90">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-zinc-400">
          <FileText size={13} className={theme.textAccent} />
          <span className="font-bold tracking-wider uppercase text-zinc-300">
            {t.sitrepModal.previewTitle}
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            {t.sitrepModal.previewFormat}
          </span>
        </div>

        {reportText && (
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800">
            <button
              type="button"
              onClick={() => onChangeViewMode("formatted")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                viewMode === "formatted"
                  ? "bg-zinc-800 text-zinc-100 font-bold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Eye size={10} />
              <span>{t.sitrepModal.viewFormatted}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode("raw")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-zinc-800 text-zinc-100 font-bold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Edit3 size={10} />
              <span>{t.sitrepModal.viewRaw}</span>
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[300px] max-h-[380px] md:max-h-[440px] overflow-y-auto p-4 select-text">
        {!reportText ? (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
              <FileText size={24} />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="font-mono font-bold text-zinc-300 text-xs tracking-wider uppercase">
                {t.sitrepModal.emptyTitle}
              </h4>
              <p className="font-mono text-zinc-500 text-xs leading-relaxed">
                {t.sitrepModal.emptyNotice}
              </p>
            </div>
          </div>
        ) : viewMode === "raw" ? (
          <textarea
            value={reportText}
            onChange={(e) => onChangeReportText(e.target.value)}
            rows={14}
            className="w-full h-full font-mono text-xs leading-relaxed bg-transparent text-zinc-200 focus:outline-none resize-none selection:bg-amber-500/30 selection:text-amber-200"
          />
        ) : (
          <div className="space-y-2">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <div className="mt-3 mb-1.5 pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      SEC
                    </span>
                    <h3 className="font-mono font-bold text-zinc-100 text-xs md:text-sm tracking-wider uppercase">
                      {children}
                    </h3>
                  </div>
                ),
                h2: ({ children }) => (
                  <div className="mt-3 mb-1.5 pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      SEC
                    </span>
                    <h4 className="font-mono font-bold text-zinc-100 text-xs md:text-sm tracking-wider uppercase">
                      {children}
                    </h4>
                  </div>
                ),
                h3: ({ children }) => (
                  <h5 className="font-mono font-bold text-amber-400 text-xs uppercase mt-2 mb-1">
                    {children}
                  </h5>
                ),
                p: ({ children }) => (
                  <p className="text-xs md:text-sm text-zinc-300 font-mono leading-relaxed py-0.5">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-2 list-none p-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 my-2 list-decimal list-inside text-xs font-mono text-zinc-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex items-start gap-2.5 text-xs text-zinc-200 font-mono leading-relaxed">
                    <span className="text-amber-400 select-none font-bold mt-0.5 text-xs shrink-0">
                      ▸
                    </span>
                    <div className="flex-1">{children}</div>
                  </li>
                ),
                code: ({ children }) => (
                  <code className="font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded text-[11px] inline-block tracking-tight">
                    {children}
                  </code>
                ),
                strong: ({ children }) => {
                  const label = String(children);
                  const style = getBadgeStyle(label);
                  return (
                    <strong
                      className={`font-mono border px-1.5 py-0.5 rounded text-[10px] inline-block tracking-wider ${style}`}
                    >
                      {children}
                    </strong>
                  );
                },
              }}
            >
              {reportText}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
