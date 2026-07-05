import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

function syncDocumentLanguage(language: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.lang = language.startsWith('ar') ? 'ar' : language.startsWith('fr') ? 'fr' : 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

syncDocumentLanguage(i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;

export function changeLanguage(lang: string): void {
  void i18n.changeLanguage(lang);
  syncDocumentLanguage(lang);
}

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
] as const;
