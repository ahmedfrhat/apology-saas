import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "../context/LanguageContext";
import { Sun, Moon, Globe } from "lucide-react";

export default function ThemeLanguageHeader() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center justify-end gap-3 pointer-events-none">
      <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg pointer-events-auto">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        
        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-700 dark:text-gray-300"
        >
          <Globe size={16} />
          {locale === "ar" ? "EN" : "AR"}
        </button>
      </div>
    </div>
  );
}
