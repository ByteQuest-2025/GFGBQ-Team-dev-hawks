"use client";

import { useState, useEffect } from "react";
import { type Language, getLanguageFromStorage, getTranslation } from "@/lib/languages";

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => getLanguageFromStorage());

  useEffect(() => {
    setLang(getLanguageFromStorage());
    
    // Listen for language changes
    const handleLanguageChange = (e: CustomEvent) => {
      setLang(e.detail);
    };
    
    window.addEventListener("languagechange" as any, handleLanguageChange);
    return () => {
      window.removeEventListener("languagechange" as any, handleLanguageChange);
    };
  }, []);

  const t = (key: string): string => {
    return getTranslation(key, lang);
  };

  return { lang, t };
}

