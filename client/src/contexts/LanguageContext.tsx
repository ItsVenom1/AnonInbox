import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, defaultLanguage, getLanguageFromPath } from '@/lib/i18n';

// Translation files
import enTranslations from '@/translations/en.json';
import esTranslations from '@/translations/es.json';
import frTranslations from '@/translations/fr.json';
import deTranslations from '@/translations/de.json';
import svTranslations from '@/translations/sv.json';
import ruTranslations from '@/translations/ru.json';
import trTranslations from '@/translations/tr.json';
import jaTranslations from '@/translations/ja.json';
import idTranslations from '@/translations/id.json';
import elTranslations from '@/translations/el.json';
import ptTranslations from '@/translations/pt.json';

const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  sv: svTranslations,
  ru: ruTranslations,
  tr: trTranslations,
  ja: jaTranslations,
  id: idTranslations,
  el: elTranslations,
  pt: ptTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from URL or localStorage
    const urlLang = getLanguageFromPath(window.location.pathname);
    const savedLang = localStorage.getItem('nordmail_language') as Language;
    return urlLang !== defaultLanguage ? urlLang : (savedLang || defaultLanguage);
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nordmail_language', lang);
    
    // Update URL without page reload
    const currentPath = window.location.pathname;
    const pathWithoutLang = getPathWithoutLanguage(currentPath);
    const newPath = lang === defaultLanguage ? pathWithoutLang : `/${lang}${pathWithoutLang}`;
    
    window.history.pushState({}, '', newPath);
  };

  // Helper function to get nested translation
  const getNestedTranslation = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || path;
  };

  const t = (key: string): string => {
    return getNestedTranslation(translations[language], key);
  };

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlLang = getLanguageFromPath(window.location.pathname);
      if (urlLang !== language) {
        setLanguageState(urlLang);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Helper function to get path without language prefix
const getPathWithoutLanguage = (pathname: string): string => {
  const segments = pathname.split('/');
  if (segments[1] && Object.keys(translations).includes(segments[1])) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
};