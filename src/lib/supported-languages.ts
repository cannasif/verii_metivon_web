export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', short: 'TR', direction: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', short: 'DE', direction: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR', direction: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', short: 'ES', direction: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', short: 'IT', direction: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', short: 'PT', direction: 'ltr' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', short: 'NL', direction: 'ltr' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', short: 'PL', direction: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', short: 'RU', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', short: 'AR', direction: 'rtl' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', short: 'FA', direction: 'rtl' },
  { code: 'zh', name: '中文', flag: '🇨🇳', short: 'ZH', direction: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', short: 'JA', direction: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', short: 'KO', direction: 'ltr' },
] as const;

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(language => language.code);
