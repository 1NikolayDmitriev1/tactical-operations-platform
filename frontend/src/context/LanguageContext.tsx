import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language, type TranslationSchema } from "../locales";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: TranslationSchema;
}

const STORAGE_KEY = "top_language";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved === "en" || saved === "ua") {
    return saved;
  }

  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("uk") || browserLang.startsWith("ua")) {
    return "ua";
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "ua" : "en");
  };

  useEffect(() => {
    document.documentElement.lang = lang === "ua" ? "uk" : "en";
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: translations[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
