import { type ReactElement, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarLeft01Icon, SearchList01Icon, Cancel01Icon, Mic01Icon, ArrowDown01Icon, Settings02Icon, Logout02Icon, Moon02Icon, Sun01Icon, UserIcon } from 'hugeicons-react'
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { UserProfileModal } from '@/features/user-detail-management/components/UserProfileModal';
import { useAppShellStore } from '@/stores/app-shell-store';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useTheme } from '@/components/theme-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme, isBrandThemeListEnabled, brandTheme } = useTheme();
  const { toggleSidebar, searchQuery, setSearchQuery, setSidebarOpen, isSidebarOpen } = useUIStore();
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const userDetail = useAppShellStore((state) =>
    user?.id ? state.userSummaries[String(user.id)]?.data ?? null : null
  );

  const { isListening, isSupported, startListening } = useVoiceSearch({
    onResult: (text) => {
      setSearchQuery(text);
      if (text.trim().length > 0) {
        setSidebarOpen(true);
      }
    },
  });

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'MK';
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleLogout = (): void => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <header className={cn(
        "min-h-18 h-auto pt-[env(safe-area-inset-top)] px-3 sm:px-6 flex items-center justify-between border-b transition-all sticky top-0 z-40 backdrop-blur-2xl",
        "border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_88%,transparent)] shadow-[0_10px_35px_-28px_var(--crm-brand-shadow)]"
      )}>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-20">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-pressed={isSidebarOpen}
            className="p-2 shrink-0 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:shadow-[0_0_15px_var(--crm-brand-shadow)] transition-all duration-300 focus:outline-none"
          >
            <SidebarLeft01Icon size={24} />
          </button>

          <div className="relative hidden md:block w-full max-md group">
            <div className="absolute inset-0 rounded-2xl bg-[image:var(--crm-brand-gradient-soft)] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <SearchList01Icon className="absolute left-4 text-slate-400 w-5 h-5 group-focus-within:text-[var(--crm-brand-primary)] transition-colors duration-300" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={t('navbar.search_placeholder')}
                className={cn(
                  "w-full py-3 pl-12 pr-24 text-base md:text-sm font-medium transition-all duration-300 outline-none rounded-2xl border",
                  "bg-slate-100/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-[var(--crm-brand-ring)]",
                  "dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[var(--crm-app-panel-strong)]",
                  "focus:ring-4 focus:ring-[var(--crm-brand-ring)] focus:shadow-[0_0_20px_var(--crm-brand-shadow)]"
                )}
              />
              <div className="absolute right-3 flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={(e) => { e.preventDefault(); startListening(); }}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      isListening
                        ? "text-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] animate-pulse shadow-[0_0_15px_var(--crm-brand-shadow)]"
                        : "text-slate-400 hover:text-[var(--crm-brand-primary)] hover:bg-slate-100 dark:hover:bg-white/10"
                    )}
                    title={t('common.voiceSearchTitle')}
                  >
                    <Mic01Icon size={18} />
                  </button>
                )}

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <Cancel01Icon size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {isSupported && (
            <button
              onClick={(e) => { e.preventDefault(); startListening(); }}
              className={cn(
                "p-2 md:hidden rounded-xl transition-all duration-300 relative",
                isListening
                  ? "text-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] animate-pulse shadow-[0_0_15px_var(--crm-brand-shadow)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)]"
              )}
            >
              <Mic01Icon size={24} />
              {isListening && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--crm-brand-primary)] rounded-full animate-ping" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-3 h-20">
          <button
            type="button"
            aria-label={isDark ? t('theme.light') : t('theme.dark')}
            title={isBrandThemeListEnabled ? t('appearanceLockedByBrandTheme') : (isDark ? t('theme.light') : t('theme.dark'))}
            disabled={isBrandThemeListEnabled}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] text-[var(--crm-app-text-muted)] transition-all duration-300',
              'hover:-translate-y-0.5 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-primary)] hover:shadow-[0_10px_24px_-14px_var(--crm-brand-shadow)]',
              isBrandThemeListEnabled && 'cursor-not-allowed opacity-45',
            )}
          >
            <Sun01Icon size={19} className={cn('absolute transition-all duration-500', isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
            <Moon02Icon size={19} className={cn('absolute transition-all duration-500', isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0')} />
          </button>
          <div className="flex items-center gap-3 sm:gap-8 shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[var(--crm-brand-soft)] transition-colors cursor-pointer text-slate-500 hover:text-[var(--crm-brand-primary)] dark:text-slate-400 flex items-center justify-center group shrink-0">
              <NotificationIcon />
            </div>
          </div>

          {user && <div className="hidden xs:block h-7 w-px bg-[var(--crm-app-border)] shrink-0" />}

          {user && (
            <Popover>
              <PopoverTrigger asChild>
            <button type="button" className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 rounded-2xl p-1.5 pr-2 transition-all hover:bg-[var(--crm-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-brand-ring)]">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[var(--crm-brand-primary)] transition-colors truncate max-w-[150px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  {t('roles.admin')}
                </p>
              </div>
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[2px] bg-[image:var(--crm-brand-gradient)] group-hover:shadow-[0_0_20px_var(--crm-brand-shadow)] transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[var(--crm-app-background)] flex items-center justify-center overflow-hidden border-2 border-white dark:border-[var(--crm-app-background)]">
                    {userDetail?.profilePictureUrl ? (
                      <img src={getImageUrl(userDetail.profilePictureUrl) || ''} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--crm-brand-primary)]">{displayInitials}</span>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--crm-app-panel)] bg-emerald-500" />
              </div>
              <ArrowDown01Icon size={15} className="hidden text-[var(--crm-app-text-muted)] transition-transform group-data-[state=open]:rotate-180 sm:block" />
            </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,340px)] overflow-hidden rounded-[1.5rem] border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_96%,transparent)] p-0 shadow-2xl backdrop-blur-2xl">
                <div className="relative overflow-hidden border-b border-[var(--crm-app-border)] p-5">
                  <div className="absolute inset-x-0 top-0 h-24 bg-[image:var(--crm-brand-gradient-soft)] opacity-80" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[image:var(--crm-brand-gradient)] text-sm font-black text-white shadow-lg">
                      {userDetail?.profilePictureUrl ? <img src={getImageUrl(userDetail.profilePictureUrl) || ''} alt={displayName} className="h-full w-full object-cover" /> : displayInitials}
                    </div>
                    <div className="min-w-0 flex-1"><p className="truncate font-black text-foreground">{displayName}</p><p className="truncate text-xs text-[var(--crm-app-text-muted)]">{user.email}</p></div>
                    <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Çevrimiçi</span>
                  </div>
                </div>
                <div className="space-y-1.5 p-3">
                  <button type="button" onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-primary)]"><UserIcon size={18} />{t('profile.title')}</button>
                  <button type="button" onClick={() => setUserProfileModalOpen(true)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-primary)]"><Settings02Icon size={18} />{t('sidebar.settings')}<span className="ml-auto rounded-lg border border-[var(--crm-app-border)] px-2 py-0.5 text-[10px] text-[var(--crm-app-text-muted)]">50 tema</span></button>
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--crm-app-border)] p-3">
                    {isDark ? <Moon02Icon size={18} /> : <Sun01Icon size={18} />}<div className="min-w-0 flex-1"><p className="text-sm font-bold">{t('appearance')}</p><p className="truncate text-[10px] text-[var(--crm-app-text-muted)]">{isBrandThemeListEnabled ? brandTheme : theme}</p></div><Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} disabled={isBrandThemeListEnabled} />
                  </div>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-500/10"><Logout02Icon size={18} />{t('logout')}</button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>

      <UserProfileModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        onOpenProfileDetails={() => {
          setUserProfileModalOpen(false);
          navigate('/profile');
        }}
      />
    </>
  );
}
