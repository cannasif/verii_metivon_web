import { type ReactElement, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import {
  ArtificialIntelligence04Icon,
  PackageIcon,
  WarehouseIcon,
  DeliveryTruck01Icon,
  Invoice01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react';

const modules = [
  { title: 'Inventory', description: 'Products, units, lots and balances', icon: PackageIcon, accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500' },
  { title: 'Warehouse', description: 'Warehouses, shelves and locations', icon: WarehouseIcon, accent: 'from-amber-500/20 to-amber-500/5 text-amber-500' },
  { title: 'Operations', description: 'Receipt, transfer and shipment flows', icon: DeliveryTruck01Icon, accent: 'from-orange-500/20 to-orange-500/5 text-orange-500' },
  { title: 'e-Documents', description: 'Invoice, e-Archive and e-Dispatch', icon: Invoice01Icon, accent: 'from-pink-500/20 to-pink-500/5 text-pink-500' },
];

export function DashboardPage(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const branch = useAuthStore((state) => state.branch);
  const setPageTitle = useUIStore((state) => state.setPageTitle);

  useEffect(() => {
    setPageTitle('Metivon Overview');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/75 p-7 shadow-xl shadow-violet-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:p-10">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            <ArtificialIntelligence04Icon size={16} /> AI-powered operations
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Welcome to <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">V3RII Metivon</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            The intelligent operational core for accounts, inventory, warehouse movements and compliant e-documents.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-slate-950">
              {user?.name || user?.email || 'User'}
            </span>
            <span className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Branch: {branch?.name || 'Not selected'}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map(({ title, description, icon: Icon, accent }) => (
          <article key={title} className="group rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
              <Icon size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
              Foundation ready <ArrowRight01Icon size={15} className="transition group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
