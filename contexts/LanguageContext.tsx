"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  resources,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SupportedLanguage,
  isSupportedLanguage,
  getDirection,
} from "@/lib/i18n/config";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
  });
}

function applyDocumentDirection(language: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = getDirection(language);
}

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function LanguageContextBridge({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const [language, setLanguageState] = useState<SupportedLanguage>(
    (i18nInstance.language as SupportedLanguage) || DEFAULT_LANGUAGE
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored) && stored !== i18nInstance.language) {
      i18nInstance.changeLanguage(stored);
      setLanguageState(stored);
      applyDocumentDirection(stored);
    } else {
      applyDocumentDirection(i18nInstance.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(
    (next: SupportedLanguage) => {
      i18nInstance.changeLanguage(next);
      setLanguageState(next);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      applyDocumentDirection(next);
    },
    [i18nInstance]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContextBridge>{children}</LanguageContextBridge>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
