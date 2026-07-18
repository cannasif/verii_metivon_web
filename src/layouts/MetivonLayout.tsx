import { useState, type ReactElement } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Cancel01Icon,
  DashboardCircleIcon,
  PackageIcon,
  Settings02Icon,
  SidebarLeft01Icon,
  UserGroupIcon,
} from "hugeicons-react";
import { RouteNamespaceLoader } from "@/components/shared/RouteNamespaceLoader";
import { ExchangeRateHeader } from "@/features/exchange-rates/components/ExchangeRateHeader";
import { UserProfileModal } from "@/features/user-detail-management/components/UserProfileModal";
import { getImageUrl } from "@/features/user-detail-management/utils/image-url";
import { useAppShellStore } from "@/stores/app-shell-store";
import { useAuthStore } from "@/stores/auth-store";

export function MetivonLayout(): ReactElement {
  const { t } = useTranslation("business-partner-management");
  const { t: tc } = useTranslation("common");
  const { t: te } = useTranslation("erp");
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isAccountDefinitionsOpen, setIsAccountDefinitionsOpen] =
    useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProductDefinitionsOpen, setIsProductDefinitionsOpen] =
    useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isAccountingDefinitionsOpen, setIsAccountingDefinitionsOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const branch = useAuthStore((state) => state.branch);
  const user = useAuthStore((state) => state.user);
  const userDetail = useAppShellStore((state) =>
    user?.id ? state.userSummaries[String(user.id)]?.data ?? null : null,
  );
  const displayName = user?.name || user?.email || tc("common.user", { defaultValue: "Kullanıcı" });
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const branchDisplayName =
    !branch?.name || branch.name.trim().toLocaleLowerCase() === "default branch"
      ? te("common.defaultBranch", { defaultValue: "Varsayılan Şube" })
      : branch.name;
  const definitionLinks = [
    { title: te("nav.partnerTypes"), type: "partner-types" },
    { title: te("nav.partnerGroups"), type: "customer-groups" },
    { title: te("nav.paymentTerms"), type: "payment-terms" },
    { title: te("nav.currencies"), type: "currencies" },
    { title: te("nav.taxGroups"), type: "tax-groups" },
  ];
  const productDefinitionLinks = [
    { title: te("nav.productCategories"), type: "categories" },
    { title: te("nav.productGroups"), type: "groups" },
    { title: te("nav.brands"), type: "brands" },
    { title: te("nav.unitCategories"), type: "unit-categories" },
    { title: te("nav.units"), type: "units" },
    { title: te("nav.packageTypes"), type: "package-types" },
  ];
  const handleMenuSearch = (value: string): void => {
    setMenuSearch(value);
    const normalized = value.trim().toLocaleLowerCase("tr-TR");
    requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>("[data-sidebar-title]")
        .forEach((element) => {
          const title =
            element.dataset.sidebarTitle?.toLocaleLowerCase("tr-TR") ?? "";
          element.hidden = normalized.length > 0 && !title.includes(normalized);
        });
    });
  };

  const sidebarContent = (mobile = false): ReactElement => (
    <>
      <div className="metivon-hero mb-8 flex items-start gap-3 rounded-2xl p-5">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            V3RII
          </div>
          <div className="mt-1 text-2xl font-bold">Metivon</div>
          <div className="mt-2 text-xs text-white/75">
            Research · Integration · Infrastructure
          </div>
        </div>
        {mobile ? (
          <button
            type="button"
            aria-label={tc("common.close", { defaultValue: "Kapat" })}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <Cancel01Icon size={19} />
          </button>
        ) : null}
      </div>

      <label className="relative mb-4 block">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={menuSearch}
          onChange={(event) => handleMenuSearch(event.target.value)}
          placeholder={te("common.menuSearch")}
          aria-label={te("common.menuSearch")}
          className="metivon-panel-muted metivon-focus h-10 w-full rounded-xl border ps-10 pe-3 text-sm outline-none transition"
        />
      </label>

      <nav
        className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1"
        aria-label={tc("sidebar.navigation", { defaultValue: "Ana menü" })}
      >
        <SidebarLink
          title={tc("sidebar.dashboard")}
          href="/"
          icon={<DashboardCircleIcon size={21} />}
          close={() => setIsMobileSidebarOpen(false)}
          end
        />
        <MenuSection
          title={te("nav.accountOperations")}
          open={isAccountsOpen}
          toggle={() => setIsAccountsOpen((value) => !value)}
        >
            <div className="space-y-1">
              <SidebarLink
                title={t("title")}
                href="/accounts"
                icon={<UserGroupIcon size={20} />}
                close={() => setIsMobileSidebarOpen(false)}
                end
              />
              <SidebarLink
                title={te("nav.businessPartnerParameters", { defaultValue: "Cari Parametreleri" })}
                href="/accounts/parameters"
                icon={<Settings02Icon size={20} />}
                close={() => setIsMobileSidebarOpen(false)}
                end
              />
              <button
                type="button"
                onClick={() => setIsAccountDefinitionsOpen((value) => !value)}
                aria-expanded={isAccountDefinitionsOpen}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <Settings02Icon size={20} />
                <span className="flex-1 text-start">{te("nav.accountDefinitions")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isAccountDefinitionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isAccountDefinitionsOpen ? (
                <div className="ms-5 mt-1 space-y-1 border-s border-slate-200 ps-3 dark:border-white/10">
                  {definitionLinks.map((item) => (
                    <NavLink
                      key={item.type}
                      to={`/accounts/definitions/${item.type}`}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-xs transition ${isActive ? "bg-violet-100 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200" : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`
                      }
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
        </MenuSection>
        <MenuSection
          title={te("nav.stockOperations")}
          open={isProductsOpen}
          toggle={() => setIsProductsOpen((value) => !value)}
        >
            <div className="space-y-1">
              <SidebarLink
                title={tc("sidebar.stockManagement")}
                href="/stocks"
                icon={<PackageIcon size={21} />}
                close={() => setIsMobileSidebarOpen(false)}
                end
              />
              <button
                type="button"
                onClick={() => setIsProductDefinitionsOpen((value) => !value)}
                aria-expanded={isProductDefinitionsOpen}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <Settings02Icon size={20} />
                <span className="flex-1 text-start">{te("nav.stockDefinitions")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isProductDefinitionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isProductDefinitionsOpen ? (
                <div className="ms-5 mt-1 space-y-1 border-s border-slate-200 ps-3 dark:border-white/10">
                  {productDefinitionLinks.map((item) => (
                    <NavLink
                      key={item.type}
                      to={`/products/definitions/${item.type}`}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-xs transition ${isActive ? "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`
                      }
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
        </MenuSection>
        <div className="space-y-2">
              <MenuSection
                title={te("nav.warehouseSection")}
                open={isWarehouseOpen}
                toggle={() => setIsWarehouseOpen((v) => !v)}
              >
                <SmallSidebarLink
                  title={te("nav.warehouses")}
                  href="/warehouses"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.locations")}
                  href="/warehouses/locations"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.balances")}
                  href="/inventory/balances"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.movements")}
                  href="/inventory/transactions"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.counting")}
                  href="/inventory-counts"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.inventoryCountParameters", { defaultValue: "Sayım ve Stok Düzeltme Parametreleri" })}
                  href="/inventory-counts/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.inventoryTraceabilityParameters", { defaultValue: "Lot, Seri ve SKT Parametreleri" })}
                  href="/inventory/tracking-parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
              </MenuSection>
              <MenuSection title={te("nav.foreignTrade",{defaultValue:"Dış Ticaret"})} open={isTradeOpen} toggle={()=>setIsTradeOpen(v=>!v)}>
                <SmallSidebarLink title={te("nav.tradeDossiers",{defaultValue:"İthalat / İhracat Dosyaları"})} href="/trade-dossiers" close={()=>setIsMobileSidebarOpen(false)}/>
                <SmallSidebarLink title={te("nav.importDossiers",{defaultValue:"İthalat Maliyetlendirme"})} href="/import-dossiers" close={()=>setIsMobileSidebarOpen(false)}/>
                <SmallSidebarLink title={te("nav.landedCostTypes",{defaultValue:"İthalat Masraf Tanımları"})} href="/import-dossiers/definitions/cost-types" close={()=>setIsMobileSidebarOpen(false)}/>
              </MenuSection>
              <MenuSection
                title={te("nav.purchasing")}
                open={isProcurementOpen}
                toggle={() => setIsProcurementOpen((v) => !v)}
              >
                <SmallSidebarLink
                  title={te("nav.purchaseOrders")}
                  href="/purchase-orders"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.procurementParameters", { defaultValue: "Satın Alma Parametreleri" })}
                  href="/purchase-orders/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.purchaseNumberSeries", { defaultValue: "Satın Alma Numara Serileri" })} href="/purchase-orders/number-series" close={() => setIsMobileSidebarOpen(false)} />
                <SmallSidebarLink
                  title={te("nav.receipts")}
                  href="/goods-receipts"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.receivingParameters", { defaultValue: "Mal Kabul Parametreleri" })}
                  href="/goods-receipts/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.receivingNumberSeries", { defaultValue: "Mal Kabul Numara Serileri" })} href="/goods-receipts/number-series" close={() => setIsMobileSidebarOpen(false)} />
                <SmallSidebarLink
                  title={te("nav.transfers")}
                  href="/transfer-orders"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.transferParameters", { defaultValue: "Transfer Parametreleri" })}
                  href="/transfer-orders/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.transferNumberSeries", { defaultValue: "Transfer Numara Serileri" })} href="/transfer-orders/number-series" close={() => setIsMobileSidebarOpen(false)} />
              </MenuSection>
              <MenuSection
                title={te("nav.salesShipping")}
                open={isSalesOpen}
                toggle={() => setIsSalesOpen((v) => !v)}
              >
                <SmallSidebarLink
                  title={te("nav.salesOrders")}
                  href="/sales-orders"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.salesOrderParameters", { defaultValue: "Satış Siparişi Parametreleri" })}
                  href="/sales-orders/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.salesNumberSeries", { defaultValue: "Satış Numara Serileri" })} href="/sales-orders/number-series" close={() => setIsMobileSidebarOpen(false)} />
                <SmallSidebarLink
                  title={te("nav.pricing")}
                  href="/pricing/price-lists"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.pricingParameters", { defaultValue: "Fiyatlandırma ve İskonto Parametreleri" })}
                  href="/pricing/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.shipments")}
                  href="/shipments"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.shippingParameters", { defaultValue: "Sevk ve İrsaliye Parametreleri" })}
                  href="/shipments/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.shippingNumberSeries", { defaultValue: "Sevk ve İrsaliye Numara Serileri" })} href="/shipments/number-series" close={() => setIsMobileSidebarOpen(false)} />
              </MenuSection>
              <MenuSection
                title={te("nav.eDocumentAccounting")}
                open={isFinanceOpen}
                toggle={() => setIsFinanceOpen((v) => !v)}
              >
                <SmallSidebarLink
                  title={te("nav.eDocuments")}
                  href="/e-documents"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.eDocumentParameters", { defaultValue: "E-İrsaliye ve E-Fatura Parametreleri" })}
                  href="/e-documents/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink title={te("nav.eDocumentNumberSeries", { defaultValue: "E-Belge Numara Serileri" })} href="/e-documents/number-series" close={() => setIsMobileSidebarOpen(false)} />
                <SmallSidebarLink
                  title={te("nav.chartOfAccounts")}
                  href="/accounting/accounts"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.journals")}
                  href="/accounting/journals"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <SmallSidebarLink
                  title={te("nav.accountingParameters", { defaultValue: "Muhasebe ve Maliyetlendirme Parametreleri" })}
                  href="/accounting/parameters"
                  close={() => setIsMobileSidebarOpen(false)}
                />
                <div className="crm-ms-2">
                  <MenuSection
                    title={te("nav.accountingDefinitions", { defaultValue: "Muhasebe Tanımları" })}
                    open={isAccountingDefinitionsOpen}
                    toggle={() => setIsAccountingDefinitionsOpen((value) => !value)}
                  >
                    <SmallSidebarLink
                      title={te("nav.fiscalPeriods", { defaultValue: "Mali Dönemler" })}
                      href="/accounting/definitions/fiscal-periods"
                      close={() => setIsMobileSidebarOpen(false)}
                    />
                    <SmallSidebarLink
                      title={te("nav.inventoryPostingProfiles", { defaultValue: "Stok Muhasebe Profilleri" })}
                      href="/accounting/definitions/inventory-posting-profiles"
                      close={() => setIsMobileSidebarOpen(false)}
                    />
                  </MenuSection>
                </div>
              </MenuSection>
        </div>
        <MenuSection
          title={te("nav.systemManagement")}
          open={isSystemOpen}
          toggle={() => setIsSystemOpen((value) => !value)}
        >
            <SmallSidebarLink
              title={te("nav.users")}
              href="/user-management"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.smtp")}
              href="/users/mail-settings"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.permissionGroups")}
              href="/access-control/permission-groups"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("generalSettings.title", { defaultValue: "Genel Ayarlar" })}
              href="/settings/system-settings"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.userPermissions")}
              href="/access-control/user-group-assignments"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.visibilityPolicies")}
              href="/access-control/visibility-policies"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.userVisibility")}
              href="/access-control/user-visibility-assignments"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.permissionSimulator")}
              href="/access-control/visibility-simulator"
              close={() => setIsMobileSidebarOpen(false)}
            />
            <SmallSidebarLink
              title={te("nav.auditLogs")}
              href="/access-control/audit-logs"
              close={() => setIsMobileSidebarOpen(false)}
            />
        </MenuSection>
      </nav>

      <div className="mt-auto rounded-xl border border-slate-200 p-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
        {branchDisplayName}
      </div>
    </>
  );

  return (
    <div className="metivon-shell metivon-app-shell flex min-h-dvh">
      <aside className="metivon-panel metivon-app-sidebar hidden w-72 shrink-0 border-e p-5 lg:flex lg:flex-col">
        {sidebarContent()}
      </aside>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={tc("common.close", { defaultValue: "Kapat" })}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="metivon-panel absolute inset-y-0 start-0 flex w-[min(20rem,88vw)] flex-col border-e p-5 shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="metivon-panel metivon-app-header flex h-18 items-center justify-between border-b px-4 backdrop-blur-xl md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={tc("sidebar.openMenu", { defaultValue: "Menüyü aç" })}
              aria-expanded={isMobileSidebarOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <SidebarLeft01Icon size={21} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                V3RII Metivon
              </div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {branchDisplayName}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <ExchangeRateHeader />
            <button
              type="button"
              aria-label={tc("profile.title", { defaultValue: "Profil ve ayarlar" })}
              className="metivon-panel flex items-center gap-3 rounded-2xl border p-1.5 pe-3 text-start shadow-sm transition hover:border-[var(--crm-brand-ring)] hover:bg-[var(--crm-brand-soft)]"
              onClick={() => setIsUserProfileOpen(true)}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-black text-white">
                {userDetail?.profilePictureUrl ? (
                  <img src={getImageUrl(userDetail.profilePictureUrl) || ""} alt={displayName} className="h-full w-full object-cover" />
                ) : displayInitials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-40 truncate text-sm font-semibold">{displayName}</span>
                <span className="block max-w-40 truncate text-[11px] text-slate-500 dark:text-slate-400">{branchDisplayName}</span>
              </span>
            </button>
          </div>
        </header>
        <main className="metivon-app-content min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-7">
          <RouteNamespaceLoader>
            <Outlet />
          </RouteNamespaceLoader>
        </main>
      </div>
      <UserProfileModal
        open={isUserProfileOpen}
        onOpenChange={setIsUserProfileOpen}
        onOpenProfileDetails={() => {
          setIsUserProfileOpen(false);
          navigate("/profile");
        }}
      />
    </div>
  );
}

function SidebarLink({
  title,
  href,
  icon,
  close,
  end = false,
}: {
  title: string;
  href: string;
  icon: ReactElement;
  close: () => void;
  end?: boolean;
}): ReactElement {
  return (
    <NavLink
      data-sidebar-title={title}
      to={href}
      end={end}
      onClick={close}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-[var(--crm-brand-primary)] text-[var(--crm-brand-on-primary)] shadow-md shadow-[var(--crm-brand-shadow)]" : "text-muted-foreground hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)]"}`
      }
    >
      {icon}
      <span>{title}</span>
    </NavLink>
  );
}
function MenuSection({
  title,
  open,
  toggle,
  children,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div className="metivon-panel rounded-xl border p-1">
      <button
        data-sidebar-title={title}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="metivon-brand flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[var(--crm-brand-soft)]"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="space-y-1 border-t border-slate-200/70 pt-1 dark:border-white/10">
          {children}
        </div>
      ) : null}
    </div>
  );
}
function SmallSidebarLink({
  title,
  href,
  close,
}: {
  title: string;
  href: string;
  close: () => void;
}): ReactElement {
  return (
    <NavLink
      data-sidebar-title={title}
      to={href}
      onClick={close}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-xs transition ${isActive ? "bg-[var(--crm-brand-soft)] font-semibold text-[var(--crm-brand-text)]" : "text-muted-foreground hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)]"}`
      }
    >
      {title}
    </NavLink>
  );
}
