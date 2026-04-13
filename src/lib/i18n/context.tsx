"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Locale, LOCALE_NAMES, COUNTRY_LOCALE, createTranslator } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "tinda-language";

function detectLocale(): Locale {
  // 1. Check localStorage
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in LOCALE_NAMES) return saved as Locale;
  }

  // 2. Check browser language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    if (browserLang in LOCALE_NAMES) return browserLang as Locale;
  }

  // 3. Default to French
  return "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      const translator = createTranslator(locale);
      return translator(key, replacements);
    },
    [locale]
  );

  // Avoid hydration mismatch — render French on server, detect on client
  const value: I18nContextValue = {
    locale: mounted ? locale : "fr",
    setLocale,
    t: mounted ? t : createTranslator("fr"),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  const { t } = useContext(I18nContext);
  return t;
}

export function useLocale() {
  const { locale, setLocale } = useContext(I18nContext);
  return { locale, setLocale };
}

/** Get the default locale for a country code */
export function getLocaleForCountry(countryCode: string): Locale {
  return COUNTRY_LOCALE[countryCode] ?? "fr";
}
