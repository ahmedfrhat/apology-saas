import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, ShieldCheck, FileText, Send } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 w-full border-t border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 py-8 text-center backdrop-blur-xl select-none transition-colors">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-8">
        <a 
          href="/privacy" 
          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-400 font-extrabold transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck size={16} className="text-amber-800 dark:text-amber-500" />
          <span>{t("footerPrivacy")}</span>
        </a>

        <a 
          href="/terms" 
          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-400 font-extrabold transition-colors flex items-center gap-1.5"
        >
          <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          <span>{t("footerTerms")}</span>
        </a>

        <a 
          href="/contact" 
          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-400 font-extrabold transition-colors flex items-center gap-1.5"
        >
          <Send size={16} className="text-green-600 dark:text-green-400" />
          <span>{t("footerContact")}</span>
        </a>
      </div>
      
      <p className="mt-6 text-xs text-gray-500 dark:text-gray-500 font-medium tracking-wide flex items-center justify-center gap-1 font-mono">
        <span>{t("footerCopyright")}</span>
        <Heart size={13} className="text-rose-600 fill-rose-600 inline-block ms-1 animate-pulse" />
      </p>
    </footer>
  );
}
