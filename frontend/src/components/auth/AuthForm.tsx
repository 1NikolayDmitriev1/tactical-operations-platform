import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAccent } from "../../context/AccentContext";
import { INPUT_BASE } from "../../utils/styles";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { theme } = useAccent();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await login(username, password, "/auth/register");
        await login(username, password);
      }
      onSuccess?.();
      setUsername("");
      setPassword("");
    } catch (err) {
      setError((err as Error).message || "Authentication failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/80 rounded-lg border border-zinc-800/80">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`py-1.5 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
            mode === "login"
              ? `${theme.activeTab} shadow-sm`
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          }`}
        >
          {t.auth.loginTab}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`py-1.5 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
            mode === "register"
              ? `${theme.activeTab} shadow-sm`
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          }`}
        >
          {t.auth.registerTab}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.auth.callsignLabel}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t.auth.callsignPlaceholder}
          className={`${INPUT_BASE} ${theme.focusRing}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          {t.auth.passwordLabel}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.auth.passwordPlaceholder}
          className={`${INPUT_BASE} ${theme.focusRing}`}
        />
      </div>
      {error && (
        <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
          <span className="font-bold">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        className={`w-full mt-2 py-2.5 ${theme.primaryBtn} text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer active:scale-95`}
      >
        {mode === "login" ? t.auth.loginButton : t.auth.registerButton}
      </button>
    </form>
  );
}
