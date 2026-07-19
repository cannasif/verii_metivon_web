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
  Hash,
  Route,
  Save,
  ShieldCheck,
  TimerReset,
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
  allowCrossBranchTransfer: boolean;
  requireConfirmationBeforeShipment: boolean;
  autoConfirmOnCreate: boolean;
  requireExpectedReceiptDate: boolean;
  defaultTransitDays: number;
  allowPastTransferDate: boolean;
  allowReceiptBeforeExpectedDate: boolean;
  requireNotes: boolean;
  maximumLinesPerTransfer: number;
  requireLotForLotTracked: boolean;
  requireSerialForSerialTracked: boolean;
  defaultInventoryStatusId: number | null;
  inventoryCurrencyId: number;
  inventoryCurrencyCode: string;
  preview: string;
}
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
const titles: Record<string, [string, string, string, string, string, string]> =
  {
    tr: [
      "Transfer Parametreleri",
      "Depolar Arası Transfer",
      "Transfer numarası, onay, transit, izlenebilirlik ve depo güvenlik kurallarını yönetin.",
      "Parametre kapsamı",
      "Tüm kaynak depolar",
      "Kaynak depo ara...",
    ],
    en: [
      "Transfer Parameters",
      "Warehouse Transfers",
      "Manage transfer numbering, approval, transit, traceability and warehouse safety rules.",
      "Parameter scope",
      "All source warehouses",
      "Search source warehouses...",
    ],
    de: [
      "Umlagerungsparameter",
      "Lagerumlagerung",
      "Nummerierung, Freigabe, Transport und Rückverfolgbarkeit verwalten.",
      "Parameterbereich",
      "Alle Quelllager",
      "Quelllager suchen...",
    ],
    fr: [
      "Paramètres de transfert",
      "Transferts entre entrepôts",
      "Gérez la numérotation, la validation, le transit et la traçabilité.",
      "Portée",
      "Tous les entrepôts sources",
      "Rechercher un entrepôt...",
    ],
    es: [
      "Parámetros de transferencia",
      "Transferencias de almacén",
      "Gestione numeración, aprobación, tránsito y trazabilidad.",
      "Ámbito",
      "Todos los almacenes origen",
      "Buscar almacén...",
    ],
    it: [
      "Parametri trasferimento",
      "Trasferimenti di magazzino",
      "Gestisci numerazione, approvazione, transito e tracciabilità.",
      "Ambito",
      "Tutti i magazzini origine",
      "Cerca magazzino...",
    ],
    pt: [
      "Parâmetros de transferência",
      "Transferências de armazém",
      "Gerencie numeração, aprovação, trânsito e rastreabilidade.",
      "Escopo",
      "Todos os armazéns de origem",
      "Pesquisar armazém...",
    ],
    nl: [
      "Overboekingsparameters",
      "Magazijnoverboekingen",
      "Beheer nummering, goedkeuring, transport en traceerbaarheid.",
      "Bereik",
      "Alle bronmagazijnen",
      "Bronmagazijn zoeken...",
    ],
    pl: [
      "Parametry transferu",
      "Transfery magazynowe",
      "Zarządzaj numeracją, zatwierdzaniem, tranzytem i identyfikowalnością.",
      "Zakres",
      "Wszystkie magazyny źródłowe",
      "Szukaj magazynu...",
    ],
    ru: [
      "Параметры перемещения",
      "Складские перемещения",
      "Управляйте нумерацией, подтверждением, транзитом и прослеживаемостью.",
      "Область",
      "Все склады-источники",
      "Поиск склада...",
    ],
    ar: [
      "معلمات التحويل",
      "التحويلات بين المستودعات",
      "إدارة الترقيم والموافقة والنقل والتتبع.",
      "نطاق المعلمات",
      "كل مستودعات المصدر",
      "البحث عن مستودع...",
    ],
    fa: [
      "پارامترهای انتقال",
      "انتقال بین انبارها",
      "شماره‌گذاری، تأیید، حمل و رهگیری را مدیریت کنید.",
      "دامنه پارامتر",
      "همه انبارهای مبدأ",
      "جستجوی انبار...",
    ],
    ja: [
      "倉庫移動パラメータ",
      "倉庫間移動",
      "採番、承認、輸送、トレーサビリティを管理します。",
      "適用範囲",
      "すべての移動元倉庫",
      "倉庫を検索...",
    ],
    ko: [
      "창고 이동 매개변수",
      "창고 간 이동",
      "번호 지정, 승인, 운송 및 추적 규칙을 관리합니다.",
      "매개변수 범위",
      "모든 출발 창고",
      "창고 검색...",
    ],
    zh: [
      "调拨参数",
      "仓库调拨",
      "管理调拨编号、审批、运输和可追溯性规则。",
      "参数范围",
      "所有来源仓库",
      "搜索仓库...",
    ],
  };
export function TransferParametersPage(): ReactElement {
  const { t: te, i18n } = useTranslation("erp");
  const { t: tc } = useTranslation("common");
  const tx = titles[i18n.language.split("-")[0]] ?? titles.en;
  const branch = useAuthStore((s) => s.branch);
  const branchId = Number(branch?.id ?? 0) || null;
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["transfer-parameters", branchId, warehouseId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/transfers",
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
        "/api/parameters/transfers",
        { ...form, branchId, warehouseId },
      );
      setForm(r.data);
      await client.invalidateQueries({ queryKey: ["transfer-parameters"] });
      toast.success(
        te("transferParameters.saved", {
          defaultValue: "Transfer parametreleri kaydedildi.",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : te("transferParameters.saveError", {
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
        {te("transferParameters.loadError", {
          defaultValue: "Transfer parametreleri yüklenemedi.",
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
        <Panel icon={<Route />} title={tx[3]}>
          <p className="text-sm text-muted-foreground">{branch?.name ?? "-"}</p>
          <div className="mt-4">
            <Label>
              {te("fields.fromWarehouseId", { defaultValue: "Kaynak depo" })}
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
          <div className="metivon-brand-soft mt-5 rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {te("transferParameters.preview", {
                defaultValue: "Sonraki transfer no",
              })}
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold">
              {form.preview}
            </p>
          </div>
        </Panel>
        <Panel
          icon={<Hash />}
          title={te("transferParameters.numbering", {
            defaultValue: "Transfer numarası ve seri",
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle
              label={te("transferParameters.automatic", {
                defaultValue: "Transfer numarasını otomatik üret",
              })}
              checked={form.isAutomatic}
              onChange={(v) => set("isAutomatic", v)}
            />
            <Toggle
              label={te("transferParameters.manual", {
                defaultValue: "Manuel numaraya izin ver",
              })}
              checked={form.allowManual}
              onChange={(v) => set("allowManual", v)}
            />
            <div className="md:col-span-2">
              <NumberFormatBuilder value={form.format} onChange={(value) => set("format", value)} allowedTokens={["BRANCH", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.nextNumber} />
            </div>
            <Num
              label={te("transferParameters.next", {
                defaultValue: "Sonraki numara",
              })}
              value={form.nextNumber}
              onChange={(v) => set("nextNumber", v)}
            />
            <Num
              label={te("transferParameters.increment", {
                defaultValue: "Artış",
              })}
              value={form.incrementBy}
              onChange={(v) => set("incrementBy", v)}
            />
            <Num
              label={te("transferParameters.minimum", {
                defaultValue: "Alt sınır",
              })}
              value={form.minimumNumber}
              onChange={(v) => set("minimumNumber", v)}
            />
            <Num
              label={te("transferParameters.maximum", {
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
          icon={<ShieldCheck />}
          title={te("transferParameters.rules", {
            defaultValue: "Onay ve güvenlik kuralları",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("transferParameters.crossBranch", {
                defaultValue: "Şubeler arası transfere izin ver",
              })}
              checked={form.allowCrossBranchTransfer}
              onChange={(v) => set("allowCrossBranchTransfer", v)}
            />
            <Toggle
              label={te("transferParameters.confirm", {
                defaultValue: "Sevk öncesi onay zorunlu",
              })}
              checked={form.requireConfirmationBeforeShipment}
              onChange={(v) => set("requireConfirmationBeforeShipment", v)}
            />
            <Toggle
              label={te("transferParameters.autoConfirm", {
                defaultValue: "Oluştururken otomatik onayla",
              })}
              checked={form.autoConfirmOnCreate}
              onChange={(v) => set("autoConfirmOnCreate", v)}
            />
            <Toggle
              label={te("transferParameters.pastDate", {
                defaultValue: "Geçmiş transfer tarihine izin ver",
              })}
              checked={form.allowPastTransferDate}
              onChange={(v) => set("allowPastTransferDate", v)}
            />
            <Toggle
              label={te("transferParameters.notes", {
                defaultValue: "Açıklama zorunlu",
              })}
              checked={form.requireNotes}
              onChange={(v) => set("requireNotes", v)}
            />
            <Num
              label={te("transferParameters.maxLines", {
                defaultValue: "Maksimum satır sayısı",
              })}
              value={form.maximumLinesPerTransfer}
              onChange={(v) => set("maximumLinesPerTransfer", v)}
            />
          </div>
        </Panel>
        <Panel
          icon={<TimerReset />}
          title={te("transferParameters.transit", {
            defaultValue: "Transit ve izlenebilirlik",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={te("transferParameters.expected", {
                defaultValue: "Beklenen varış tarihi zorunlu",
              })}
              checked={form.requireExpectedReceiptDate}
              onChange={(v) => set("requireExpectedReceiptDate", v)}
            />
            <Toggle
              label={te("transferParameters.earlyReceipt", {
                defaultValue: "Beklenen tarihten önce kabule izin ver",
              })}
              checked={form.allowReceiptBeforeExpectedDate}
              onChange={(v) => set("allowReceiptBeforeExpectedDate", v)}
            />
            <Toggle
              label={te("transferParameters.lot", {
                defaultValue: "Lot takipli üründe lot zorunlu",
              })}
              checked={form.requireLotForLotTracked}
              onChange={(v) => set("requireLotForLotTracked", v)}
            />
            <Toggle
              label={te("transferParameters.serial", {
                defaultValue: "Seri takipli üründe seri zorunlu",
              })}
              checked={form.requireSerialForSerialTracked}
              onChange={(v) => set("requireSerialForSerialTracked", v)}
            />
            <Num
              label={te("transferParameters.transitDays", {
                defaultValue: "Varsayılan transit süresi (gün)",
              })}
              value={form.defaultTransitDays}
              onChange={(v) => set("defaultTransitDays", v)}
            />
            <Field
              label={te("fields.inventoryStatusId", {
                defaultValue: "Varsayılan stok durumu",
              })}
            >
              <ErpLookupCombobox
                lookupKey="inventoryStatuses"
                value={String(form.defaultInventoryStatusId ?? "")}
                fallbackOptions={[]}
                placeholder={te("transferParameters.noDefault", {
                  defaultValue: "Varsayılan yok",
                })}
                searchPlaceholder={te("transferParameters.searchStatus", {
                  defaultValue: "Stok durumu ara...",
                })}
                onChange={(v) =>
                  set("defaultInventoryStatusId", v === "" ? null : v)
                }
              />
            </Field>
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
