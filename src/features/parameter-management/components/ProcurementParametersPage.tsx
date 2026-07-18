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
  Save,
  ShieldCheck,
  ShoppingCart,
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
  requireRequestedDeliveryDate: boolean;
  defaultLeadTimeDays: number;
  allowPastOrderDate: boolean;
  requireSupplierReference: boolean;
  requireBuyerNote: boolean;
  defaultOverDeliveryTolerancePercent: number;
  defaultUnderDeliveryTolerancePercent: number;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
  maximumLinesPerOrder: number;
  allowZeroPrice: boolean;
  allowDiscount: boolean;
  maximumDiscountPercent: number;
  requireActiveSupplier: boolean;
  preview: string;
};
const titles: Record<string, string[]> = {
  tr: [
    "Satın Alma Parametreleri",
    "Satın Alma",
    "Sipariş numarası, onay, teslim ve ticari kontrol kurallarını yönetin.",
    "Parametre kapsamı",
    "Tüm satın alma depoları",
    "Depo ara...",
  ],
  en: [
    "Procurement Parameters",
    "Procurement",
    "Manage order numbering, approval, delivery and commercial control rules.",
    "Parameter scope",
    "All procurement warehouses",
    "Search warehouse...",
  ],
  de: [
    "Beschaffungsparameter",
    "Beschaffung",
    "Nummerierung, Freigabe, Lieferung und kaufmännische Regeln verwalten.",
    "Parameterumfang",
    "Alle Einkaufslager",
    "Lager suchen...",
  ],
  fr: [
    "Paramètres d'achat",
    "Achats",
    "Gérez la numérotation, les approbations, les livraisons et les règles commerciales.",
    "Portée",
    "Tous les entrepôts",
    "Rechercher un entrepôt...",
  ],
  es: [
    "Parámetros de compras",
    "Compras",
    "Gestione numeración, aprobación, entrega y reglas comerciales.",
    "Ámbito",
    "Todos los almacenes",
    "Buscar almacén...",
  ],
  it: [
    "Parametri acquisti",
    "Acquisti",
    "Gestisci numerazione, approvazione, consegna e regole commerciali.",
    "Ambito",
    "Tutti i magazzini",
    "Cerca magazzino...",
  ],
  pt: [
    "Parâmetros de compras",
    "Compras",
    "Gerencie numeração, aprovação, entrega e regras comerciais.",
    "Escopo",
    "Todos os armazéns",
    "Pesquisar armazém...",
  ],
  nl: [
    "Inkoopparameters",
    "Inkoop",
    "Beheer nummering, goedkeuring, levering en commerciële regels.",
    "Bereik",
    "Alle magazijnen",
    "Magazijn zoeken...",
  ],
  pl: [
    "Parametry zakupów",
    "Zakupy",
    "Zarządzaj numeracją, zatwierdzaniem, dostawą i regułami handlowymi.",
    "Zakres",
    "Wszystkie magazyny",
    "Szukaj magazynu...",
  ],
  ru: [
    "Параметры закупок",
    "Закупки",
    "Управляйте нумерацией, согласованием, поставкой и коммерческими правилами.",
    "Область",
    "Все склады",
    "Поиск склада...",
  ],
  ar: [
    "معلمات المشتريات",
    "المشتريات",
    "إدارة ترقيم الطلبات والموافقات والتسليم والقواعد التجارية.",
    "نطاق المعلمات",
    "جميع مستودعات الشراء",
    "البحث عن مستودع...",
  ],
  fa: [
    "پارامترهای تدارکات",
    "تدارکات",
    "شماره‌گذاری، تأیید، تحویل و قوانین تجاری سفارش را مدیریت کنید.",
    "دامنه پارامتر",
    "همه انبارها",
    "جستجوی انبار...",
  ],
  ja: [
    "購買パラメータ",
    "購買",
    "注文番号、承認、納期、取引ルールを管理します。",
    "適用範囲",
    "すべての購買倉庫",
    "倉庫を検索...",
  ],
  ko: [
    "구매 매개변수",
    "구매",
    "주문 번호, 승인, 납기 및 상거래 규칙을 관리합니다.",
    "매개변수 범위",
    "모든 구매 창고",
    "창고 검색...",
  ],
  zh: [
    "采购参数",
    "采购",
    "管理订单编号、审批、交付和商业控制规则。",
    "参数范围",
    "所有采购仓库",
    "搜索仓库...",
  ],
};
export function ProcurementParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["procurement-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/procurement",
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
        "/api/parameters/procurement",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["procurement-parameters"] });
      toast.success(
        te("procurementParameters.saved", {
          defaultValue: "Satın alma parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : te("procurementParameters.saveError", {
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
        {te("procurementParameters.loadError", {
          defaultValue: "Satın alma parametreleri yüklenemedi.",
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
        <Panel icon={<ShoppingCart />} title={tx[3]}>
          <p className="text-sm text-muted-foreground">{branch?.name ?? "-"}</p>
          <div className="mt-4">
            <Label>
              {te("fields.warehouseId", { defaultValue: "Satın alma deposu" })}
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
          title={te("procurementParameters.numbering", {
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
          title={te("procurementParameters.delivery", {
            defaultValue: "Teslim ve belge kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("procurementParameters.deliveryRequired", {
                defaultValue: "Talep edilen teslim tarihi zorunlu",
              })}
              checked={form.requireRequestedDeliveryDate}
              onChange={(v) => set("requireRequestedDeliveryDate", v)}
            />
            <Toggle
              label={te("procurementParameters.pastDate", {
                defaultValue: "Geçmiş sipariş tarihine izin ver",
              })}
              checked={form.allowPastOrderDate}
              onChange={(v) => set("allowPastOrderDate", v)}
            />
            <Toggle
              label={te("procurementParameters.supplierRef", {
                defaultValue: "Tedarikçi referansı zorunlu",
              })}
              checked={form.requireSupplierReference}
              onChange={(v) => set("requireSupplierReference", v)}
            />
            <Toggle
              label={te("procurementParameters.buyerNote", {
                defaultValue: "Satın almacı notu zorunlu",
              })}
              checked={form.requireBuyerNote}
              onChange={(v) => set("requireBuyerNote", v)}
            />
            <Num
              label={te("procurementParameters.leadTime", {
                defaultValue: "Varsayılan tedarik süresi (gün)",
              })}
              value={form.defaultLeadTimeDays}
              onChange={(v) => set("defaultLeadTimeDays", v)}
            />
            <Num
              label={te("procurementParameters.maxLines", {
                defaultValue: "Maksimum sipariş satırı",
              })}
              value={form.maximumLinesPerOrder}
              onChange={(v) => set("maximumLinesPerOrder", v)}
            />
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          icon={<ShieldCheck />}
          title={te("procurementParameters.approval", {
            defaultValue: "Onay ve tedarikçi kontrolleri",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("procurementParameters.requireApproval", {
                defaultValue: "Kesinleştirme öncesi onay zorunlu",
              })}
              checked={form.requireApprovalBeforeConfirmation}
              onChange={(v) => set("requireApprovalBeforeConfirmation", v)}
            />
            <Toggle
              label={te("procurementParameters.autoApprove", {
                defaultValue: "Oluştururken otomatik onayla",
              })}
              checked={form.autoApproveOnCreate}
              onChange={(v) => set("autoApproveOnCreate", v)}
            />
            <Toggle
              label={te("procurementParameters.activeSupplier", {
                defaultValue: "Aktif tedarikçi zorunlu",
              })}
              checked={form.requireActiveSupplier}
              onChange={(v) => set("requireActiveSupplier", v)}
            />
            <Toggle
              label={te("procurementParameters.zeroPrice", {
                defaultValue: "Sıfır fiyatlı satıra izin ver",
              })}
              checked={form.allowZeroPrice}
              onChange={(v) => set("allowZeroPrice", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<BadgeDollarSign />}
          title={te("procurementParameters.commercial", {
            defaultValue: "Tutar, iskonto ve toleranslar",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("procurementParameters.discount", {
                defaultValue: "İskontoya izin ver",
              })}
              checked={form.allowDiscount}
              onChange={(v) => set("allowDiscount", v)}
            />
            <Num
              label={te("procurementParameters.maxDiscount", {
                defaultValue: "Maksimum iskonto (%)",
              })}
              value={form.maximumDiscountPercent}
              onChange={(v) => set("maximumDiscountPercent", v)}
            />
            <Num
              label={te("procurementParameters.minAmount", {
                defaultValue: "Minimum sipariş tutarı",
              })}
              value={form.minimumOrderAmount}
              onChange={(v) => set("minimumOrderAmount", v)}
            />
            <Num
              label={te("procurementParameters.maxAmount", {
                defaultValue: "Maksimum sipariş tutarı (0: sınırsız)",
              })}
              value={form.maximumOrderAmount}
              onChange={(v) => set("maximumOrderAmount", v)}
            />
            <Num
              label={te("procurementParameters.overTolerance", {
                defaultValue: "Fazla teslim toleransı (%)",
              })}
              value={form.defaultOverDeliveryTolerancePercent}
              onChange={(v) => set("defaultOverDeliveryTolerancePercent", v)}
            />
            <Num
              label={te("procurementParameters.underTolerance", {
                defaultValue: "Eksik teslim toleransı (%)",
              })}
              value={form.defaultUnderDeliveryTolerancePercent}
              onChange={(v) => set("defaultUnderDeliveryTolerancePercent", v)}
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
