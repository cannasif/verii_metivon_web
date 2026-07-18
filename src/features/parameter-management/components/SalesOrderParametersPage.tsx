import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Hash,
  PackageCheck,
  Save,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberFormatBuilder } from "@/components/shared/NumberFormatBuilder";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
type Envelope<T> = {
  data: T;
};
type Parameters = {
  branchId: number | null;
  warehouseId: number | null;
  isAutomatic: boolean;
  allowManual: boolean;
  format: string;
  nextNumber: number;
  incrementBy: number;
  minimumNumber: number;
  maximumNumber: number;
  requireApprovalBeforeConfirmation: boolean;
  autoApproveOnCreate: boolean;
  requireRequestedShipmentDate: boolean;
  defaultShipmentLeadTimeDays: number;
  allowPastOrderDate: boolean;
  requireCustomerReference: boolean;
  requireActiveCustomer: boolean;
  maximumLinesPerOrder: number;
  allowManualPrice: boolean;
  allowZeroPrice: boolean;
  maximumDiscountPercent: number;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
  reserveInventoryOnConfirmation: boolean;
  requireFullReservation: boolean;
  preview: string;
};
const titles: Record<string, string[]> = {
  tr: [
    "Satış Siparişi Parametreleri",
    "Satış ve Sevkiyat",
    "Sipariş numarası, müşteri, fiyatlandırma ve stok rezervasyon kurallarını yönetin.",
    "Parametre kapsamı",
    "Tüm satış depoları",
    "Depo ara...",
  ],
  en: [
    "Sales Order Parameters",
    "Sales and Shipping",
    "Manage order numbering, customer, pricing and stock reservation rules.",
    "Parameter scope",
    "All sales warehouses",
    "Search warehouse...",
  ],
  de: [
    "Verkaufsauftragsparameter",
    "Verkauf und Versand",
    "Nummerierung, Kunden-, Preis- und Reservierungsregeln verwalten.",
    "Parameterumfang",
    "Alle Verkaufslager",
    "Lager suchen...",
  ],
  fr: [
    "Paramètres des commandes client",
    "Ventes et expédition",
    "Gérez la numérotation, les clients, les prix et les réservations de stock.",
    "Portée",
    "Tous les entrepôts de vente",
    "Rechercher un entrepôt...",
  ],
  es: [
    "Parámetros de pedidos de venta",
    "Ventas y envíos",
    "Gestione numeración, clientes, precios y reservas de stock.",
    "Ámbito",
    "Todos los almacenes de venta",
    "Buscar almacén...",
  ],
  it: [
    "Parametri ordini di vendita",
    "Vendite e spedizioni",
    "Gestisci numerazione, clienti, prezzi e prenotazioni di magazzino.",
    "Ambito",
    "Tutti i magazzini vendita",
    "Cerca magazzino...",
  ],
  pt: [
    "Parâmetros de pedidos de venda",
    "Vendas e expedição",
    "Gerencie numeração, clientes, preços e reservas de estoque.",
    "Escopo",
    "Todos os armazéns de vendas",
    "Pesquisar armazém...",
  ],
  nl: [
    "Verkooporderparameters",
    "Verkoop en verzending",
    "Beheer nummering, klanten, prijzen en voorraadreserveringen.",
    "Bereik",
    "Alle verkoopmagazijnen",
    "Magazijn zoeken...",
  ],
  pl: [
    "Parametry zamówień sprzedaży",
    "Sprzedaż i wysyłka",
    "Zarządzaj numeracją, klientami, cenami i rezerwacją zapasów.",
    "Zakres",
    "Wszystkie magazyny sprzedaży",
    "Szukaj magazynu...",
  ],
  ru: [
    "Параметры заказов клиентов",
    "Продажи и отгрузка",
    "Управляйте нумерацией, клиентами, ценами и резервированием запасов.",
    "Область",
    "Все склады продаж",
    "Поиск склада...",
  ],
  ar: [
    "معلمات أوامر البيع",
    "المبيعات والشحن",
    "إدارة ترقيم الطلبات والعملاء والتسعير وحجز المخزون.",
    "نطاق المعلمات",
    "جميع مستودعات المبيعات",
    "البحث عن مستودع...",
  ],
  fa: [
    "پارامترهای سفارش فروش",
    "فروش و ارسال",
    "شماره‌گذاری، مشتریان، قیمت‌گذاری و رزرو موجودی را مدیریت کنید.",
    "دامنه پارامتر",
    "همه انبارهای فروش",
    "جستجوی انبار...",
  ],
  ja: [
    "受注パラメータ",
    "販売・出荷",
    "注文番号、顧客、価格、在庫引当ルールを管理します。",
    "適用範囲",
    "すべての販売倉庫",
    "倉庫を検索...",
  ],
  ko: [
    "판매 주문 매개변수",
    "판매 및 출하",
    "주문 번호, 고객, 가격 및 재고 예약 규칙을 관리합니다.",
    "매개변수 범위",
    "모든 판매 창고",
    "창고 검색...",
  ],
  zh: [
    "销售订单参数",
    "销售与发运",
    "管理订单编号、客户、定价和库存预留规则。",
    "参数范围",
    "所有销售仓库",
    "搜索仓库...",
  ],
};
export function SalesOrderParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["sales-order-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/sales-orders",
        { params: { branchId, warehouseId } },
      );
      return r.data;
    },
  });
  const [form, setForm] = useState<Parameters | null>(null);
  useEffect(() => {
    if (query.data) setForm({ ...query.data, branchId, warehouseId });
  }, [query.data, branchId, warehouseId]);
  const set = <K extends keyof Parameters>(k: K, v: Parameters[K]) =>
    setForm((x) => (x ? { ...x, [k]: v } : x));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const r = await api.put<Envelope<Parameters>>(
        "/api/parameters/sales-orders",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["sales-order-parameters"] });
      toast.success(
        te("salesOrderParameters.saved", {
          defaultValue: "Satış siparişi parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : te("salesOrderParameters.saveError", {
              defaultValue: "Parametreler kaydedilemedi.",
            }),
      );
    } finally {
      setSaving(false);
    }
  };
  if (query.isLoading || !form)
    return <div className="metivon-panel rounded-3xl p-8">...</div>;
  if (query.isError)
    return (
      <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700">
        {te("salesOrderParameters.loadError", {
          defaultValue: "Satış siparişi parametreleri yüklenemedi.",
        })}
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="metivon-hero rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/65">
              {tx[1]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{tx[0]}</h1>
            <p className="mt-2 max-w-3xl text-white/75">{tx[2]}</p>
          </div>
          <Button
            type="submit"
            className="bg-white text-violet-950 hover:bg-white/90"
            disabled={saving}
          >
            <Save />
            {saving ? tc("common.saving") : tc("common.save")}
          </Button>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel icon={<ShoppingBag />} title={tx[3]}>
          <p className="text-sm text-muted-foreground">{branch?.name ?? "-"}</p>
          <div className="mt-4">
            <Label>
              {te("fields.warehouseId", { defaultValue: "Satış deposu" })}
            </Label>
            <div className="mt-2">
              <ErpLookupCombobox
                lookupKey="warehouses"
                value={String(warehouseId ?? "")}
                fallbackOptions={[]}
                placeholder={tx[4]}
                searchPlaceholder={tx[5]}
                onChange={(v) => setWarehouseId(v === "" ? null : v)}
              />
            </div>
          </div>
        </Panel>
        <Panel
          icon={<Hash />}
          title={te("salesOrderParameters.numbering", {
            defaultValue: "Sipariş numarası",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("parameters.autoNumber", {
                defaultValue: "Otomatik üret",
              })}
              checked={form.isAutomatic}
              onChange={(v) => set("isAutomatic", v)}
            />
            <Toggle
              label={te("parameters.manualNumber", {
                defaultValue: "Manuel numaraya izin ver",
              })}
              checked={form.allowManual}
              onChange={(v) => set("allowManual", v)}
            />
            <div className="sm:col-span-2">
              <NumberFormatBuilder value={form.format} onChange={(value) => set("format", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.nextNumber} />
            </div>
            <Num
              label={te("parameters.nextNumber", {
                defaultValue: "Sonraki numara",
              })}
              value={form.nextNumber}
              onChange={(v) => set("nextNumber", v)}
            />
            <Num
              label={te("parameters.increment", { defaultValue: "Artış" })}
              value={form.incrementBy}
              onChange={(v) => set("incrementBy", v)}
            />
            <Num
              label={te("parameters.minimum", { defaultValue: "Alt sınır" })}
              value={form.minimumNumber}
              onChange={(v) => set("minimumNumber", v)}
            />
            <Num
              label={te("parameters.maximum", { defaultValue: "Üst sınır" })}
              value={form.maximumNumber}
              onChange={(v) => set("maximumNumber", v)}
            />
          </div>
          <div className="metivon-brand-soft mt-4 rounded-2xl border p-3 font-mono font-bold">
            {form.preview}
          </div>
        </Panel>
        <Panel
          icon={<CalendarClock />}
          title={te("salesOrderParameters.documentRules", {
            defaultValue: "Teslim ve belge kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("salesOrderParameters.shipmentDate", {
                defaultValue: "Talep edilen sevk tarihi zorunlu",
              })}
              checked={form.requireRequestedShipmentDate}
              onChange={(v) => set("requireRequestedShipmentDate", v)}
            />
            <Toggle
              label={te("salesOrderParameters.pastDate", {
                defaultValue: "Geçmiş sipariş tarihine izin ver",
              })}
              checked={form.allowPastOrderDate}
              onChange={(v) => set("allowPastOrderDate", v)}
            />
            <Toggle
              label={te("salesOrderParameters.customerRef", {
                defaultValue: "Müşteri referansı zorunlu",
              })}
              checked={form.requireCustomerReference}
              onChange={(v) => set("requireCustomerReference", v)}
            />
            <Toggle
              label={te("salesOrderParameters.activeCustomer", {
                defaultValue: "Aktif müşteri zorunlu",
              })}
              checked={form.requireActiveCustomer}
              onChange={(v) => set("requireActiveCustomer", v)}
            />
            <Num
              label={te("salesOrderParameters.leadTime", {
                defaultValue: "Varsayılan sevk süresi (gün)",
              })}
              value={form.defaultShipmentLeadTimeDays}
              onChange={(v) => set("defaultShipmentLeadTimeDays", v)}
            />
            <Num
              label={te("salesOrderParameters.maxLines", {
                defaultValue: "Maksimum sipariş satırı",
              })}
              value={form.maximumLinesPerOrder}
              onChange={(v) => set("maximumLinesPerOrder", v)}
            />
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          icon={<ShieldCheck />}
          title={te("salesOrderParameters.approval", {
            defaultValue: "Onay kuralları",
          })}
        >
          <div className="grid gap-3">
            <Toggle
              label={te("salesOrderParameters.requireApproval", {
                defaultValue: "Kesinleştirme öncesi onay zorunlu",
              })}
              checked={form.requireApprovalBeforeConfirmation}
              onChange={(v) => set("requireApprovalBeforeConfirmation", v)}
            />
            <Toggle
              label={te("salesOrderParameters.autoApprove", {
                defaultValue: "Oluştururken otomatik onayla",
              })}
              checked={form.autoApproveOnCreate}
              onChange={(v) => set("autoApproveOnCreate", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<BadgeDollarSign />}
          title={te("salesOrderParameters.commercial", {
            defaultValue: "Fiyat ve tutar kontrolleri",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("salesOrderParameters.manualPrice", {
                defaultValue: "Manuel satış fiyatına izin ver",
              })}
              checked={form.allowManualPrice}
              onChange={(v) => set("allowManualPrice", v)}
            />
            <Toggle
              label={te("salesOrderParameters.zeroPrice", {
                defaultValue: "Sıfır fiyatlı satıra izin ver",
              })}
              checked={form.allowZeroPrice}
              onChange={(v) => set("allowZeroPrice", v)}
            />
            <Num
              label={te("salesOrderParameters.maxDiscount", {
                defaultValue: "Maksimum iskonto (%)",
              })}
              value={form.maximumDiscountPercent}
              onChange={(v) => set("maximumDiscountPercent", v)}
            />
            <Num
              label={te("salesOrderParameters.minAmount", {
                defaultValue: "Minimum sipariş tutarı",
              })}
              value={form.minimumOrderAmount}
              onChange={(v) => set("minimumOrderAmount", v)}
            />
            <Num
              label={te("salesOrderParameters.maxAmount", {
                defaultValue: "Maksimum sipariş tutarı (0: sınırsız)",
              })}
              value={form.maximumOrderAmount}
              onChange={(v) => set("maximumOrderAmount", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<PackageCheck />}
          title={te("salesOrderParameters.reservation", {
            defaultValue: "Stok rezervasyon kuralları",
          })}
        >
          <div className="grid gap-3">
            <Toggle
              label={te("salesOrderParameters.reserveOnConfirm", {
                defaultValue: "Kesinleştirmede stoğu rezerve et",
              })}
              checked={form.reserveInventoryOnConfirmation}
              onChange={(v) => set("reserveInventoryOnConfirmation", v)}
            />
            <Toggle
              label={te("salesOrderParameters.fullReservation", {
                defaultValue: "Tam rezervasyon zorunlu",
              })}
              checked={form.requireFullReservation}
              onChange={(v) => set("requireFullReservation", v)}
            />
          </div>
        </Panel>
      </div>
    </form>
  );
}
function Panel({
  icon,
  title,
  children,
}: {
  icon: ReactElement;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="metivon-panel rounded-3xl border p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="metivon-brand-soft grid h-10 w-10 place-items-center rounded-xl">
          {icon}
        </span>
        {title}
      </div>
      {children}
    </section>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-4">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <CheckCircle2
        className={`h-4 w-4 ${checked ? "text-[var(--crm-brand-primary)]" : "text-muted-foreground"}`}
      />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
