import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, PackageIcon, WarehouseIcon, DeliveryTruck01Icon } from 'hugeicons-react';

export function MetivonDashboardPage(): ReactElement {
  const cards = [
    { title: 'Business Partners', description: 'Customers and suppliers', href: '/accounts', icon: UserGroupIcon, color: 'from-sky-500 to-blue-600' },
    { title: 'Inventory', description: 'Product master data', href: '/inventory', icon: PackageIcon, color: 'from-emerald-500 to-teal-600' },
    { title: 'Warehouses', description: 'Coming in the next phase', icon: WarehouseIcon, color: 'from-amber-500 to-orange-600' },
    { title: 'Operations', description: 'Receipt, transfer and shipment', icon: DeliveryTruck01Icon, color: 'from-violet-500 to-fuchsia-600' },
  ];
  return (
    <section className="mx-auto max-w-7xl">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#171027] via-[#201238] to-[#341552] p-7 text-white shadow-2xl shadow-violet-900/20 md:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">V3RII Metivon</div>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">ERP workspace</h1>
        <p className="mt-3 max-w-2xl text-sm text-violet-100/75 md:text-base">A modular foundation for product, inventory, warehouse and electronic document operations.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, description, href, icon: Icon, color }) => {
          const content = <><div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}><Icon size={24} /></div><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p></>;
          return href ? <Link key={title} to={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">{content}</Link> : <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 opacity-75 dark:border-white/10 dark:bg-white/5">{content}</div>;
        })}
      </div>
    </section>
  );
}
