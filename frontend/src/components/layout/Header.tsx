import { useState } from "react";
import { Lock, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  useAccent,
  ACCENT_THEMES,
  type AccentColor,
} from "../../context/AccentContext";
import { AuthModal } from "../auth/AuthModal";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuth, username, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { accent, setAccent, theme } = useAccent();

  return (
    <header className="h-14 border-b border-zinc-800 px-3 sm:px-6 flex items-center justify-between bg-zinc-900/50 shrink-0 select-none">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <h1 className="font-bold tracking-wider text-xs sm:text-sm text-zinc-200 truncate max-w-32.5 sm:max-w-none">
          {t.header.title}
        </h1>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">{t.header.liveTelemetry}</span>
          <span className="sm:hidden">LIVE</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {isAuth ? (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono rounded border border-emerald-800/80 bg-emerald-950/40 text-emerald-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">
                {t.header.operator}
              </span>
              <span className="font-bold text-emerald-200">
                {username || "OPERATOR"}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold rounded border border-zinc-700/80 bg-zinc-800/70 hover:border-red-800 hover:bg-red-950/40 text-zinc-300 hover:text-red-300 transition-all cursor-pointer active:scale-95"
              title="Terminate session"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400 transition-colors" />
              <span>{t.header.logout}</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-lg border transition-all cursor-pointer active:scale-95 ${theme.outlineBtn}`}
          >
            <Lock className={`w-3.5 h-3.5 ${theme.textAccent}`} />
            <span>{t.header.secureAccess}</span>
          </button>
        )}

        <div
          className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded p-1 gap-1"
          title="Tactical Accent Theme"
        >
          {(["amber", "emerald", "neutral", "sky"] as AccentColor[]).map(
            (colorKey) => {
              const isSelected = accent === colorKey;
              const item = ACCENT_THEMES[colorKey];
              return (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setAccent(colorKey)}
                  title={`Accent: ${item.label}`}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "ring-1.5 ring-zinc-300 scale-110"
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}
                  />
                </button>
              );
            },
          )}
        </div>

        <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded p-0.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
              lang === "en"
                ? `${theme.activeTab} shadow-xs`
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("ua")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
              lang === "ua"
                ? `${theme.activeTab} shadow-xs`
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            UA
          </button>
        </div>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={setIsModalOpen} />
    </header>
  );
}
