import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "../context/LanguageContext";
import AppContext from "@/context/AppContext";
import { Sun, Moon, Globe, Flame } from "lucide-react";

/**
 * ThemeLanguageHeader — Premium tri-theme floating controls
 * Features:
 *  - Tri-theme pills showing exactly what premium mode is active
 *  - Fully bilingual instant localization toggle
 *  - Absolute premium glassmorphism styling
 */
export default function ThemeLanguageHeader() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const appContext = useContext(AppContext);
  const { logLedgerEvent } = appContext || {};
  const btnRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const html = document.documentElement;
    const isCandlelight = html.classList.contains("candlelight");
    const isDark = html.classList.contains("dark");

    let nextTheme = "light";
    if (isCandlelight) {
      nextTheme = "light";
    } else if (isDark) {
      nextTheme = "candlelight";
    } else {
      nextTheme = "dark";
    }

    setTheme(nextTheme);
    html.classList.remove("light", "dark", "candlelight");
    html.classList.add(nextTheme);

    if (logLedgerEvent) {
      let themeName = nextTheme === "candlelight" ? "وضع الشموع 🕯️" : nextTheme === "dark" ? "الوضع المظلم 🌙" : "الوضع المضيء ☀️";
      logLedgerEvent(`غيرت مظهر الموقع إلى: ${themeName}`);
    }
  }, [setTheme, logLedgerEvent]);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center justify-end gap-3 pointer-events-none select-none">
      {/* Flawless Glassmorphic Box */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-full pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800 shadow-xl"
      >
        {/* Flawless Tri-Theme Switcher Pill */}
        <button
          ref={btnRef}
          onClick={handleThemeToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all bg-gray-100/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:scale-105 active:scale-95 shadow-inner cursor-pointer"
          title={
            currentTheme === "light"
              ? "Switch to Midnight Mode"
              : currentTheme === "dark"
              ? "Switch to Candlelight Mode"
              : "Switch to Solar Mode"
          }
        >
          {currentTheme === "candlelight" ? (
            <>
              <Flame size={15} className="text-amber-500 animate-pulse" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }} />
              <span className="font-bold font-mono tracking-tight">{t("themeCandle")}</span>
            </>
          ) : currentTheme === "dark" ? (
            <>
              <Moon size={15} className="text-[#DFBA73]" style={{ filter: "drop-shadow(0 0 6px rgba(223,186,115,0.6))" }} />
              <span className="font-bold font-mono tracking-tight">{t("themeDark")}</span>
            </>
          ) : (
            <>
              <Sun size={15} className="text-amber-600 animate-spin" />
              <span className="font-bold font-mono tracking-tight">{t("themeLight")}</span>
            </>
          )}
        </button>

        {/* Vertical Separator */}
        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800" />

        {/* Language Switcher Pill */}
        <button
          onClick={() => {
            const nextLocale = locale === "ar" ? "en" : "ar";
            setLocale(nextLocale);
            if (logLedgerEvent) {
              logLedgerEvent(`غيرت لغة الموقع إلى: ${nextLocale === "ar" ? "العربية 🇸🇦" : "الإنجليزية 🇬🇧"}`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all bg-amber-800/10 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 hover:scale-105 active:scale-95 cursor-pointer font-mono"
        >
          <Globe size={14} className="text-amber-800 dark:text-amber-400" />
          <span>{locale === "ar" ? "EN" : "AR"}</span>
        </button>
      </div>
    </div>
  );
}
