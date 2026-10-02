import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ACCENT_THEMES,
  type AccentColor,
  type AccentTheme,
} from "../utils/accentThemes";

export type { AccentColor, AccentTheme } from "../utils/accentThemes";
export { ACCENT_THEMES } from "../utils/accentThemes";

interface AccentContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  theme: AccentTheme;
}

const STORAGE_KEY = "top_accent_color";

const AccentContext = createContext<AccentContextType | undefined>(undefined);

function getInitialAccent(): AccentColor {
  const saved = localStorage.getItem(STORAGE_KEY) as AccentColor | null;
  if (saved && saved in ACCENT_THEMES) {
    return saved;
  }
  return "neutral";
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(getInitialAccent);

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem(STORAGE_KEY, newAccent);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  return (
    <AccentContext.Provider
      value={{
        accent,
        setAccent,
        theme: ACCENT_THEMES[accent],
      }}
    >
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent(): AccentContextType {
  const context = useContext(AccentContext);
  if (!context) {
    throw new Error("useAccent must be used within an AccentProvider");
  }
  return context;
}
