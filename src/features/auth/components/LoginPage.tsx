import { lazy, Suspense, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { z } from 'zod';
import {
  Boxes,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  PackageCheck,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Truck,
  Warehouse,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLoadingState,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';
import { clearPerfMarks, perfMark, perfMeasureOnNextPaint } from '@/lib/perf-metrics';
import { loginRequestSchema } from '../types/auth';
import { useBranches } from '../hooks/useBranches';
import { useLogin } from '../hooks/useLogin';

const AuthBackground = lazy(async () =>
  import('./AuthBackground').then((module) => ({ default: module.AuthBackground })),
);

const moduleNodes = [
  { key: 'accounts', icon: Building2, code: '01' },
  { key: 'inventory', icon: Boxes, code: '02' },
  { key: 'warehouse', icon: Warehouse, code: '03' },
  { key: 'shipping', icon: Truck, code: '04' },
] as const;

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: branches, isLoading: isBranchesLoading } = useBranches();
  const { mutate: login, isPending } = useLogin(branches);
  const logout = useAuthStore((state) => state.logout);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  const form = useForm<z.input<typeof loginRequestSchema>>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '', branchId: '', rememberMe: true },
  });

  useEffect(() => {
    clearPerfMarks('login:mount:start', 'login:mount_to_paint', 'login:mount_to_paint:end');
    perfMark('login:mount:start');
    perfMeasureOnNextPaint('login:mount_to_paint', 'login:mount:start');
  }, []);

  useEffect(() => {
    if (!branches?.length || form.getValues('branchId')) return;
    const defaultBranch = branches.find((branch) => branch.isDefault) ?? branches[0];
    form.setValue('branchId', defaultBranch.id, { shouldValidate: false });
  }, [branches, form]);

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      logout();
      toast.warning(t('auth.login.sessionExpired'));
      setSearchParams({}, { replace: true });
      return;
    }
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token && isTokenValid(token)) navigate('/', { replace: true });
  }, [logout, navigate, searchParams, setSearchParams, t]);

  return (
    <main className="metivon-login relative h-dvh overflow-x-hidden overflow-y-auto bg-[#070711] text-white lg:overflow-y-hidden">
      <Suspense fallback={null}>
        <AuthBackground isActive={showAnimation} />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,.15),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(217,70,239,.13),transparent_34%),linear-gradient(135deg,rgba(7,7,17,.82),rgba(7,7,17,.96))]" />

      <div className="relative z-20 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 shadow-[0_0_30px_rgba(236,72,153,.18)]">
              <Network className="h-5 w-5 text-fuchsia-300" />
            </div>
            <div>
              <div className="text-sm font-black tracking-[.22em]">V3RII</div>
              <div className="text-[10px] font-semibold tracking-[.3em] text-fuchsia-300">METIVON</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="icon" />
            <button
              type="button"
              onClick={() => setShowAnimation((value) => !value)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[.06] text-slate-300 backdrop-blur-xl transition hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
              title={showAnimation ? t('auth.login.animationOff') : t('auth.login.animationOn')}
              aria-label={showAnimation ? t('auth.login.animationOff') : t('auth.login.animationOn')}
            >
              {showAnimation ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 items-center gap-8 px-5 pb-6 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,.85fr)] lg:px-12 xl:gap-16 xl:px-[7vw]">
          <section className="hidden min-w-0 lg:block">
            <div className="mb-5 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/[.08] px-3 py-1.5 text-xs font-semibold tracking-[.16em] text-fuchsia-200">
                <Sparkles className="h-3.5 w-3.5" />
                {t('auth.login.eyebrow')}
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-.04em] xl:text-6xl">
                {t('auth.login.heroTitle')}
                <span className="mt-2 block bg-gradient-to-r from-fuchsia-400 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                  METIVON
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 xl:text-base">
                {t('auth.login.heroDescription')}
              </p>
            </div>

            <div className="relative max-w-[720px] overflow-hidden rounded-[30px] border border-cyan-300/15 bg-[#0c0d19]/78 p-5 shadow-[0_30px_90px_rgba(0,0,0,.4)] backdrop-blur-xl xl:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(34,211,238,.07),transparent_38%,rgba(217,70,239,.08))]" />
              <div className="relative mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                    <PackageCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-bold tracking-[.16em] text-white">METIVON ERP FLOW</div>
                    <div className="mt-1 text-[10px] text-slate-400">ERP CORE · V1</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/[.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-emerald-300">
                  <span className={`h-1.5 w-1.5 rounded-full bg-emerald-300 ${showAnimation ? 'metivon-live-dot' : ''}`} />
                  {t('auth.login.live')}
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="pointer-events-none absolute left-[11%] right-[11%] top-6 hidden h-px bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/50 to-rose-400/40 sm:block" />
                <div className={`metivon-flow-pulse pointer-events-none absolute top-[22px] hidden h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-white to-transparent sm:block ${showAnimation ? 'is-running' : ''}`} />
                {moduleNodes.map(({ key, icon: Icon, code }) => (
                  <div key={key} className="relative rounded-2xl border border-white/10 bg-white/[.035] p-3 text-center shadow-lg">
                    <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#111321] text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,.12)]">
                      <Icon className="h-5 w-5" />
                      <span className="absolute -right-1 -top-1 rounded-md border border-white/10 bg-[#181828] px-1.5 py-0.5 text-[8px] font-bold text-slate-400">{code}</span>
                    </span>
                    <div className="mt-3 truncate text-[11px] font-semibold text-slate-100">{t(`auth.login.modules.${key}`)}</div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[8px] uppercase tracking-[.12em] text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" /> {t('auth.login.live')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/[.07] bg-black/20 px-4 py-3 text-[10px] font-medium text-slate-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>{t('auth.login.secureWorkspace')}</span>
                <span className="ms-auto hidden font-mono text-cyan-300 sm:block">SYNC 00:01</span>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[470px]">
            <div className="rounded-[30px] border border-white/[.11] bg-[#0b0c16]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,.58)] backdrop-blur-2xl sm:p-8">
              <div className="mb-7">
                <div className="mb-5 flex items-center gap-3 lg:hidden">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/25 to-orange-400/15 text-fuchsia-200">
                    <PackageCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-black tracking-[.2em]">V3RII METIVON</div>
                    <div className="text-xs text-slate-400">{t('auth.login.title')}</div>
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-fuchsia-300">
                  {t('auth.login.welcomeEyebrow')}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t('auth.login.welcomeTitle')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t('auth.login.welcomeDescription')}</p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(
                    (data) => login({ ...data }),
                    () => toast.error(t('auth.login.loginError'), { description: t('auth.validation.requiredFieldsNotFilled') }),
                  )}
                  className="space-y-4"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="mb-2 text-xs font-semibold text-slate-200">{t('auth.login.branchPlaceholder')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500 transition group-focus-within:text-fuchsia-300" />
                            <Select onValueChange={field.onChange} value={field.value} disabled={isBranchesLoading}>
                              <SelectTrigger
                                isLoading={isBranchesLoading}
                                className={`metivon-field h-12 w-full rounded-xl !bg-[#161724] pl-11 text-left !text-slate-100 shadow-inner transition focus:ring-0 ${fieldState.invalid ? 'border-red-400/70' : 'border-white/[.13] hover:border-white/25 focus:border-fuchsia-400/70'}`}
                              >
                                <SelectValue placeholder={isBranchesLoading ? t('common.loading') : t('auth.login.branchPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent className="max-h-64 border-white/10 bg-[#10101c]/95 text-white backdrop-blur-xl">
                                {isBranchesLoading ? (
                                  <SelectLoadingState text={t('common.loading')} />
                                ) : (
                                  branches?.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id} className="cursor-pointer py-3 focus:bg-fuchsia-500/15 focus:text-white">
                                      <span className="flex items-center gap-2">
                                        <span>{branch.name}</span>
                                        {branch.isDefault ? <span className="text-[9px] uppercase tracking-wider text-fuchsia-300">{t('auth.login.defaultBranch')}</span> : null}
                                      </span>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="mb-2 text-xs font-semibold text-slate-200">{t('auth.login.emailPlaceholder')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition group-focus-within:text-fuchsia-300" />
                            <Input {...field} type="email" autoComplete="username" placeholder={t('auth.login.emailPlaceholder')} className={`metivon-field h-12 !bg-[#161724] pl-11 !text-slate-100 caret-fuchsia-300 placeholder:!text-slate-500 focus-visible:ring-0 ${fieldState.invalid ? 'border-red-400/70' : 'border-white/[.13] focus-visible:border-fuchsia-400/70'}`} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="mb-2 text-xs font-semibold text-slate-200">{t('auth.login.passwordPlaceholder')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition group-focus-within:text-fuchsia-300" />
                            <Input
                              {...field}
                              type={isPasswordVisible ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder={t('auth.login.passwordPlaceholder')}
                              onKeyDown={(event) => setCapsLockActive(event.getModifierState('CapsLock'))}
                              onKeyUp={(event) => setCapsLockActive(event.getModifierState('CapsLock'))}
                              className={`metivon-field h-12 !bg-[#161724] pl-11 pr-12 !text-slate-100 caret-fuchsia-300 placeholder:!text-slate-500 focus-visible:ring-0 ${fieldState.invalid ? 'border-red-400/70' : 'border-white/[.13] focus-visible:border-fuchsia-400/70'}`}
                            />
                            <button type="button" onClick={() => setIsPasswordVisible((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white" aria-label={isPasswordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')}>
                              {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                        {capsLockActive && !fieldState.error ? <p className="text-xs text-amber-300">{t('auth.login.capsLockOn')}</p> : null}
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <label className="flex cursor-pointer items-center gap-2 text-slate-400 transition hover:text-white">
                              <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-3.5 w-3.5 accent-fuchsia-500" />
                              {t('auth.login.rememberMe')}
                            </label>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Link to="/auth/forgot-password" className="text-fuchsia-300 transition hover:text-fuchsia-200">
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>

                  <button type="submit" disabled={isPending} className="group relative mt-3 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 text-sm font-bold shadow-[0_14px_40px_rgba(236,72,153,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(236,72,153,.35)] disabled:cursor-not-allowed disabled:opacity-60">
                    <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[430%]" />
                    <span className="relative">{isPending ? t('auth.login.processing') : t('auth.login.submitButton')}</span>
                  </button>
                </form>
              </Form>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[.16em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {t('auth.login.secureLogin')}
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[.06] px-5 py-4 text-[10px] tracking-[.12em] text-slate-600 sm:flex-row sm:px-8 lg:px-12">
          <span>V3RII · RESEARCH · INTEGRATION · INFRASTRUCTURE</span>
          <span>METIVON ERP · V1</span>
        </footer>
      </div>

      <style>{`
        .metivon-login input { color-scheme: dark; }
        .metivon-login .metivon-field { color: #f8fafc !important; background-color: #161724 !important; -webkit-text-fill-color: #f8fafc !important; opacity: 1 !important; }
        .metivon-login .metivon-field::placeholder { color: #64748b !important; -webkit-text-fill-color: #64748b !important; opacity: 1; }
        .metivon-login input:-webkit-autofill,
        .metivon-login input:-webkit-autofill:hover,
        .metivon-login input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 48px #161724 inset !important; -webkit-text-fill-color: #f8fafc !important; caret-color: #f8fafc !important; transition: background-color 9999s ease-out 0s; }
        .metivon-flow { opacity: .72; transition: opacity 200ms ease; }
        .metivon-flow.is-paused { opacity: .3; }
        .metivon-flow__routes { opacity: .72; }
        .metivon-flow__packets path { animation: metivon-packet 8s linear infinite; filter: drop-shadow(0 0 7px currentColor); }
        .metivon-flow__packets path:nth-child(2) { animation-delay: -2.6s; animation-duration: 10s; }
        .metivon-flow__packets path:nth-child(3) { animation-delay: -5.1s; animation-duration: 12s; }
        .metivon-flow__nodes circle { animation: metivon-node-pulse 3.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .metivon-flow__nodes circle:nth-child(3n) { animation-delay: -1.4s; }
        .metivon-flow__nodes circle:nth-child(4n) { animation-delay: -2.7s; }
        .metivon-flow.is-paused * { animation-play-state: paused !important; }
        .metivon-flow-pulse.is-running { animation: metivon-flow-progress 4s cubic-bezier(.4,0,.2,1) infinite; }
        .metivon-live-dot { animation: metivon-live 1.8s ease-out infinite; }
        @keyframes metivon-packet { to { stroke-dashoffset: -100; } }
        @keyframes metivon-node-pulse { 50% { opacity: .42; transform: scale(.65); } }
        @keyframes metivon-flow-progress { from { left: 8%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } to { left: 82%; opacity: 0; } }
        @keyframes metivon-live { 70%, 100% { box-shadow: 0 0 0 7px rgba(110,231,183,0); } 0% { box-shadow: 0 0 0 0 rgba(110,231,183,.35); } }
        @media (prefers-reduced-motion: reduce) { .metivon-login *, .metivon-login *::before, .metivon-login *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
      `}</style>
    </main>
  );
}
