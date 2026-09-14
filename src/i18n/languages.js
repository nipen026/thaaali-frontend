// English plus the major Indian regional languages. Single source of truth for both
// the Settings-page picker and the i18n lookup — a language only shows up in the UI
// once it exists here.
export const LANGUAGES = [
  { code: 'en', label: 'English',   native: 'English' },
  { code: 'hi', label: 'Hindi',     native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali',   native: 'বাংলা' },
  { code: 'mr', label: 'Marathi',   native: 'मराठी' },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati',  native: 'ગુજરાતી' },
  { code: 'ur', label: 'Urdu',      native: 'اردو' },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ' },
  { code: 'or', label: 'Odia',      native: 'ଓଡ଼ିଆ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi',   native: 'ਪੰਜਾਬੀ' },
  { code: 'as', label: 'Assamese',  native: 'অসমীয়া' },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
