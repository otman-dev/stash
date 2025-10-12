import { defaultLanguage, Language } from './config';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import frTranslations from './locales/fr.json';

// Define the shape of our translations
type TranslationsType = typeof enTranslations;

// Create a dictionary of all translations with partial types
// This allows translations that don't have all keys from the English version
const translations: Record<Language, Partial<TranslationsType>> = {
  en: enTranslations,
  ar: arTranslations as any,  // Use type assertion to avoid the exact shape matching
  fr: frTranslations as any
};

// Helper function to get nested translation keys
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return path; // Return the path if translation not found
  }, obj);
}

// Function to translate a key
export function translate(key: string, lang: Language = defaultLanguage): string {
  // First try to get the translation in the requested language
  const translationObj = translations[lang];
  if (!translationObj) {
    return key;
  }

  // Try to get the translation
  const value = getNestedValue(translationObj, key);
  
  // If translation is found in the requested language, return it
  if (typeof value === 'string' && value !== key) {
    return value;
  }
  
  // If translation not found and language is not English, try English as fallback
  if (lang !== 'en') {
    const enValue = getNestedValue(translations['en'], key);
    if (typeof enValue === 'string') {
      return enValue;
    }
  }
  
  // If all else fails, return the key
  return key;
}

// Short alias for translate function
export function t(key: string, lang: Language = defaultLanguage): string {
  return translate(key, lang);
}