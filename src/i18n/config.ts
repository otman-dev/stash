export type Language = 'en' | 'ar' | 'fr';

export const languages: Language[] = ['en', 'ar', 'fr'];

export const defaultLanguage: Language = 'en';

export const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
};

export const languageDirections: Record<Language, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
  fr: 'ltr',
};