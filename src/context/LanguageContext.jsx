import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LANGUAGES } from '../i18n/languages';
import { translate } from '../i18n';

export { LANGUAGES };

const LanguageContext = createContext(null);
const STORAGE_KEY = 'thaali_language';

// Pre-selects whichever of the above the browser/OS is already set to, so the field
// opens on the visitor's own language instead of always defaulting to English.
function detectSystemLanguage() {
  const prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
  for (const p of prefs) {
    const primary = p.split('-')[0].toLowerCase();
    if (LANGUAGES.some((l) => l.code === primary)) return primary;
  }
  return 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) || detectSystemLanguage());

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const setLanguage = (code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLanguageState(code);
  };

  const t = useCallback((key, fallback) => translate(language, key, fallback), [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
