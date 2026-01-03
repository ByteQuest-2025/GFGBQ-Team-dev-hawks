"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages, type Language, getLanguageFromStorage, setLanguageInStorage } from "@/lib/languages";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export function LanguageSelector({ variant = "ghost", className = "" }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<Language>("en");

  useEffect(() => {
    setCurrentLang(getLanguageFromStorage());
    
    // Listen for language changes from other components
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLang(e.detail);
    };
    
    window.addEventListener("languagechange" as any, handleLanguageChange);
    return () => {
      window.removeEventListener("languagechange" as any, handleLanguageChange);
    };
  }, []);

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    setCurrentLang(lang);
    setLanguageInStorage(lang);
    // Trigger a custom event so pages can listen and update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
      // Force a page refresh to update all translations
      window.location.reload();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-slate-600" />
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-[150px] ${variant === "ghost" ? "border-0 bg-transparent hover:bg-slate-100 shadow-none" : ""}`}>
          <SelectValue>
            {languages[currentLang]?.nativeName || "English"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([code, { name, nativeName }]) => (
            <SelectItem key={code} value={code}>
              {nativeName} ({name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

