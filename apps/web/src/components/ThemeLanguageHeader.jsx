import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "../context/LanguageContext";
import { Sun, Moon, Globe } from "lucide-react";

/**
 * ThemeLanguageHeader — Premium floating controls
 * Features:
 *  - Cinematic ripple transition when toggling theme
 *  - Glassmorphism pill using CSS design tokens
 *  - Smooth icon swap animation
 */
export default function ThemeLanguageHeader() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const btnRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = useCallback((e) => {
    const html = document.documentElement;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();

    // Calculate click position as percentage
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    // Set ripple origin CSS vars
    html.style.setProperty("--ripple-x", `${x}%`);
    html.style.setProperty("--ripple-y", `${y}%`);

    // Add transition class  
    html.classList.add("theme-transitioning");

    // Inject ripple element
    const ripple = document.createElement("div");
    ripple.className = "theme-ripple";
    document.body.appendChild(ripple);

    // Perform the actual theme change slightly delayed for ripple start
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    }, 50);

    // Cleanup after animation
    setTimeout(() => {
      html.classList.remove("theme-transitioning");
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 600);
  }, [theme, setTheme]);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center justify-end gap-3 pointer-events-none">
      {/* Glassmorphism pill using CSS vars */}
      <div
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border-base)",
          boxShadow: "var(--shadow-card)",
        }}
        className="flex items-center gap-1 p-1.5 rounded-full pointer-events-auto"
      >
        {/* Theme Toggle */}
        <button
          ref={btnRef}
          onClick={handleThemeToggle}
          style={{
            color: "var(--text-secondary)",
            transition: "background-color 200ms ease, color 200ms ease, transform 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          className="p-2 rounded-full"
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div style={{ transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease" }}>
            {isDark
              ? <Sun size={18} className="text-[var(--accent-2)]" style={{ filter: "drop-shadow(0 0 6px rgba(223,186,115,0.6))" }} />
              : <Moon size={18} />
            }
          </div>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-base)" }} />

        {/* Language Toggle */}
        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            fontWeight: 700,
            transition: "background-color 200ms ease, color 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
        >
          <Globe size={14} />
          {locale === "ar" ? "EN" : "AR"}
        </button>
      </div>
    </div>
  );
}
