import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ClipboardCheck,
  Hash,
  PackageCheck,
  Save,
  Tags,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberFormatBuilder } from "@/components/shared/NumberFormatBuilder";
import { useAuthStore } from "@/stores/auth-store";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
interface Parameters {
  branchId: number | null;
  warehouseId: number | null;
  isAutomatic: boolean;
  allowManual: boolean;
  format: string;
  nextNumber: number;
  incrementBy: number;
  minimumNumber: number;
  maximumNumber: number;
  isContinuous: boolean;
  requirePurchaseOrder: boolean;
  allowFreeReceipt: boolean;
  allowPartialReceipt: boolean;
  overDeliveryTolerancePercent: number;
  underDeliveryTolerancePercent: number;
  requireSupplierDeliveryNoteNumber: boolean;
  requireLotNumberForLotTracked: boolean;
  requireSerialsForSerialTracked: boolean;
  requireExpiryDateForTrackedItems: boolean;
  minimumRemainingShelfLifeDays: number;
  requireQualityInspection: boolean;
  autoCreateLabels: boolean;
  defaultLabelCopies: number;
  inventoryCurrencyId: number;
  inventoryCurrencyCode: string;
  preview: string;
}
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
const pageTitles: Record<
  string,
  [string, string, string, string, string, string, string]
> = {
  tr: [
    "Mal Kabul Parametreleri",
    "Satın Alma",
    "Mal kabul numarası, sipariş toleransları, izlenebilirlik ve etiket kurallarını yönetin.",
    "Parametre kapsamı",
    "Tüm depolar",
    "Aktif şube",
    "Depo ara...",
  ],
  en: [
    "Goods Receipt Parameters",
    "Purchasing",
    "Manage receipt numbering, order tolerances, traceability and label rules.",
    "Parameter scope",
    "All warehouses",
    "Active branch",
    "Search warehouses...",
  ],
  de: [
    "Wareneingangsparameter",
    "Einkauf",
    "Nummerierung, Toleranzen, Rückverfolgbarkeit und Etikettenregeln verwalten.",
    "Parameterbereich",
    "Alle Lager",
    "Aktive Niederlassung",
    "Lager suchen...",
  ],
  fr: [
    "Paramètres de réception",
    "Achats",
    "Gérez la numérotation, les tolérances, la traçabilité et les étiquettes.",
    "Portée des paramètres",
    "Tous les entrepôts",
    "Agence active",
    "Rechercher un entrepôt...",
  ],
  es: [
    "Parámetros de recepción",
    "Compras",
    "Gestione numeración, tolerancias, trazabilidad y etiquetas.",
    "Ámbito",
    "Todos los almacenes",
    "Sucursal activa",
    "Buscar almacenes...",
  ],
  it: [
    "Parametri ricevimento merci",
    "Acquisti",
    "Gestisci numerazione, tolleranze, tracciabilità ed etichette.",
    "Ambito",
    "Tutti i magazzini",
    "Filiale attiva",
    "Cerca magazzini...",
  ],
  pt: [
    "Parâmetros de recebimento",
    "Compras",
    "Gerencie numeração, tolerâncias, rastreabilidade e etiquetas.",
    "Escopo",
    "Todos os armazéns",
    "Filial ativa",
    "Pesquisar armazéns...",
  ],
  nl: [
    "Goederenontvangstparameters",
    "Inkoop",
    "Beheer nummering, toleranties, traceerbaarheid en labels.",
    "Parameterbereik",
    "Alle magazijnen",
    "Actieve vestiging",
    "Magazijnen zoeken...",
  ],
  pl: [
    "Parametry przyjęcia towaru",
    "Zakupy",
    "Zarządzaj numeracją, tolerancjami, identyfikowalnością i etykietami.",
    "Zakres",
    "Wszystkie magazyny",
    "Aktywny oddział",
    "Szukaj magazynu...",
  ],
  ru: [
    "Параметры приемки товара",
    "Закупки",
    "Управляйте нумерацией, допусками, прослеживаемостью и этикетками.",
    "Область параметров",
    "Все склады",
    "Активный филиал",
    "Поиск склада...",
  ],
  ar: [
    "معلمات استلام البضائع",
    "المشتريات",
    "إدارة الترقيم والتفاوت والتتبع وقواعد الملصقات.",
    "نطاق المعلمات",
    "كل المستودعات",
    "الفرع النشط",
    "البحث في المستودعات...",
  ],
  fa: [
    "پارامترهای دریافت کالا",
    "خرید",
    "شماره‌گذاری، تلرانس، رهگیری و برچسب‌ها را مدیریت کنید.",
    "دامنه پارامتر",
    "همه انبارها",
    "شعبه فعال",
    "جستجوی انبار...",
  ],
  ja: [
    "入庫パラメータ",
    "購買",
    "採番、許容差、トレーサビリティ、ラベル規則を管理します。",
    "適用範囲",
    "すべての倉庫",
    "現在の支店",
    "倉庫を検索...",
  ],
  ko: [
    "입고 매개변수",
    "구매",
    "번호 지정, 허용 오차, 추적성 및 라벨 규칙을 관리합니다.",
    "매개변수 범위",
    "모든 창고",
    "활성 지점",
    "창고 검색...",
  ],
  zh: [
    "收货参数",
    "采购",
    "管理收货编号、订单容差、可追溯性和标签规则。",
    "参数范围",
    "所有仓库",
    "当前分支",
    "搜索仓库...",
  ],
};
export function ReceivingParametersPage(): ReactElement {
  const { i18n, t: te } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const lang = i18n.language.split("-")[0];
  const tx = pageTitles[lang] ?? pageTitles.en;
  const branch = useAuthStore((s) => s.branch);
  const client = useQueryClient();
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const branchId = Number(branch?.id ?? 0) || null;
  const query = useQuery({
    queryKey: ["receiving-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/receiving",
        { params: { branchId, warehouseId } },
      );
      return r.data;
    },
  });
  const [form, setForm] = useState<Parameters | null>(null);
  useEffect(() => {
    if (query.data) setForm({ ...query.data, branchId, warehouseId });
  }, [query.data, branchId, warehouseId]);
  const set = <K extends keyof Parameters>(key: K, value: Parameters[K]) =>
    setForm((v) => (v ? { ...v, [key]: value } : v));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const r = await api.put<Envelope<Parameters>>(
        "/api/parameters/receiving",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["receiving-parameters"] });
      toast.success(
        te("receivingParameters.saved", {
          defaultValue: "Mal kabul parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : te("receivingParameters.saveError", {
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
        {te("receivingParameters.loadError", {
          defaultValue: "Mal kabul parametreleri yüklenemedi.",
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
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Panel icon={<PackageCheck />} title={tx[3]}>
          <p className="text-sm text-muted-foreground">
            {tx[5]} · {branch?.name ?? "-"}
          </p>
          <div className="mt-4">
            <Label>{te("fields.warehouseId", { defaultValue: "Depo" })}</Label>
            <div className="mt-2">
              <ErpLookupCombobox
                lookupKey="warehouses"
                value={String(warehouseId ?? "")}
                fallbackOptions={[]}
                placeholder={tx[4]}
                searchPlaceholder={tx[6]}
                onChange={(v) => setWarehouseId(v === "" ? null : v)}
              />
            </div>
          </div>
          <div className="metivon-brand-soft mt-5 rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {te("receivingParameters.preview", {
                defaultValue: "Sonraki fiş önizlemesi",
              })}
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold">
              {form.preview}
            </p>
          </div>
        </Panel>
        <Panel
          icon={<Hash />}
          title={te("receivingParameters.numbering", {
            defaultValue: "Fiş numarası ve seri",
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle
              label={te("receivingParameters.automatic", {
                defaultValue: "Fiş numarasını otomatik üret",
              })}
              checked={form.isAutomatic}
              onChange={(v) => set("isAutomatic", v)}
            />
            <Toggle
              label={te("receivingParameters.manual", {
                defaultValue: "Manuel fiş numarasına izin ver",
              })}
              checked={form.allowManual}
              onChange={(v) => set("allowManual", v)}
            />
            <div className="md:col-span-2">
              <NumberFormatBuilder value={form.format} onChange={(value) => set("format", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.nextNumber} />
            </div>
            <NumberField
              label={te("receivingParameters.next", {
                defaultValue: "Sonraki numara",
              })}
              value={form.nextNumber}
              onChange={(v) => set("nextNumber", v)}
            />
            <NumberField
              label={te("receivingParameters.increment", {
                defaultValue: "Artış",
              })}
              value={form.incrementBy}
              onChange={(v) => set("incrementBy", v)}
            />
            <NumberField
              label={te("receivingParameters.minimum", {
                defaultValue: "Alt sınır",
              })}
              value={form.minimumNumber}
              onChange={(v) => set("minimumNumber", v)}
            />
            <NumberField
              label={te("receivingParameters.maximum", {
                defaultValue: "Üst sınır",
              })}
              value={form.maximumNumber}
              onChange={(v) => set("maximumNumber", v)}
            />
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          icon={<ClipboardCheck />}
          title={te("receivingParameters.processRules", {
            defaultValue: "Sipariş ve kabul kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("receivingParameters.requirePo", {
                defaultValue: "Satın alma siparişi zorunlu",
              })}
              checked={form.requirePurchaseOrder}
              onChange={(v) => set("requirePurchaseOrder", v)}
            />
            <Toggle
              label={te("receivingParameters.allowFree", {
                defaultValue: "Serbest mal kabule izin ver",
              })}
              checked={form.allowFreeReceipt}
              onChange={(v) => set("allowFreeReceipt", v)}
            />
            <Toggle
              label={te("receivingParameters.allowPartial", {
                defaultValue: "Kısmi kabule izin ver",
              })}
              checked={form.allowPartialReceipt}
              onChange={(v) => set("allowPartialReceipt", v)}
            />
            <Toggle
              label={te("receivingParameters.requireNote", {
                defaultValue: "Tedarikçi irsaliye no zorunlu",
              })}
              checked={form.requireSupplierDeliveryNoteNumber}
              onChange={(v) => set("requireSupplierDeliveryNoteNumber", v)}
            />
            <Toggle
              label={te("status.QualityInspection", {
                defaultValue: "Kalite kontrol zorunlu",
              })}
              checked={form.requireQualityInspection}
              onChange={(v) => set("requireQualityInspection", v)}
            />
            <NumberField
              label={te("receivingParameters.overTolerance", {
                defaultValue: "Fazla kabul toleransı %",
              })}
              value={form.overDeliveryTolerancePercent}
              onChange={(v) => set("overDeliveryTolerancePercent", v)}
            />
            <NumberField
              label={te("receivingParameters.underTolerance", {
                defaultValue: "Eksik kabul toleransı %",
              })}
              value={form.underDeliveryTolerancePercent}
              onChange={(v) => set("underDeliveryTolerancePercent", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<Tags />}
          title={te("receivingParameters.traceability", {
            defaultValue: "Lot, seri, SKT ve etiket",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("receivingParameters.requireLot", {
                defaultValue: "Lot takipli üründe lot zorunlu",
              })}
              checked={form.requireLotNumberForLotTracked}
              onChange={(v) => set("requireLotNumberForLotTracked", v)}
            />
            <Toggle
              label={te("receivingParameters.requireSerial", {
                defaultValue: "Seri takipli üründe seri zorunlu",
              })}
              checked={form.requireSerialsForSerialTracked}
              onChange={(v) => set("requireSerialsForSerialTracked", v)}
            />
            <Toggle
              label={te("receivingParameters.requireExpiry", {
                defaultValue: "Takipli üründe SKT zorunlu",
              })}
              checked={form.requireExpiryDateForTrackedItems}
              onChange={(v) => set("requireExpiryDateForTrackedItems", v)}
            />
            <Toggle
              label={te("receivingParameters.autoLabels", {
                defaultValue: "Post sonrası etiketi hazırla",
              })}
              checked={form.autoCreateLabels}
              onChange={(v) => set("autoCreateLabels", v)}
            />
            <NumberField
              label={te("receivingParameters.minimumShelf", {
                defaultValue: "Minimum kalan raf ömrü (gün)",
              })}
              value={form.minimumRemainingShelfLifeDays}
              onChange={(v) => set("minimumRemainingShelfLifeDays", v)}
            />
            <NumberField
              label={te("receivingParameters.labelCopies", {
                defaultValue: "Varsayılan etiket adedi",
              })}
              value={form.defaultLabelCopies}
              onChange={(v) => set("defaultLabelCopies", v)}
            />
            <Field
              label={te("fields.currencyCode", {
                defaultValue: "Stok para birimi",
              })}
            >
              <ErpLookupCombobox lookupKey="currencies" value={String(form.inventoryCurrencyId || "")} fallbackOptions={[]} placeholder="Para birimi seçin" searchPlaceholder="Para birimlerinde ara..." onChange={(value) => set("inventoryCurrencyId", Number(value) || 0)} />
            </Field>
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
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function NumberField({
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
