import { type ReactElement, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { TranslateIcon } from 'hugeicons-react';
import { loadLanguage } from '@/lib/i18n'; 
import { SUPPORTED_LANGUAGES } from '@/lib/supported-languages';

const languages = SUPPORTED_LANGUAGES;

interface LanguageSwitcherProps {
  variant?: 'default' | 'icon'; 
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps): ReactElement {
  const { i18n, t } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);
  const normalizedLang = i18n.language?.toLowerCase() === 'sa' ? 'ar' : i18n.language?.toLowerCase() ?? 'tr';
  const baseLang = normalizedLang.split('-')[0];
  const currentLanguage = languages.find((lang) => lang.code === baseLang) || languages[0];

  const handleLanguageChange = async (value: string): Promise<void> => {
    const target = value.toLowerCase() === 'sa' ? 'ar' : value.toLowerCase();
    if (target === baseLang) return;
    setIsChanging(true);
    const transitionStartedAt = Date.now();
    try {
      await loadLanguage(target);
      await i18n.changeLanguage(target);
      if (typeof window !== 'undefined') window.localStorage.setItem('i18nextLng', target);
    } finally {
      const remainingDuration = Math.max(0, 350 - (Date.now() - transitionStartedAt));
      if (remainingDuration > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingDuration));
      }
      setIsChanging(false);
    }
  };

  return (
    <>
      <Select value={currentLanguage.code} onValueChange={handleLanguageChange} disabled={isChanging}>
      
      <SelectTrigger 
        className={
          variant === 'default'
            ? "w-[130px] h-9 bg-secondary/50 border-input text-foreground rounded-full focus:ring-1 focus:ring-primary/20 focus:border-primary/50 hover:bg-accent transition-colors border shadow-none"
            : `
              w-12 h-12 rounded-full border border-white/20 bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-black/40 
              flex items-center justify-center p-0 ring-0 focus:ring-0 transition-all duration-300 
              hover:scale-110 active:scale-95 [&>span]:hidden [&>svg:not(.hugeicon)]:hidden
              text-slate-200 
              hover:text-sky-400 
              hover:bg-zinc-800 
              hover:border-sky-500/30 
              hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]
            `
        }
      >
        {variant === 'default' ? (
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue>
              <span className="flex items-center gap-2">
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="hidden sm:inline text-xs font-medium truncate">
                  {currentLanguage.name}
                </span>
              </span>
            </SelectValue>
          </div>
        ) : (
          <TranslateIcon size={20} className="hugeicon drop-shadow-md" />
        )}
      </SelectTrigger>
      
      <SelectContent 
        align={variant === 'icon' ? "end" : "start"} 
        side={variant === 'icon' ? "top" : "bottom"}
        className="bg-[#140a1e]/95 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl z-60 min-w-[140px]"
      >
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="focus:bg-primary/20 focus:text-white cursor-pointer pl-8 py-2.5 data-[state=checked]:text-primary"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
      </Select>
      {isChanging && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[10000] grid place-items-center bg-background/70 backdrop-blur-sm"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="metivon-panel flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden />
                <span className="text-sm font-semibold text-foreground">{t('common.loading')}</span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
