import {
  useMemo,
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberFormatBuilder } from "@/components/shared/NumberFormatBuilder";
import { ErpPagedManagementPage } from "@/features/erp-operation-management/ErpPagedManagementPage";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
import type {
  ErpColumn,
  ErpPageConfig,
} from "@/features/erp-operation-management/types";
import { useAuthStore } from "@/stores/auth-store";

type Definition = {
  module: string;
  references: string[];
  title: string;
  titleKey: string;
};
const definitions: Record<string, Definition> = {
  "/purchase-orders/number-series": {
    module: "Procurement",
    references: ["PurchaseOrderNumber"],
    title: "Satın Alma Numara Serileri",
    titleKey: "nav.purchaseNumberSeries",
  },
  "/goods-receipts/number-series": {
    module: "Receiving",
    references: ["GoodsReceiptNumber"],
    title: "Mal Kabul Numara Serileri",
    titleKey: "nav.receivingNumberSeries",
  },
  "/transfer-orders/number-series": {
    module: "Transfers",
    references: ["TransferNumber"],
    title: "Transfer Numara Serileri",
    titleKey: "nav.transferNumberSeries",
  },
  "/sales-orders/number-series": {
    module: "Sales",
    references: ["SalesOrderNumber"],
    title: "Satış Siparişi Numara Serileri",
    titleKey: "nav.salesNumberSeries",
  },
  "/shipments/number-series": {
    module: "Shipping",
    references: ["ShipmentNumber", "DeliveryNoteNumber"],
    title: "Sevk ve İrsaliye Numara Serileri",
    titleKey: "nav.shippingNumberSeries",
  },
  "/e-documents/number-series": {
    module: "EDocuments",
    references: ["EInvoiceNumber", "EArchiveNumber", "EDespatchNumber"],
    title: "E-Belge Numara Serileri",
    titleKey: "nav.eDocumentNumberSeries",
  },
};
const basePath = (path: string) => path.replace(/\/(?:new|usages|\d+\/edit)$/, "");
const resolve = (path: string) =>
  definitions[basePath(path)] ?? definitions["/goods-receipts/number-series"];
const c = (
  key: string,
  label: string,
  extra: Partial<ErpColumn> = {},
): ErpColumn => ({
  key,
  label,
  translationKey: `numberSeries.fields.${key}`,
  ...extra,
});

export function NumberSeriesManagementPage(): ReactElement {
  const location = useLocation(),
    navigate = useNavigate(),
    { t } = useTranslation("erp");
  const d = resolve(location.pathname),
    base = basePath(location.pathname);
  const config = useMemo<ErpPageConfig>(
    () => ({
      pageKey: `number-series-${d.module.toLowerCase()}`,
      title: t(d.titleKey, { defaultValue: d.title }),
      eyebrow: "V3RII ERP",
      description: t("numberSeries.listDescription"),
      endpoint: `/api/number-series?module=${encodeURIComponent(d.module)}`,
      createLabel: t("numberSeries.new"),
      createPath: `${base}/new`,
      accent: "cyan",
      actions: [
        {
          label: t("common.edit"),
          kind: "update",
          navigateTo: (row) => `${base}/${row.id}/edit`,
        },
        {
          label: t("common.delete"),
          kind: "delete",
          method: "delete",
          endpoint: (row) => `/api/number-series/${row.id}/delete`,
          confirm: t("numberSeries.deleteConfirm"),
          variant: "destructive",
        },
      ],
      columns: [
        {
          key: "id",
          label: "Kayıt ID",
          format: "id",
          sortable: false,
          width: 90,
        },
        c("code", "Seri Kodu", { width: 110 }),
        c("name", "Seri Adı", { width: 180 }),
        c("reference", "Belge Referansı", { width: 180 }),
        c("scopeType", "Kapsam", {
          statusPrefix: "numberSeries.scope",
          format: "status",
          width: 110,
        }),
        c("format", "Format", { width: 220 }),
        c("resetPeriod", "Sıfırlama", {
          statusPrefix: "numberSeries.reset",
          format: "status",
          width: 110,
        }),
        c("isGibCompliant", "GİB Uyumlu", { format: "boolean", width: 100 }),
        c("isDefault", "Varsayılan", { format: "boolean", width: 100 }),
        c("isContinuous", "Kesintisiz", { format: "boolean", width: 100 }),
        c("priority", "Öncelik", { format: "number", width: 90 }),
        c("isActive", "Aktif", { format: "boolean", width: 80 }),
      ],
    }),
    [base, d, t],
  );
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate(`${base}/usages`)}>
          {t("numberSeries.audit")}
        </Button>
      </div>
      <ErpPagedManagementPage config={config} />
    </div>
  );
}

export function NumberSeriesUsagePage(): ReactElement {
  const location = useLocation(),
    navigate = useNavigate(),
    { t } = useTranslation("erp");
  const d = resolve(location.pathname),
    base = basePath(location.pathname);
  const config = useMemo<ErpPageConfig>(
    () => ({
      pageKey: `number-series-usages-${d.module.toLowerCase()}`,
      title: t("numberSeries.audit"),
      eyebrow: t(d.titleKey, { defaultValue: d.title }),
      description: t("numberSeries.auditDescription"),
      endpoint: `/api/number-series/usages?module=${encodeURIComponent(d.module)}`,
      accent: "amber",
      columns: [
        {
          key: "id",
          label: "Kayıt ID",
          format: "id",
          sortable: false,
          width: 90,
        },
        c("seriesCode", "Seri Kodu", { width: 110 }),
        c("documentNumber", "Belge Numarası", { width: 190 }),
        c("documentType", "Belge Türü", { width: 150 }),
        c("periodKey", "Dönem", { width: 100 }),
        c("sequenceNumber", "Sayaç", { format: "number", width: 90 }),
        c("status", "Durum", {
          statusPrefix: "numberSeries.usageStatus",
          format: "status",
          width: 110,
        }),
        c("documentId", "Belge Kayıt ID", { format: "number", width: 110 }),
        c("reservedAt", "Ayrılma Zamanı", { format: "datetime", width: 160 }),
        c("reservationExpiresAt", "Rezervasyon Bitişi", {
          format: "datetime",
          width: 160,
        }),
        c("usedAt", "Kullanım Zamanı", { format: "datetime", width: 160 }),
        c("cancelledAt", "İptal Zamanı", { format: "datetime", width: 160 }),
        c("recycledAt", "Geri Alınma Zamanı", {
          format: "datetime",
          width: 160,
        }),
        c("cancellationReason", "İptal Nedeni", { width: 220 }),
      ],
    }),
    [d, t],
  );
  const [cleaning, setCleaning] = useState(false);
  const cleanup = async () => {
    try {
      setCleaning(true);
      const result = await api.post<{
        data: { examined: number; recycled: number; cancelled: number };
      }>("/api/number-series/usages/cleanup-expired", {
        module: d.module,
        expiredBefore: null,
      });
      toast.success(
        t("numberSeries.cleanupResult", {
          examined: result.data.examined,
          recycled: result.data.recycled,
          cancelled: result.data.cancelled,
        }),
      );
    } finally {
      setCleaning(false);
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" onClick={() => navigate(base)}>
          {t("common.back", { defaultValue: "Geri" })}
        </Button>
        <Button
          variant="outline"
          disabled={cleaning}
          onClick={() => void cleanup()}
        >
          {cleaning ? t("common.loading") : t("numberSeries.cleanup")}
        </Button>
      </div>
      <ErpPagedManagementPage config={config} />
    </div>
  );
}

export function NumberSeriesCreatePage(): ReactElement {
  const location = useLocation(),
    navigate = useNavigate(),
    { t } = useTranslation("erp");
  const d = resolve(location.pathname),
    back = basePath(location.pathname);
  const params = useParams<{ id?: string }>();
  const editId = Number(params.id) || null;
  const activeBranch = useAuthStore((state) => state.branch);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    reference: d.references[0],
    scopeType: 1,
    branchId: activeBranch?.id ?? "",
    warehouseId: "",
    format: "{SERIES}{YYYY}{NUMBER:9}",
    resetPeriod: 1,
    startingNumber: 1,
    incrementBy: 1,
    maximumNumber: 999999999,
    isGibCompliant: d.module === "EDocuments",
    allowManual: d.module !== "EDocuments",
    isContinuous: d.module === "EDocuments",
    reservationTimeoutMinutes: 30,
    isDefault: true,
    priority: 100,
    isActive: true,
    channel: "",
    scenario: "",
  });
  const detailQuery = useQuery({
    queryKey: ["number-series-detail", editId],
    queryFn: () => api.get<{ data: {
      id:number;code:string;name:string;reference:string;scopeType:number;branchId:number|null;warehouseId:number|null;
      format:string;resetPeriod:number;startingNumber:number;incrementBy:number;maximumNumber:number;isGibCompliant:boolean;
      allowManual:boolean;isContinuous:boolean;reservationTimeoutMinutes:number;isDefault:boolean;priority:number;isActive:boolean;
      assignments:Array<{channel?:string|null;scenario?:string|null}>;
    } }>(`/api/number-series/${editId}`),
    enabled: editId !== null,
  });
  useEffect(() => {
    const item = detailQuery.data?.data;
    if (!item) return;
    const assignment = item.assignments?.[0];
    setForm({
      code:item.code,name:item.name,reference:item.reference,scopeType:item.scopeType,branchId:item.branchId ? String(item.branchId) : "",
      warehouseId:item.warehouseId ? String(item.warehouseId) : "",format:item.format,resetPeriod:item.resetPeriod,startingNumber:item.startingNumber,
      incrementBy:item.incrementBy,maximumNumber:item.maximumNumber,isGibCompliant:item.isGibCompliant,allowManual:item.allowManual,
      isContinuous:item.isContinuous,reservationTimeoutMinutes:item.reservationTimeoutMinutes,isDefault:item.isDefault,
      priority:item.priority,isActive:item.isActive,channel:assignment?.channel ?? "",scenario:assignment?.scenario ?? "",
    });
  }, [detailQuery.data]);
  const set = (key: string, value: unknown) =>
    setForm((x) => ({ ...x, [key]: value }));
  const setScopeType = (scopeType: number): void =>
    setForm((current) => ({
      ...current,
      scopeType,
      branchId:
        scopeType === 0 ? "" : current.branchId || activeBranch?.id || "",
      warehouseId: scopeType === 2 ? current.warehouseId : "",
    }));
  const setGibCompliant = (checked: boolean) =>
    setForm((x) =>
      checked
        ? {
            ...x,
            isGibCompliant: true,
            format: "{SERIES}{YYYY}{NUMBER:9}",
            resetPeriod: 1,
            isContinuous: true,
            allowManual: false,
          }
        : { ...x, isGibCompliant: false },
    );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post(editId ? `/api/number-series/${editId}/update` : "/api/number-series", {
        ...form,
        module: d.module,
        branchId: Number(form.branchId) || null,
        warehouseId: Number(form.warehouseId) || null,
        validFrom: null,
        validTo: null,
        assignments:
          form.channel || form.scenario
            ? [
                {
                  id: null,
                  branchId: Number(form.branchId) || null,
                  warehouseId: Number(form.warehouseId) || null,
                  userId: null,
                  businessPartnerId: null,
                  channel: form.channel || null,
                  scenario: form.scenario || null,
                  priority: form.priority,
                  isDefault: true,
                  isActive: true,
                },
              ]
            : [],
      });
      toast.success(t("numberSeries.saved"));
      navigate(back);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("common.createError"),
      );
    } finally {
      setSaving(false);
    }
  };
  const f = (key: string) => t(`numberSeries.fields.${key}`);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="metivon-hero rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">
          {editId ? t("numberSeries.editTitle") : t(d.titleKey, { defaultValue: d.title })}
        </h1>
        <p className="mt-2 text-white/75">
          {t("numberSeries.formDescription")}
        </p>
      </section>
      <form
        onSubmit={submit}
        className="metivon-panel grid gap-4 rounded-2xl border p-5 md:grid-cols-2"
      >
        <Field label={f("code")}>
          <Input
            required
            maxLength={20}
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label={f("name")}>
          <Input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label={f("reference")}>
          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
          >
            {d.references.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label={f("scopeType")}>
          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={form.scopeType}
          onChange={(e) => setScopeType(Number(e.target.value))}
          >
            <option value={0}>{t("numberSeries.scope.Global")}</option>
            <option value={1}>{t("numberSeries.scope.Branch")}</option>
            <option value={2}>{t("numberSeries.scope.Warehouse")}</option>
          </select>
        </Field>
      <Field label={f("branchId")}>
        <ErpLookupCombobox
          lookupKey="branches"
          value={form.branchId}
          fallbackOptions={activeBranch ? [{ id: Number(activeBranch.id), code: activeBranch.code ?? activeBranch.name, name: activeBranch.name }] : []}
          placeholder={t("common.select")}
          searchPlaceholder={t("common.searchPlaceholder")}
          disabled={form.scopeType === 0}
          required={form.scopeType === 1}
          onChange={(value) => setForm((current) => ({ ...current, branchId: String(value), warehouseId: "" }))}
        />
      </Field>
      <Field label={f("warehouseId")}>
        <ErpLookupCombobox
          lookupKey="warehouses"
          value={form.warehouseId}
          parentId={Number(form.branchId) || undefined}
          fallbackOptions={[]}
          placeholder={t("common.select")}
          searchPlaceholder={t("common.searchPlaceholder")}
          disabled={form.scopeType !== 2}
          required={form.scopeType === 2}
          onChange={(value) => set("warehouseId", String(value))}
        />
      </Field>
        <div className="md:col-span-2">
          <NumberFormatBuilder
            value={form.format}
            onChange={(value) => set("format", value)}
            allowedTokens={["SERIES", "YYYY", "YY", "MM", "DD", "NUMBER"]}
            nextNumber={form.startingNumber}
            seriesCode={form.code || "ABC"}
            disabled={form.isGibCompliant}
          />
        </div>
        <Field label={f("resetPeriod")}>
          <select
            disabled={form.isGibCompliant}
            className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-60"
            value={form.resetPeriod}
            onChange={(e) => set("resetPeriod", Number(e.target.value))}
          >
            <option value={0}>{t("numberSeries.reset.Never")}</option>
            <option value={1}>{t("numberSeries.reset.Yearly")}</option>
            <option value={2}>{t("numberSeries.reset.Monthly")}</option>
            <option value={3}>{t("numberSeries.reset.Daily")}</option>
          </select>
        </Field>
        <Field label={f("startingNumber")}>
          <Input
            type="number"
            min={0}
            value={form.startingNumber}
            onChange={(e) => set("startingNumber", Number(e.target.value))}
          />
        </Field>
        <Field label={f("incrementBy")}>
          <Input
            type="number"
            min={1}
            value={form.incrementBy}
            onChange={(e) => set("incrementBy", Number(e.target.value))}
          />
        </Field>
        <Field label={f("maximumNumber")}>
          <Input
            type="number"
            min={1}
            value={form.maximumNumber}
            onChange={(e) => set("maximumNumber", Number(e.target.value))}
          />
        </Field>
        <Field label={f("reservationTimeoutMinutes")}>
          <Input
            type="number"
            min={1}
            max={1440}
            value={form.reservationTimeoutMinutes}
            onChange={(e) =>
              set("reservationTimeoutMinutes", Number(e.target.value))
            }
          />
        </Field>
        <Field label={f("priority")}>
          <Input
            type="number"
            value={form.priority}
            onChange={(e) => set("priority", Number(e.target.value))}
          />
        </Field>
        <Field label={f("channel")}>
          <Input
            value={form.channel}
            placeholder="WEB, B2B, STORE"
            onChange={(e) => set("channel", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label={f("scenario")}>
          <Input
            value={form.scenario}
            placeholder="TEMELFATURA, TICARIFATURA"
            onChange={(e) => set("scenario", e.target.value.toUpperCase())}
          />
        </Field>
        <div className="md:col-span-2 flex flex-wrap gap-5">
          {[
            "isGibCompliant",
            "allowManual",
            "isContinuous",
            "isDefault",
            "isActive",
          ].map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={
                  form.isGibCompliant &&
                  (key === "isContinuous" || key === "allowManual")
                }
                checked={Boolean(form[key as keyof typeof form])}
                onChange={(e) =>
                  key === "isGibCompliant"
                    ? setGibCompliant(e.target.checked)
                    : set(key, e.target.checked)
                }
              />
              {f(key)}
            </label>
          ))}
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(back)}
          >
            {t("common.cancel")}
          </Button>
          <Button disabled={saving}>
            {saving ? t("common.saving") : editId ? t("numberSeries.update") : t("numberSeries.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
