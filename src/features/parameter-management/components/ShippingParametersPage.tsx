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
  FileText,
  Hash,
  Save,
  ShieldCheck,
  Truck,
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
  shipmentIsAutomatic: boolean;
  shipmentAllowManual: boolean;
  shipmentFormat: string;
  shipmentNextNumber: number;
  shipmentIncrementBy: number;
  shipmentMinimumNumber: number;
  shipmentMaximumNumber: number;
  deliveryNoteIsAutomatic: boolean;
  deliveryNoteAllowManual: boolean;
  deliveryNoteFormat: string;
  deliveryNoteNextNumber: number;
  deliveryNoteIncrementBy: number;
  deliveryNoteMinimumNumber: number;
  deliveryNoteMaximumNumber: number;
  allowPartialShipment: boolean;
  requireFullReservation: boolean;
  requirePackedBeforeShipment: boolean;
  autoMarkPackedOnCreate: boolean;
  allowPastShipmentDate: boolean;
  requireCarrierName: boolean;
  requireVehiclePlate: boolean;
  requireDriverName: boolean;
  requireTrackingNumber: boolean;
  maximumLinesPerShipment: number;
  requireLotForLotTracked: boolean;
  requireSerialForSerialTracked: boolean;
  autoCreateDeliveryNote: boolean;
  deliveryNoteScenario: string;
  defaultDeliveryNoteStatus: number;
  inventoryCurrencyCode: string;
  shipmentPreview: string;
  deliveryNotePreview: string;
}
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
const titles: Record<string, [string, string, string, string, string, string]> =
  {
    tr: [
      "Sevk ve İrsaliye Parametreleri",
      "Satış ve Sevk",
      "Sevk, stok çıkışı, taşıyıcı bilgileri ve e-İrsaliye hazırlık kurallarını yönetin.",
      "Parametre kapsamı",
      "Tüm sevk depoları",
      "Depo ara...",
    ],
    en: [
      "Shipping & Delivery Note Parameters",
      "Sales & Shipping",
      "Manage shipment, inventory issue, carrier and e-Delivery Note readiness rules.",
      "Parameter scope",
      "All shipping warehouses",
      "Search warehouses...",
    ],
    de: [
      "Versand- und Lieferscheinparameter",
      "Verkauf und Versand",
      "Versand-, Lagerabgangs-, Frachtführer- und E-Lieferscheinregeln verwalten.",
      "Parameterbereich",
      "Alle Versandlager",
      "Lager suchen...",
    ],
    fr: [
      "Paramètres d’expédition et de bon de livraison",
      "Ventes et expédition",
      "Gérez l’expédition, la sortie de stock, le transporteur et l’e-bon.",
      "Portée",
      "Tous les entrepôts d’expédition",
      "Rechercher un entrepôt...",
    ],
    es: [
      "Parámetros de envío y albarán",
      "Ventas y envíos",
      "Gestione envío, salida de stock, transportista y albarán electrónico.",
      "Ámbito",
      "Todos los almacenes de envío",
      "Buscar almacenes...",
    ],
    it: [
      "Parametri spedizione e DDT",
      "Vendite e spedizioni",
      "Gestisci spedizione, uscita scorte, vettore e DDT elettronico.",
      "Ambito",
      "Tutti i magazzini di spedizione",
      "Cerca magazzini...",
    ],
    pt: [
      "Parâmetros de expedição e nota de entrega",
      "Vendas e expedição",
      "Gerencie expedição, saída de estoque, transportadora e documento eletrônico.",
      "Escopo",
      "Todos os armazéns de expedição",
      "Pesquisar armazéns...",
    ],
    nl: [
      "Verzend- en pakbonparameters",
      "Verkoop en verzending",
      "Beheer verzending, voorraaduitgifte, vervoerder en e-pakbon.",
      "Bereik",
      "Alle verzendmagazijnen",
      "Magazijnen zoeken...",
    ],
    pl: [
      "Parametry wysyłki i WZ",
      "Sprzedaż i wysyłka",
      "Zarządzaj wysyłką, rozchodem, przewoźnikiem i e-dokumentem.",
      "Zakres",
      "Wszystkie magazyny wysyłkowe",
      "Szukaj magazynu...",
    ],
    ru: [
      "Параметры отгрузки и накладной",
      "Продажи и отгрузка",
      "Управляйте отгрузкой, списанием, перевозчиком и электронной накладной.",
      "Область",
      "Все склады отгрузки",
      "Поиск склада...",
    ],
    ar: [
      "معلمات الشحن وإشعار التسليم",
      "المبيعات والشحن",
      "إدارة الشحن وصرف المخزون والناقل والإشعار الإلكتروني.",
      "نطاق المعلمات",
      "كل مستودعات الشحن",
      "البحث عن مستودع...",
    ],
    fa: [
      "پارامترهای ارسال و حواله",
      "فروش و ارسال",
      "ارسال، خروج موجودی، حامل و حواله الکترونیکی را مدیریت کنید.",
      "دامنه پارامتر",
      "همه انبارهای ارسال",
      "جستجوی انبار...",
    ],
    ja: [
      "出荷・納品書パラメータ",
      "販売・出荷",
      "出荷、在庫払出、運送会社、電子納品書の規則を管理します。",
      "適用範囲",
      "すべての出荷倉庫",
      "倉庫を検索...",
    ],
    ko: [
      "출하 및 납품서 매개변수",
      "판매 및 출하",
      "출하, 재고 출고, 운송사 및 전자 납품서 규칙을 관리합니다.",
      "매개변수 범위",
      "모든 출하 창고",
      "창고 검색...",
    ],
    zh: [
      "发运与送货单参数",
      "销售与发运",
      "管理发运、库存出库、承运人和电子送货单规则。",
      "参数范围",
      "所有发运仓库",
      "搜索仓库...",
    ],
  };
export function ShippingParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["shipping-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/shipping",
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
        "/api/parameters/shipping",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["shipping-parameters"] });
      toast.success(
        te("shippingParameters.saved", {
          defaultValue: "Sevk parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : te("shippingParameters.saveError", {
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
        {te("shippingParameters.loadError", {
          defaultValue: "Sevk parametreleri yüklenemedi.",
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
        <Panel icon={<Truck />} title={tx[3]}>
          <p className="text-sm text-muted-foreground">{branch?.name ?? "-"}</p>
          <div className="mt-4">
            <Label>
              {te("fields.warehouseId", { defaultValue: "Sevk deposu" })}
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
        <NumberPanel
          title={te("shippingParameters.shipmentNumbering", {
            defaultValue: "Sevk numarası",
          })}
          preview={form.shipmentPreview}
          automatic={form.shipmentIsAutomatic}
          manual={form.shipmentAllowManual}
          format={form.shipmentFormat}
          next={form.shipmentNextNumber}
          increment={form.shipmentIncrementBy}
          minimum={form.shipmentMinimumNumber}
          maximum={form.shipmentMaximumNumber}
          set={(k, v) => set(`shipment${k}` as keyof Parameters, v as never)}
        />
        <NumberPanel
          title={te("shippingParameters.deliveryNumbering", {
            defaultValue: "İrsaliye numarası",
          })}
          preview={form.deliveryNotePreview}
          automatic={form.deliveryNoteIsAutomatic}
          manual={form.deliveryNoteAllowManual}
          format={form.deliveryNoteFormat}
          next={form.deliveryNoteNextNumber}
          increment={form.deliveryNoteIncrementBy}
          minimum={form.deliveryNoteMinimumNumber}
          maximum={form.deliveryNoteMaximumNumber}
          set={(k, v) =>
            set(`deliveryNote${k}` as keyof Parameters, v as never)
          }
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          icon={<ShieldCheck />}
          title={te("shippingParameters.rules", {
            defaultValue: "Sevk ve stok çıkış kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("shippingParameters.partial", {
                defaultValue: "Kısmi sevke izin ver",
              })}
              checked={form.allowPartialShipment}
              onChange={(v) => set("allowPartialShipment", v)}
            />
            <Toggle
              label={te("shippingParameters.reservation", {
                defaultValue: "Tam rezervasyon zorunlu",
              })}
              checked={form.requireFullReservation}
              onChange={(v) => set("requireFullReservation", v)}
            />
            <Toggle
              label={te("shippingParameters.packed", {
                defaultValue: "Sevk öncesi paketleme zorunlu",
              })}
              checked={form.requirePackedBeforeShipment}
              onChange={(v) => set("requirePackedBeforeShipment", v)}
            />
            <Toggle
              label={te("shippingParameters.autoPacked", {
                defaultValue: "Oluştururken paketlendi işaretle",
              })}
              checked={form.autoMarkPackedOnCreate}
              onChange={(v) => set("autoMarkPackedOnCreate", v)}
            />
            <Toggle
              label={te("shippingParameters.pastDate", {
                defaultValue: "Geçmiş sevk tarihine izin ver",
              })}
              checked={form.allowPastShipmentDate}
              onChange={(v) => set("allowPastShipmentDate", v)}
            />
            <Toggle
              label={te("shippingParameters.lot", {
                defaultValue: "Lot takipli üründe lot zorunlu",
              })}
              checked={form.requireLotForLotTracked}
              onChange={(v) => set("requireLotForLotTracked", v)}
            />
            <Toggle
              label={te("shippingParameters.serial", {
                defaultValue: "Seri takipli üründe seri zorunlu",
              })}
              checked={form.requireSerialForSerialTracked}
              onChange={(v) => set("requireSerialForSerialTracked", v)}
            />
            <Num
              label={te("shippingParameters.maxLines", {
                defaultValue: "Maksimum sevk satırı",
              })}
              value={form.maximumLinesPerShipment}
              onChange={(v) => set("maximumLinesPerShipment", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<FileText />}
          title={te("shippingParameters.deliveryRules", {
            defaultValue: "Taşıyıcı ve irsaliye kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("shippingParameters.carrier", {
                defaultValue: "Taşıyıcı adı zorunlu",
              })}
              checked={form.requireCarrierName}
              onChange={(v) => set("requireCarrierName", v)}
            />
            <Toggle
              label={te("shippingParameters.plate", {
                defaultValue: "Araç plakası zorunlu",
              })}
              checked={form.requireVehiclePlate}
              onChange={(v) => set("requireVehiclePlate", v)}
            />
            <Toggle
              label={te("shippingParameters.driver", {
                defaultValue: "Sürücü adı zorunlu",
              })}
              checked={form.requireDriverName}
              onChange={(v) => set("requireDriverName", v)}
            />
            <Toggle
              label={te("shippingParameters.tracking", {
                defaultValue: "Takip numarası zorunlu",
              })}
              checked={form.requireTrackingNumber}
              onChange={(v) => set("requireTrackingNumber", v)}
            />
            <Toggle
              label={te("shippingParameters.autoDelivery", {
                defaultValue: "Sevk sonrası irsaliyeyi otomatik oluştur",
              })}
              checked={form.autoCreateDeliveryNote}
              onChange={(v) => set("autoCreateDeliveryNote", v)}
            />
            <Field
              label={te("shippingParameters.scenario", {
                defaultValue: "İrsaliye senaryosu",
              })}
            >
              <Input
                value={form.deliveryNoteScenario}
                maxLength={30}
                onChange={(e) =>
                  set("deliveryNoteScenario", e.target.value.toUpperCase())
                }
              />
            </Field>
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
              <Choice
                active={form.defaultDeliveryNoteStatus === 0}
                title={te("status.Draft", { defaultValue: "Taslak" })}
                onClick={() => set("defaultDeliveryNoteStatus", 0)}
              />
              <Choice
                active={form.defaultDeliveryNoteStatus === 1}
                title={te("status.ReadyForElectronicSubmission", {
                  defaultValue: "GİB gönderimine hazır",
                })}
                onClick={() => set("defaultDeliveryNoteStatus", 1)}
              />
            </div>
            <Field
              label={te("fields.currencyCode", {
                defaultValue: "Stok para birimi",
              })}
            >
              <Input
                value={form.inventoryCurrencyCode}
                maxLength={3}
                onChange={(e) =>
                  set("inventoryCurrencyCode", e.target.value.toUpperCase())
                }
              />
            </Field>
          </div>
        </Panel>
      </div>
    </form>
  );
}
function NumberPanel({
  title,
  preview,
  automatic,
  manual,
  format,
  next,
  increment,
  minimum,
  maximum,
  set,
}: {
  title: string;
  preview: string;
  automatic: boolean;
  manual: boolean;
  format: string;
  next: number;
  increment: number;
  minimum: number;
  maximum: number;
  set: (key: string, value: string | number | boolean) => void;
}) {
  return (
    <Panel icon={<Hash />} title={title}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          label="Otomatik üret"
          checked={automatic}
          onChange={(v) => set("IsAutomatic", v)}
        />
        <Toggle
          label="Manuel numaraya izin ver"
          checked={manual}
          onChange={(v) => set("AllowManual", v)}
        />
        <div className="sm:col-span-2">
          <NumberFormatBuilder value={format} onChange={(value) => set("Format", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={next} />
        </div>
        <Num
          label="Sonraki numara"
          value={next}
          onChange={(v) => set("NextNumber", v)}
        />
        <Num
          label="Artış"
          value={increment}
          onChange={(v) => set("IncrementBy", v)}
        />
        <Num
          label="Alt sınır"
          value={minimum}
          onChange={(v) => set("MinimumNumber", v)}
        />
        <Num
          label="Üst sınır"
          value={maximum}
          onChange={(v) => set("MaximumNumber", v)}
        />
      </div>
      <div className="metivon-brand-soft mt-4 rounded-2xl border p-3 font-mono font-bold">
        {preview}
      </div>
    </Panel>
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
function Choice({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-start font-semibold ${active ? "metivon-brand-soft border-[var(--crm-brand-primary)]" : ""}`}
    >
      {title}
    </button>
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
