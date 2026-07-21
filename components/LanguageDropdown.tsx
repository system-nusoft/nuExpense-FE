"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";

interface LanguageDropdownProps {
  variant?: "light" | "dark";
}

export default function LanguageDropdown({ variant = "light" }: LanguageDropdownProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const buttonClass =
    variant === "dark"
      ? "flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
      : "flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={buttonClass}
        aria-label={t("language.selectLanguage")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12h18M12 3c2.5 2.8 4 6.5 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6.5-4-9s1.5-6.2 4-9z"
          />
        </svg>
        <span>{t(`language.${language}`)}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute end-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-72 overflow-y-auto"
        >
          {SUPPORTED_LANGUAGES.map((code) => (
            <button
              key={code}
              role="option"
              aria-selected={language === code}
              onClick={() => {
                setLanguage(code);
                setOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm text-start hover:bg-gray-50 ${
                language === code ? "text-[#3e6378] font-medium" : "text-gray-700"
              }`}
            >
              <span>{t(`language.${code}`)}</span>
              {language === code && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
