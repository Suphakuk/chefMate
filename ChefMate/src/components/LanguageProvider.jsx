import { createContext, useContext, useState, useEffect } from "react";
import translations from "@/lib/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cookgenius_lang") || "th";
    }
    return "th";
  });

  useEffect(() => {
    localStorage.setItem("cookgenius_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    const dict = translations[lang] || translations.th;
    return dict[key] || key;
  };

  const toggleLang = () => setLang(lang === "th" ? "en" : "th");

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}