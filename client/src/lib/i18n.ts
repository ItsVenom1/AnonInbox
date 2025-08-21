export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  ja: { name: '日本語', flag: '🇯🇵' },
  id: { name: 'Indonesian', flag: '🇮🇩' },
  el: { name: 'Ελληνικά', flag: '🇬🇷' },
  pt: { name: 'Português', flag: '🇵🇹' },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

export const getLanguageFromPath = (pathname: string): Language => {
  const langCode = pathname.split('/')[1] as Language;
  return languages[langCode] ? langCode : defaultLanguage;
};

export const getPathWithoutLanguage = (pathname: string): string => {
  const langCode = pathname.split('/')[1] as Language;
  if (languages[langCode]) {
    return pathname.substring(3) || '/';
  }
  return pathname;
};

export const getLocalizedPath = (path: string, language: Language): string => {
  if (language === defaultLanguage) {
    return path;
  }
  return `/${language}${path === '/' ? '' : path}`;
};