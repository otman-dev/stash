"use client";

import { useState, useEffect } from 'react';
import { Language, languages, languageNames } from '@/i18n/config';
import { useLanguage } from '@/i18n/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ 
  className = ''
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Flag emojis for each language
  const languageFlags: Record<Language, string> = {
    en: "🇺🇸",
    ar: "🇸🇦",
    fr: "🇫🇷",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen) setIsOpen(false);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base">{languageFlags[language]}</span>
        <span>{languageNames[language]}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
            {languages.map((lang) => (
              <button
                key={lang}
                className={`block w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                  language === lang
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
                onClick={() => selectLanguage(lang)}
              >
                <span>{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}