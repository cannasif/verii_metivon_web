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
  Calculator,
  CheckCircle2,
  Coins,
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
  journalIsAutomatic: boolean;
  journalAllowManual: boolean;
  journalFormat: string;
  journalNextNumber: number;
  journalIncrementBy: number;
  journalMinimumNumber: number;
  journalMaximumNumber: number;
  defaultCurrencyId: number;
  defaultCurrencyCode: string;
  defaultExchangeRate: number;
  monetaryDecimalPlaces: number;
  journalBalanceTolerance: number;
  requireOpenFiscalPeriod: boolean;
  allowBackdatedJournal: boolean;
  allowFutureDatedJournal: boolean;
  autoPostManualJournals: boolean;
  requirePostingAccount: boolean;
  requireJournalDescription: boolean;
  preventDuplicateSourceDocument: boolean;
  defaultInventoryValuationMethod: number;
  requireInventoryPostingProfile: boolean;
  createCostLayersOnReceipt: boolean;
  allowNegativeInventoryValue: boolean;
  costDecimalPlaces: number;
  costCloseTolerance: number;
  requireApprovalBeforeCostClose: boolean;
  allowCostCloseReopen: boolean;
  autoCloseInventoryWithPeriod: boolean;
  includeLandedCostAdjustments: boolean;
  journalPreview: string;
};
const titles: Record<string, [string, string, string, string, string]> = {
  tr: [
    "Muhasebe ve Maliyetlendirme Parametreleri",
    "Finans Yönetimi",
    "Yevmiye, dönem, hesap doğrulama, stok değerleme ve maliyet kapatma kurallarını yönetin.",
    "Tüm depolar",
    "Depo ara...",
  ],
  en: [
    "Accounting and Costing Parameters",
    "Finance Management",
    "Manage journal, period, account validation, inventory valuation and cost close rules.",
    "All warehouses",
    "Search warehouse...",
  ],
  de: [
    "Buchhaltungs- und Kalkulationsparameter",
    "Finanzverwaltung",
    "Journal-, Perioden-, Konten-, Bewertungs- und Kostenabschlussregeln verwalten.",
    "Alle Lager",
    "Lager suchen...",
  ],
  fr: [
    "Paramètres comptables et de calcul des coûts",
    "Gestion financière",
    "Gérez journal, période, comptes, valorisation et clôture des coûts.",
    "Tous les entrepôts",
    "Rechercher un entrepôt...",
  ],
  es: [
    "Parámetros contables y de costes",
    "Gestión financiera",
    "Gestione diario, período, cuentas, valoración y cierre de costes.",
    "Todos los almacenes",
    "Buscar almacén...",
  ],
  it: [
    "Parametri contabili e di costo",
    "Gestione finanziaria",
    "Gestisci giornale, periodo, conti, valorizzazione e chiusura costi.",
    "Tutti i magazzini",
    "Cerca magazzino...",
  ],
  pt: [
    "Parâmetros contábeis e de custos",
    "Gestão financeira",
    "Gerencie diário, período, contas, avaliação e fechamento de custos.",
    "Todos os armazéns",
    "Pesquisar armazém...",
  ],
  nl: [
    "Boekhoud- en kostprijsparameters",
    "Financieel beheer",
    "Beheer journaal, periode, rekeningen, waardering en kostenafsluiting.",
    "Alle magazijnen",
    "Magazijn zoeken...",
  ],
  pl: [
    "Parametry księgowe i kosztowe",
    "Zarządzanie finansami",
    "Zarządzaj dziennikiem, okresem, kontami, wyceną i zamknięciem kosztów.",
    "Wszystkie magazyny",
    "Szukaj magazynu...",
  ],
  ru: [
    "Параметры бухгалтерии и себестоимости",
    "Управление финансами",
    "Управляйте журналом, периодом, счетами, оценкой и закрытием затрат.",
    "Все склады",
    "Поиск склада...",
  ],
  ar: [
    "معلمات المحاسبة والتكلفة",
    "الإدارة المالية",
    "إدارة اليومية والفترة والحسابات والتقييم وإقفال التكلفة.",
    "جميع المستودعات",
    "البحث عن مستودع...",
  ],
  fa: [
    "پارامترهای حسابداری و بهای تمام‌شده",
    "مدیریت مالی",
    "دفتر روزنامه، دوره، حساب‌ها، ارزش‌گذاری و بستن هزینه را مدیریت کنید.",
    "همه انبارها",
    "جستجوی انبار...",
  ],
  ja: [
    "会計・原価計算パラメータ",
    "財務管理",
    "仕訳、期間、勘定、在庫評価、原価締めを管理します。",
    "すべての倉庫",
    "倉庫を検索...",
  ],
  ko: [
    "회계 및 원가 계산 매개변수",
    "재무 관리",
    "분개, 기간, 계정, 재고 평가 및 원가 마감을 관리합니다.",
    "모든 창고",
    "창고 검색...",
  ],
  zh: [
    "会计与成本核算参数",
    "财务管理",
    "管理日记账、期间、科目、库存计价和成本结算规则。",
    "所有仓库",
    "搜索仓库...",
  ],
};
export function AccountingParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["accounting-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/accounting",
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
        "/api/parameters/accounting",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["accounting-parameters"] });
      toast.success(
        te("accountingParameters.saved", {
          defaultValue: "Muhasebe parametreleri kaydedildi.",
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
        Muhasebe parametreleri yüklenemedi.
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
            <Label>Maliyet deposu</Label>
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
        <Panel icon={<Hash />} title="Yevmiye numarası">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Otomatik numara"
              checked={form.journalIsAutomatic}
              onChange={(v) => set("journalIsAutomatic", v)}
            />
            <Toggle
              label="Manuel numaraya izin ver"
              checked={form.journalAllowManual}
              onChange={(v) => set("journalAllowManual", v)}
            />
            <div className="sm:col-span-2">
              <NumberFormatBuilder value={form.journalFormat} onChange={(value) => set("journalFormat", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.journalNextNumber} />
            </div>
            <Num
              label="Sonraki numara"
              value={form.journalNextNumber}
              onChange={(v) => set("journalNextNumber", v)}
            />
            <Num
              label="Artış"
              value={form.journalIncrementBy}
              onChange={(v) => set("journalIncrementBy", v)}
            />
            <Num
              label="Alt sınır"
              value={form.journalMinimumNumber}
              onChange={(v) => set("journalMinimumNumber", v)}
            />
            <Num
              label="Üst sınır"
              value={form.journalMaximumNumber}
              onChange={(v) => set("journalMaximumNumber", v)}
            />
          </div>
          <div className="metivon-brand-soft mt-4 rounded-2xl border p-3 font-mono font-bold">
            {form.journalPreview}
          </div>
        </Panel>
        <Panel icon={<Coins />} title="Para birimi ve hassasiyet">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Varsayılan para birimi">
              <ErpLookupCombobox
                lookupKey="currencies"
                value={String(form.defaultCurrencyId || "")}
                fallbackOptions={[]}
                placeholder="Para birimi seçin"
                searchPlaceholder="Para birimlerinde ara..."
                onChange={(value) => set("defaultCurrencyId", Number(value) || 0)}
              />
            </Field>
            <Num
              label="Varsayılan kur"
              value={form.defaultExchangeRate}
              min={0.00000001}
              step="0.00000001"
              onChange={(v) => set("defaultExchangeRate", v)}
            />
            <Num
              label="Parasal ondalık"
              value={form.monetaryDecimalPlaces}
              min={2}
              max={8}
              onChange={(v) => set("monetaryDecimalPlaces", v)}
            />
            <Num
              label="Denge toleransı"
              value={form.journalBalanceTolerance}
              step="0.00000001"
              onChange={(v) => set("journalBalanceTolerance", v)}
            />
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel icon={<ShieldCheck />} title="Yevmiye ve dönem kontrolleri">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Açık mali dönem zorunlu"
              checked={form.requireOpenFiscalPeriod}
              onChange={(v) => set("requireOpenFiscalPeriod", v)}
            />
            <Toggle
              label="Geçmiş tarihli yevmiyeye izin ver"
              checked={form.allowBackdatedJournal}
              onChange={(v) => set("allowBackdatedJournal", v)}
            />
            <Toggle
              label="Gelecek tarihli yevmiyeye izin ver"
              checked={form.allowFutureDatedJournal}
              onChange={(v) => set("allowFutureDatedJournal", v)}
            />
            <Toggle
              label="Manuel yevmiyeyi otomatik kaydet"
              checked={form.autoPostManualJournals}
              onChange={(v) => set("autoPostManualJournals", v)}
            />
            <Toggle
              label="Hareket kabul eden hesap zorunlu"
              checked={form.requirePostingAccount}
              onChange={(v) => set("requirePostingAccount", v)}
            />
            <Toggle
              label="Yevmiye açıklaması zorunlu"
              checked={form.requireJournalDescription}
              onChange={(v) => set("requireJournalDescription", v)}
            />
            <Toggle
              label="Kaynak belge tekrarını engelle"
              checked={form.preventDuplicateSourceDocument}
              onChange={(v) => set("preventDuplicateSourceDocument", v)}
            />
          </div>
        </Panel>
        <Panel icon={<Calculator />} title="Stok değerleme ve maliyet">
          <div className="space-y-3">
            <Label>Varsayılan değerleme yöntemi</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Choice
                active={form.defaultInventoryValuationMethod === 1}
                onClick={() => set("defaultInventoryValuationMethod", 1)}
              >
                Hareketli Ortalama
              </Choice>
              <Choice
                active={form.defaultInventoryValuationMethod === 2}
                onClick={() => set("defaultInventoryValuationMethod", 2)}
              >
                FIFO
              </Choice>
              <Choice
                active={form.defaultInventoryValuationMethod === 3}
                onClick={() => set("defaultInventoryValuationMethod", 3)}
              >
                Standart Maliyet
              </Choice>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Stok muhasebe profili zorunlu"
                checked={form.requireInventoryPostingProfile}
                onChange={(v) => set("requireInventoryPostingProfile", v)}
              />
              <Toggle
                label="Girişte maliyet katmanı oluştur"
                checked={form.createCostLayersOnReceipt}
                onChange={(v) => set("createCostLayersOnReceipt", v)}
              />
              <Toggle
                label="Negatif stok değerine izin ver"
                checked={form.allowNegativeInventoryValue}
                onChange={(v) => set("allowNegativeInventoryValue", v)}
              />
              <Num
                label="Maliyet ondalık hassasiyeti"
                value={form.costDecimalPlaces}
                min={2}
                max={8}
                onChange={(v) => set("costDecimalPlaces", v)}
              />
            </div>
          </div>
        </Panel>
      </div>
      <Panel icon={<Scale />} title="Maliyet kapatma">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Num
            label="Kapatma toleransı"
            value={form.costCloseTolerance}
            step="0.00000001"
            onChange={(v) => set("costCloseTolerance", v)}
          />
          <Toggle
            label="Kapatma öncesi onay zorunlu"
            checked={form.requireApprovalBeforeCostClose}
            onChange={(v) => set("requireApprovalBeforeCostClose", v)}
          />
          <Toggle
            label="Maliyet kapatmayı geri aç"
            checked={form.allowCostCloseReopen}
            onChange={(v) => set("allowCostCloseReopen", v)}
          />
          <Toggle
            label="Dönemle birlikte stoğu kapat"
            checked={form.autoCloseInventoryWithPeriod}
            onChange={(v) => set("autoCloseInventoryWithPeriod", v)}
          />
          <Toggle
            label="İthalat maliyetlerini dahil et"
            checked={form.includeLandedCostAdjustments}
            onChange={(v) => set("includeLandedCostAdjustments", v)}
          />
        </div>
      </Panel>
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
  min = 0,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${active ? "metivon-brand-soft border-[var(--crm-brand-primary)]" : "hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}
