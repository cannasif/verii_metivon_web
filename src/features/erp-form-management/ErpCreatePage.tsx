import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApiEnvelope } from "@/features/erp-operation-management/types";
import type { ErpFormConfig, ErpLookups, FormField, FormValue } from "./types";
import { ErpLookupCombobox } from "./ErpLookupCombobox";
import { SerialEntryDialog } from "./SerialEntryDialog";
import { NumberSeriesCombobox } from "./NumberSeriesCombobox";
import { getBusinessFieldLabel } from "@/lib/erp-field-label";
const today = new Date().toISOString().slice(0, 10);
const isEmptyRequiredValue = (value: FormValue | undefined) => value === "" || value === null || value === undefined;
const defaults = (fields: FormField[]) =>
  Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.defaultValue ??
        (f.type === "checkbox" ? false : f.type === "date" ? today : ""),
    ]),
  );
export function ErpCreatePage({
  config,
}: {
  config: ErpFormConfig;
}): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editId = id ? Number(id) : null;
  const { t } = useTranslation("erp");
  const lookupQuery = useQuery({
    queryKey: ["erp-lookups"],
    queryFn: () => api.get<ApiEnvelope<ErpLookups>>("/api/erp-lookups"),
  });
  const lookups = lookupQuery.data?.data ?? {};
  const [header, setHeader] = useState<Record<string, FormValue>>(() =>
    defaults(config.fields),
  );
  const [lines, setLines] = useState<Record<string, FormValue>[]>(() =>
    config.lineFields ? [defaults(config.lineFields)] : [],
  );
  const [saving, setSaving] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const detailQuery = useQuery({
    queryKey: ["erp-form-detail", config.returnPath, editId],
    queryFn: () => api.get<ApiEnvelope<Record<string, FormValue> & { lines?: Record<string, FormValue>[] }>>(config.detailEndpoint!(editId!)),
    enabled: editId !== null && Number.isFinite(editId) && Boolean(config.detailEndpoint),
  });
  useEffect(() => {
    const record = detailQuery.data?.data;
    if (!record) return;
    setHeader((current) => Object.fromEntries(Object.keys(current).map((key) => [key, record[key] ?? current[key]])));
    if (config.lineFields && Array.isArray(record.lines)) {
      setLines(record.lines.map((line) => Object.fromEntries(config.lineFields!.map((field) => [field.key, line[field.key] ?? defaults(config.lineFields!)[field.key]]))));
    }
  }, [config.lineFields, detailQuery.data]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    const missingHeader = config.fields.some((field) => field.required && isEmptyRequiredValue(header[field.key]));
    const missingLine = config.lineFields?.some((field) => field.required && lines.some((line) => isEmptyRequiredValue(line[field.key]))) ?? false;
    if (missingHeader || missingLine) {
      toast.error(t("common.requiredFields", { defaultValue: "Zorunlu alanları doldurun." }));
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    try {
      setSaving(true);
      await api.post(
        editId !== null && config.updateEndpoint ? config.updateEndpoint(editId) : config.endpoint,
        config.buildRequest(header, lines, lookups),
      );
      toast.success(t("common.createSuccess"));
      navigate(config.returnPath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("common.createError"),
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="metivon-hero rounded-3xl p-6">
        <button
          type="button"
          onClick={() => navigate(config.returnPath)}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToList")}
        </button>
        <h1 className="text-3xl font-semibold">{t(`forms.${config.returnPath}.${editId !== null ? "editTitle" : "title"}`, { defaultValue: editId !== null ? t("common.edit") : config.title })}</h1>
        <p className="mt-2 text-white/75">{t(`forms.${config.returnPath}.description`, { defaultValue: config.description })}</p>
      </section>
      <form onSubmit={submit} noValidate className="space-y-5">
        <section className="metivon-panel rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-semibold">{t("common.generalInformation")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((f) => (
              <Field
                key={f.key}
                field={f}
                values={header}
                lookups={lookups}
                invalid={validationAttempted && Boolean(f.required) && isEmptyRequiredValue(header[f.key])}
                onChange={(v) => setHeader((s) => ({ ...s, [f.key]: v }))}
                onPatch={(patch) => setHeader((s) => ({...s,...patch}))}
              />
            ))}
          </div>
        </section>
        {config.lineFields ? (
          <section className="metivon-panel rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("common.documentLines")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("common.documentLinesHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setLines((v) => [...v, defaults(config.lineFields!)])
                }
              >
                <Plus />
                {t("common.addLine")}
              </Button>
            </div>
            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={index} className="rounded-xl border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {t("common.line", { number: index + 1 })}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      disabled={lines.length <= (config.minimumLines ?? 1)}
                      onClick={() =>
                        setLines((v) => v.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {config.lineFields!.map((f) => (
                      <Field
                        key={f.key}
                        field={f}
                        values={{ ...header, ...line }}
                        lookups={lookups}
                        invalid={validationAttempted && Boolean(f.required) && isEmptyRequiredValue(line[f.key])}
                        onChange={(value) =>
                          setLines((v) =>
                            v.map((x, i) =>
                              i === index ? { ...x, [f.key]: value } : x,
                            ),
                          )
                        }
                        onPatch={(patch) => setLines((v)=>v.map((x,i)=>i===index?{...x,...patch}:x))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(config.returnPath)}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={saving || lookupQuery.isLoading || detailQuery.isLoading}>
            {saving ? t("common.saving") : editId !== null ? t("common.edit") : t(`forms.${config.returnPath}.submit`, { defaultValue: config.submitLabel })}
          </Button>
        </div>
      </form>
    </div>
  );
}
function Field({
  field,
  values,
  lookups,
  onChange,
  onPatch,
  invalid,
}: {
  field: FormField;
  values: Record<string, FormValue>;
  lookups: ErpLookups;
  onChange: (value: FormValue) => void;
  onPatch: (patch: Record<string,FormValue>) => void;
  invalid: boolean;
}) {
  const { t, i18n } = useTranslation("erp");
  const value = values[field.key] ?? "";
  const options = (field.options ?? lookups[field.lookup ?? ""] ?? []).filter(
    (x) =>
      !field.filterBy ||
      !values[field.filterBy] ||
      String(x[field.filterItemKey ?? field.filterBy]) ===
        String(values[field.filterBy]),
  );
  const parentValue = field.filterBy ? values[field.filterBy] : undefined;
  const parentId = typeof parentValue === "number" ? parentValue : undefined;
  const selectedWarehouseId = Number(values[field.warehouseField??"warehouseId"]) || Number(lookups.salesOrders?.find(x=>x.id===Number(values.salesOrderId))?.warehouseId) || undefined;
  const selectedBranchId = Number(values[field.branchField??"branchId"]) || Number(lookups.warehouses?.find(x=>x.id===selectedWarehouseId)?.branchId) || undefined;
  return (
    <div className={`space-y-2 [&_[aria-invalid=true]]:border-destructive [&_[aria-invalid=true]]:ring-2 [&_[aria-invalid=true]]:ring-destructive/20 ${field.span === 2 ? "md:col-span-2" : ""}`}>
      <Label>
        {getBusinessFieldLabel(field.key, t(`fields.${field.key}`, { defaultValue: field.label }), i18n.resolvedLanguage ?? i18n.language)}
        {field.required ? <span className="ms-1 font-bold text-destructive" aria-hidden="true">*</span> : null}
      </Label>
      {field.type === "number-series" ? (
        <NumberSeriesCombobox module={field.numberSeriesModule!} reference={field.numberSeriesReference!} branchId={selectedBranchId} warehouseId={selectedWarehouseId} value={String(value)} onChange={onChange} placeholder={t("numberSeries.select",{defaultValue:"Numara serisi seçin"})} invalid={invalid}/>
      ) : field.type === "serial-entry" || field.type === "serial-select" ? (
        <SerialEntryDialog value={String(value)} onChange={onChange} expectedQuantity={field.quantityField?Number(values[field.quantityField]??0):undefined} inventoryOptions={field.type==="serial-select"?(lookups[field.lookup??"inventorySerials"]??[]).filter(x=>!values.productId||String(x.productId)===String(values.productId)):undefined} onGs1Data={field.type==="serial-entry"?(data)=>onPatch({...(data.lotNumber?{lotNumber:data.lotNumber}:{}),...(data.manufactureDate?{manufactureDate:data.manufactureDate}:{}),...(data.expiryDate?{expiryDate:data.expiryDate}:{})}):undefined} invalid={invalid}/>
      ) : field.type === "textarea" ? (
        <Textarea
          required={field.required}
          aria-invalid={invalid}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "checkbox" ? (
        <label aria-invalid={invalid} className="flex h-10 items-center gap-2 rounded-md border px-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm">{t("common.yes")}</span>
        </label>
      ) : field.type === "select" ? (
        <ErpLookupCombobox
          lookupKey={field.lookup ?? `static-${field.key}`}
          staticOnly={Boolean(field.options)}
          value={String(value)}
          parentId={parentId}
          fallbackOptions={options}
          placeholder={t("common.select")}
          searchPlaceholder={t("common.searchPlaceholder")}
          required={field.required}
          invalid={invalid}
          disabled={Boolean(field.filterBy && !parentId)}
          onChange={onChange}
        />
      ) : (
        <Input
          required={field.required}
          aria-invalid={invalid}
          type={field.type}
          step={field.step}
          value={String(value)}
          onChange={(e) =>
            onChange(
              field.type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
        />
      )}
    </div>
  );
}
