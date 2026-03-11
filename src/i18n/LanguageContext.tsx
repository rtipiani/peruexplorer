'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from './translations';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    const savedLocale = localStorage.getItem('peruexplorer-locale') as Locale;
    if (savedLocale && ['es', 'en', 'fr', 'zh', 'de'].includes(savedLocale)) {
      setLocale(savedLocale);
    } else {
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (['es', 'en', 'fr', 'zh', 'de'].includes(browserLang)) {
        setLocale(browserLang);
      }
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('peruexplorer-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let result: any = translations[locale];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        // Fallback to Spanish if something is missing
        let fallback: any = translations['es'];
        for (const fKey of keys) {
            if (fallback && fallback[fKey]) fallback = fallback[fKey];
            else return path; 
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    
    return typeof result === 'string' ? result : path;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
