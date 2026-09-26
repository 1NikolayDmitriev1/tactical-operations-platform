import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { AuthModal } from "../auth/AuthModal";
import { TaskList } from "../tasks/TaskList";

export function TaskSidebar() {
  const { isAuth } = useAuth();
  const { t } = useLanguage();
  const { theme } = useAccent();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  return (
    <>
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 top-14 bg-black/60 z-1000 md:hidden backdrop-blur-xs"
        />
      )}

      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-18 right-4 z-1001 md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/95 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold shadow-2xl backdrop-blur-md active:scale-95 cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
          <span>{t.tasks.panelTitle}</span>
        </button>
      )}

      <div className="relative flex shrink-0 h-full">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`hidden md:flex absolute -left-6 top-4 z-1001 w-6 h-12 bg-zinc-900/95 hover:bg-zinc-850 border-y border-l border-zinc-700 text-zinc-300 ${theme.hoverText} rounded-l items-center justify-center cursor-pointer transition-all shadow-2xl backdrop-blur-xs active:scale-95`}
          title={
            isCollapsed ? "Expand Tactical Panel" : "Collapse Tactical Panel"
          }
        >
          {isCollapsed ? (
            <ChevronLeft
              className={`w-4 h-4 ${theme.textAccent} animate-pulse`}
            />
          ) : (
            <ChevronRight
              className={`w-4 h-4 text-zinc-400 ${theme.hoverText}`}
            />
          )}
        </button>

        <aside
          className={`border-l border-zinc-800 bg-zinc-950/95 md:bg-zinc-900/30 flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-1001 ${
            isCollapsed
              ? "w-0 border-l-0 opacity-0 pointer-events-none"
              : "fixed top-14 bottom-14 right-0 w-[85vw] max-w-sm md:static md:w-96 md:bottom-0 opacity-100 shadow-2xl md:shadow-none"
          }`}
        >
          <div className="w-full md:w-96 flex flex-col h-full">
            <div className="px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-3.5 rounded-xs ${theme.dotColor}`} />
                <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-100">
                  {t.tasks.panelTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300">
                  {t.tasks.panelSubtitle}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="md:hidden p-1 text-zinc-400 hover:text-zinc-100 cursor-pointer text-xs"
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isAuth ? (
                <TaskList />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-zinc-800 bg-zinc-950/60 rounded-lg mt-4 relative overflow-hidden group">
                  <div className="absolute top-2.5 left-2.5 text-[8px] font-mono text-zinc-600 select-none">
                    ┌ SEC-01
                  </div>
                  <div className="absolute top-2.5 right-2.5 text-[8px] font-mono text-zinc-600 select-none">
                    ┐
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-[8px] font-mono text-zinc-600 select-none">
                    └
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 text-[8px] font-mono text-zinc-600 select-none">
                    ┘
                  </div>

                  <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400 mb-3">
                    <Lock className="w-5 h-5 text-red-400" />
                  </div>

                  <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-200 uppercase">
                    {t.tasks.restrictedArea}
                  </h4>
                  <span className="text-[10px] font-mono text-red-400/90 tracking-wider mt-0.5">
                    {t.tasks.opsecClearance}
                  </span>

                  <p className="text-[11px] text-zinc-400 font-sans mt-3 leading-relaxed max-w-60">
                    {t.tasks.restrictedDesc}
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="mt-4 px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded border border-red-800/80 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    {t.tasks.authenticate}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={setIsAuthModalOpen} />
    </>
  );
}
