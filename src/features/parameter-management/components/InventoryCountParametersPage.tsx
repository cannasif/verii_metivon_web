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
  CheckCircle2,
  ClipboardCheck,
  Hash,
  Save,
  Scale,
  ShieldCheck,
  Warehouse,
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
  defaultBlindCount: boolean;
  freezeOnCreate: boolean;
  allowPastCountDate: boolean;
  requireStorageLocation: boolean;
  includeZeroBalances: boolean;
  preventOverlappingOpenCounts: boolean;
  maximumLinesPerCount: number;
  allowNegativeCountedQuantity: boolean;
  requireReasonCodeForDifference: boolean;
  automaticApprovalQuantityTolerance: number;
  automaticApprovalPercentTolerance: number;
  autoApproveWithinTolerance: boolean;
  requireApprovalBeforePosting: boolean;
  allowPostingWithoutDifference: boolean;
  postingCurrencyCode: string;
  preview: string;
};
const titles: Record<string, string[]> = {
  tr: [
    "Sayım ve Stok Düzeltme Parametreleri",
    "Stok Yönetimi",
    "Sayım kapsamı, tolerans, onay ve stok düzeltme kurallarını yönetin.",
    "Tüm sayım depoları",
    "Depo ara...",
  ],
  en: [
    "Counting and Stock Adjustment Parameters",
    "Inventory Management",
    "Manage count scope, tolerance, approval and stock adjustment rules.",
    "All count warehouses",
    "Search warehouse...",
  ],
  de: [
    "Inventur- und Bestandskorrekturparameter",
    "Bestandsverwaltung",
    "Inventurumfang, Toleranz, Freigabe und Korrekturregeln verwalten.",
    "Alle Inventurlager",
    "Lager suchen...",
  ],
  fr: [
    "Paramètres d'inventaire et d'ajustement",
    "Gestion des stocks",
    "Gérez le périmètre, les tolérances, les approbations et les ajustements.",
    "Tous les entrepôts",
    "Rechercher un entrepôt...",
  ],
  es: [
    "Parámetros de conteo y ajuste",
    "Gestión de inventario",
    "Gestione alcance, tolerancia, aprobación y ajustes de stock.",
    "Todos los almacenes",
    "Buscar almacén...",
  ],
  it: [
    "Parametri inventario e rettifica",
    "Gestione scorte",
    "Gestisci ambito, tolleranze, approvazioni e rettifiche.",
    "Tutti i magazzini",
    "Cerca magazzino...",
  ],
  pt: [
    "Parâmetros de contagem e ajuste",
    "Gestão de estoque",
    "Gerencie escopo, tolerância, aprovação e ajustes.",
    "Todos os armazéns",
    "Pesquisar armazém...",
  ],
  nl: [
    "Tel- en voorraadcorrectieparameters",
    "Voorraadbeheer",
    "Beheer bereik, tolerantie, goedkeuring en voorraadcorrecties.",
    "Alle magazijnen",
    "Magazijn zoeken...",
  ],
  pl: [
    "Parametry inwentaryzacji i korekt",
    "Zarządzanie zapasami",
    "Zarządzaj zakresem, tolerancją, zatwierdzaniem i korektami.",
    "Wszystkie magazyny",
    "Szukaj magazynu...",
  ],
  ru: [
    "Параметры инвентаризации и корректировки",
    "Управление запасами",
    "Управляйте охватом, допусками, согласованием и корректировками.",
    "Все склады",
    "Поиск склада...",
  ],
  ar: [
    "معلمات الجرد وتسوية المخزون",
    "إدارة المخزون",
    "إدارة نطاق الجرد والتفاوت والموافقة وتسويات المخزون.",
    "جميع المستودعات",
    "البحث عن مستودع...",
  ],
  fa: [
    "پارامترهای شمارش و اصلاح موجودی",
    "مدیریت موجودی",
    "دامنه شمارش، تلرانس، تأیید و اصلاحات موجودی را مدیریت کنید.",
    "همه انبارها",
    "جستجوی انبار...",
  ],
  ja: [
    "棚卸・在庫調整パラメータ",
    "在庫管理",
    "棚卸範囲、許容差、承認、在庫調整ルールを管理します。",
    "すべての倉庫",
    "倉庫を検索...",
  ],
  ko: [
    "재고 실사 및 조정 매개변수",
    "재고 관리",
    "실사 범위, 허용 오차, 승인 및 재고 조정 규칙을 관리합니다.",
    "모든 창고",
    "창고 검색...",
  ],
  zh: [
    "盘点与库存调整参数",
    "库存管理",
    "管理盘点范围、容差、审批和库存调整规则。",
    "所有仓库",
    "搜索仓库...",
  ],
};
export function InventoryCountParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["inventory-count-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/inventory-counts",
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
        "/api/parameters/inventory-counts",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({
        queryKey: ["inventory-count-parameters"],
      });
      toast.success(
        te("countParameters.saved", {
          defaultValue: "Sayım parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Parametreler kaydedilemedi.",
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
        Sayım parametreleri yüklenemedi.
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
        <Panel icon={<Warehouse />} title="Parametre kapsamı">
          <p className="text-sm text-muted-foreground">{branch?.name ?? "-"}</p>
          <div className="mt-4">
            <Label>Sayım deposu</Label>
            <div className="mt-2">
              <ErpLookupCombobox
                lookupKey="warehouses"
                value={String(warehouseId ?? "")}
                fallbackOptions={[]}
                placeholder={tx[3]}
                searchPlaceholder={tx[4]}
                onChange={(v) => setWarehouseId(v === "" ? null : v)}
              />
            </div>
          </div>
        </Panel>
        <Panel icon={<Hash />} title="Sayım numarası">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Otomatik üret"
              checked={form.isAutomatic}
              onChange={(v) => set("isAutomatic", v)}
            />
            <Toggle
              label="Manuel numaraya izin ver"
              checked={form.allowManual}
              onChange={(v) => set("allowManual", v)}
            />
            <div className="sm:col-span-2">
              <NumberFormatBuilder value={form.format} onChange={(value) => set("format", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.nextNumber} />
            </div>
            <Num
              label="Sonraki numara"
              value={form.nextNumber}
              onChange={(v) => set("nextNumber", v)}
            />
            <Num
              label="Artış"
              value={form.incrementBy}
              onChange={(v) => set("incrementBy", v)}
            />
            <Num
              label="Alt sınır"
              value={form.minimumNumber}
              onChange={(v) => set("minimumNumber", v)}
            />
            <Num
              label="Üst sınır"
              value={form.maximumNumber}
              onChange={(v) => set("maximumNumber", v)}
            />
          </div>
          <div className="metivon-brand-soft mt-4 rounded-2xl border p-3 font-mono font-bold">
            {form.preview}
          </div>
        </Panel>
        <Panel icon={<ClipboardCheck />} title="Sayım oluşturma kuralları">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Varsayılan kör sayım"
              checked={form.defaultBlindCount}
              onChange={(v) => set("defaultBlindCount", v)}
            />
            <Toggle
              label="Oluştururken stoğu dondur"
              checked={form.freezeOnCreate}
              onChange={(v) => set("freezeOnCreate", v)}
            />
            <Toggle
              label="Geçmiş sayım tarihine izin ver"
              checked={form.allowPastCountDate}
              onChange={(v) => set("allowPastCountDate", v)}
            />
            <Toggle
              label="Raf/lokasyon zorunlu"
              checked={form.requireStorageLocation}
              onChange={(v) => set("requireStorageLocation", v)}
            />
            <Toggle
              label="Sıfır bakiyeleri dahil et"
              checked={form.includeZeroBalances}
              onChange={(v) => set("includeZeroBalances", v)}
            />
            <Toggle
              label="Çakışan açık sayımı engelle"
              checked={form.preventOverlappingOpenCounts}
              onChange={(v) => set("preventOverlappingOpenCounts", v)}
            />
            <Num
              label="Maksimum sayım satırı"
              value={form.maximumLinesPerCount}
              onChange={(v) => set("maximumLinesPerCount", v)}
            />
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel icon={<Scale />} title="Fark ve tolerans kuralları">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Negatif sayım miktarına izin ver"
              checked={form.allowNegativeCountedQuantity}
              onChange={(v) => set("allowNegativeCountedQuantity", v)}
            />
            <Toggle
              label="Fark varsa neden kodu zorunlu"
              checked={form.requireReasonCodeForDifference}
              onChange={(v) => set("requireReasonCodeForDifference", v)}
            />
            <Num
              label="Otomatik onay miktar toleransı"
              value={form.automaticApprovalQuantityTolerance}
              onChange={(v) => set("automaticApprovalQuantityTolerance", v)}
            />
            <Num
              label="Otomatik onay yüzde toleransı"
              value={form.automaticApprovalPercentTolerance}
              onChange={(v) => set("automaticApprovalPercentTolerance", v)}
            />
            <Toggle
              label="Tolerans içindeyse otomatik onayla"
              checked={form.autoApproveWithinTolerance}
              onChange={(v) => set("autoApproveWithinTolerance", v)}
            />
          </div>
        </Panel>
        <Panel icon={<ShieldCheck />} title="Onay ve stok düzeltme kuralları">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Stok düzeltme öncesi onay zorunlu"
              checked={form.requireApprovalBeforePosting}
              onChange={(v) => set("requireApprovalBeforePosting", v)}
            />
            <Toggle
              label="Farksız sayımı kapatmaya izin ver"
              checked={form.allowPostingWithoutDifference}
              onChange={(v) => set("allowPostingWithoutDifference", v)}
            />
            <Field label="Stok hareketi para birimi">
              <Input
                value={form.postingCurrencyCode}
                maxLength={3}
                onChange={(e) =>
                  set("postingCurrencyCode", e.target.value.toUpperCase())
                }
              />
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
