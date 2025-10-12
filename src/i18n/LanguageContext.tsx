"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, defaultLanguage, languageDirections } from './config';
import { translate } from './translate';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'ar', 'fr'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      
      // Set the direction attribute on the html tag
      document.documentElement.dir = languageDirections[language];
      
      // Add a class to help with RTL-specific styling
      if (languageDirections[language] === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return translate(key, language);
  };

  const value = {
    language,
    setLanguage,
    t,
    dir: languageDirections[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}