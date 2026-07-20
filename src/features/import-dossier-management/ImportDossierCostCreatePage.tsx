import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, RefreshCw } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
import { useSystemSettingsStore } from "@/stores/system-settings-store";

type Lookup = { id: number; code: string; name: string };
type CurrencyLookup = Lookup & { isoCode: string; symbol: string; decimalPlaces: number };
type Lookups = { landedCostTypes: Lookup[]; partners: Lookup[]; currencies: CurrencyLookup[] };
type Envelope<T> = { data: T };
type ExchangeRateItem = { currencyCode: string; unit: number; forexBuying: number; forexSelling: number | null; instrumentType: "Currency" | "PreciousMetal"; instrumentRateDate: string | null };
type ExchangeRateSnapshot = { source: string; rateDate: string; retrievedAtUtc: string; isStale: boolean; rates: ExchangeRateItem[] };
type ApiResponse<T> = { success: boolean; message?: string; data?: T };
type CostForm = {
  landedCostTypeId: string; amountType: string; allocationMethod: string; sourceType: string; supplierId: string;
  invoiceNumber: string; invoiceDate: string; paymentReference: string; paymentDate: string; currencyId: string;
  foreignAmount: string; originalExchangeRate: string; exchangeRate: string; exchangeRateDate: string; exchangeRateSource: string; description: string;
};

const emptyLookups: Lookups = { landedCostTypes: [], partners: [], currencies: [] };

export function ImportDossierCostCreatePage(): ReactElement {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["erp", "common"]);
  const defaultCurrencyId = useSystemSettingsStore((state) => state.settings.defaultCurrencyId ?? 0);
  const defaultCurrencyCode = useSystemSettingsStore((state) => state.settings.defaultCurrencyCode ?? "TRY");
  const [lookups, setLookups] = useState<Lookups>(emptyLookups);
  const [rates, setRates] = useState<ExchangeRateSnapshot | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<CostForm>({
    landedCostTypeId: "", amountType: "2", allocationMethod: "", sourceType: "1", supplierId: "",
    invoiceNumber: "", invoiceDate: "", paymentReference: "", paymentDate: "", currencyId: "", foreignAmount: "",
    originalExchangeRate: "", exchangeRate: "", exchangeRateDate: "", exchangeRateSource: "", description: "",
  });

  const loadRates = async (forceRefresh = false) => {
    setRateLoading(true);
    try {
      const response = await api.get<ApiResponse<ExchangeRateSnapshot>>("/api/exchange-rates/latest", { params: forceRefresh ? { forceRefresh: true } : undefined });
      if (response.success && response.data) setRates(response.data);
    } finally { setRateLoading(false); }
  };

  useEffect(() => {
    void Promise.all([api.get<Envelope<Lookups>>("/api/erp-lookups"), api.get<ApiResponse<ExchangeRateSnapshot>>("/api/exchange-rates/latest")])
      .then(([lookupResponse, rateResponse]) => {
        setLookups(lookupResponse.data);
        if (rateResponse.success && rateResponse.data) setRates(rateResponse.data);
        const preferred = lookupResponse.data.currencies.find((x) => x.id === defaultCurrencyId)
          ?? lookupResponse.data.currencies.find((x) => x.isoCode === defaultCurrencyCode);
        if (preferred) {
          const snapshot = rateResponse.data ?? null;
          const isBase = preferred.id === defaultCurrencyId || preferred.isoCode === defaultCurrencyCode;
          const item = snapshot?.rates.find((x) => x.currencyCode === preferred.isoCode);
          const quotedRate = item ? (item.forexSelling ?? item.forexBuying) / Math.max(item.unit, 1) : null;
          const initialRate = isBase ? 1 : quotedRate;
          setForm((current) => ({ ...current, currencyId: String(preferred.id), originalExchangeRate: initialRate ? String(initialRate) : "", exchangeRate: initialRate ? String(initialRate) : "", exchangeRateDate: isBase ? new Date().toISOString().slice(0, 10) : (item?.instrumentRateDate ?? snapshot?.rateDate ?? ""), exchangeRateSource: isBase ? "BaseCurrency" : (snapshot?.source ?? "") }));
        }
      });
  }, [defaultCurrencyCode, defaultCurrencyId]);

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const selectedCurrency = useMemo(() => lookups.currencies.find((x) => String(x.id) === form.currencyId), [form.currencyId, lookups.currencies]);
  const isBaseCurrency = selectedCurrency?.id === defaultCurrencyId || selectedCurrency?.isoCode === defaultCurrencyCode;

  const applyCurrency = (currency: CurrencyLookup, snapshot: ExchangeRateSnapshot | null = rates) => {
    const isBase = currency.id === defaultCurrencyId || currency.isoCode === defaultCurrencyCode;
    const item = snapshot?.rates.find((x) => x.currencyCode === currency.isoCode);
    const quotedRate = item ? (item.forexSelling ?? item.forexBuying) / Math.max(item.unit, 1) : null;
    const originalRate = isBase ? 1 : quotedRate;
    setForm((current) => ({
      ...current,
      currencyId: String(currency.id),
      originalExchangeRate: originalRate ? String(originalRate) : "",
      exchangeRate: originalRate ? String(originalRate) : "",
      exchangeRateDate: isBase ? new Date().toISOString().slice(0, 10) : (item?.instrumentRateDate ?? snapshot?.rateDate ?? ""),
      exchangeRateSource: isBase ? "BaseCurrency" : (snapshot?.source ?? ""),
    }));
  };

  const selectCurrency = (value: number | "") => {
    if (!value) {
      setForm((current) => ({ ...current, currencyId: "", originalExchangeRate: "", exchangeRate: "", exchangeRateDate: "", exchangeRateSource: "" }));
      return;
    }
    const selected = lookups.currencies.find((x) => x.id === value);
    if (selected) applyCurrency(selected);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const tradeDossierId = id;
    if (!tradeDossierId || !form.landedCostTypeId || !form.currencyId || !form.foreignAmount || !form.originalExchangeRate || !form.exchangeRate) return;
    setBusy(true);
    try {
      await api.post(`/api/trade-dossiers/${tradeDossierId}/costs`, {
        landedCostTypeId: Number(form.landedCostTypeId), amountType: Number(form.amountType), allocationMethod: form.allocationMethod ? Number(form.allocationMethod) : null,
        sourceType: Number(form.sourceType), supplierId: form.supplierId ? Number(form.supplierId) : null, invoiceNumber: form.invoiceNumber || null,
        invoiceDate: form.invoiceDate || null, paymentReference: form.paymentReference || null, paymentDate: form.paymentDate || null,
        currencyId: Number(form.currencyId), foreignAmount: Number(form.foreignAmount), originalExchangeRate: Number(form.originalExchangeRate),
        exchangeRate: Number(form.exchangeRate), exchangeRateDate: form.exchangeRateDate || null, exchangeRateSource: form.exchangeRateSource || null,
        description: form.description || null, manualAllocations: null,
      });
      await queryClient.invalidateQueries({ queryKey: ["trade-dossiers"] });
      navigate(`/trade-dossiers/${tradeDossierId}`);
    } finally { setBusy(false); }
  };

  const invoice = form.sourceType === "1";
  const rateMissing = Boolean(form.currencyId && !isBaseCurrency && !form.originalExchangeRate);
  return <div className="mx-auto max-w-5xl space-y-6">
    <section className="metivon-hero rounded-3xl p-7 text-white"><p className="text-xs font-semibold uppercase tracking-[.24em] text-white/70">{t("pages.trade-dossiers.eyebrow")}</p><h1 className="mt-2 text-3xl font-semibold">{t("forms.import-dossier-cost.title")}</h1><p className="mt-2 text-white/75">{t("forms.import-dossier-cost.description")}</p></section>
    <form onSubmit={submit} className="grid grid-cols-1 gap-5 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-2">
      <LookupField label={t("nav.landedCostTypes")} required invalid={submitted && !form.landedCostTypeId}><ErpLookupCombobox lookupKey="landedCostTypes" value={form.landedCostTypeId} fallbackOptions={lookups.landedCostTypes} placeholder={t("common.select")} searchPlaceholder={t("common.searchPlaceholder")} required invalid={submitted && !form.landedCostTypeId} onChange={(value) => set("landedCostTypeId", String(value))}/></LookupField>
      <div><Label>{t("fields.sourceType")}</Label><select value={form.sourceType} onChange={(e) => set("sourceType", e.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3">{["PurchaseInvoice","PaymentReceipt","BankReceipt","CustomsAssessment","Other"].map((key,index)=><option key={key} value={String(index+1)}>{t(`sourceTypes.${key}`)}</option>)}</select></div>
      <LookupField label={t("fields.supplierId")}><ErpLookupCombobox lookupKey="partners" value={form.supplierId} fallbackOptions={lookups.partners} placeholder={t("common.select")} searchPlaceholder={t("common.searchPlaceholder")} onChange={(value) => set("supplierId", String(value))}/></LookupField>
      {invoice ? <><CostField form={form} set={set} t={t} submitted={submitted} k="invoiceNumber" required/><CostField form={form} set={set} t={t} submitted={submitted} k="invoiceDate" type="date"/></> : <><CostField form={form} set={set} t={t} submitted={submitted} k="paymentReference" required/><CostField form={form} set={set} t={t} submitted={submitted} k="paymentDate" type="date"/></>}
      <LookupField label={t("fields.currencyId")} required invalid={submitted && !form.currencyId}><ErpLookupCombobox lookupKey="currencies" value={form.currencyId} fallbackOptions={lookups.currencies} placeholder={t("common.select")} searchPlaceholder={t("common.searchPlaceholder")} required invalid={submitted && !form.currencyId} onChange={selectCurrency}/></LookupField>
      <CostField form={form} set={set} t={t} submitted={submitted} k="foreignAmount" type="number" required/>
      <div className="rounded-2xl border bg-muted/20 p-4 md:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{t("fields.exchangeRateInformation")}</p><p className="text-xs text-muted-foreground">{t("fields.exchangeRateInformationHelp")}</p></div><Button type="button" variant="outline" size="sm" disabled={rateLoading} onClick={()=>void loadRates(true)}><RefreshCw className={rateLoading?"animate-spin":""}/>{t("common:common.refresh")}</Button></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2"><CostField form={form} set={set} t={t} submitted={submitted} k="originalExchangeRate" type="number" required readOnly/><CostField form={form} set={set} t={t} submitted={submitted} k="exchangeRate" type="number" required/><CostField form={form} set={set} t={t} submitted={submitted} k="exchangeRateDate" type="date" readOnly/><CostField form={form} set={set} t={t} submitted={submitted} k="exchangeRateSource" readOnly displayValue={isBaseCurrency ? defaultCurrencyCode : form.exchangeRateSource.startsWith("TCMB") ? "TCMB" : form.exchangeRateSource}/></div>
        {rateMissing ? <p className="mt-3 flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4"/>{t("fields.exchangeRateUnavailable")}</p> : form.originalExchangeRate ? <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600"><BadgeCheck className="h-4 w-4"/>{t(isBaseCurrency?"fields.baseCurrencyRate":"fields.exchangeRateLoaded")}</p> : null}
      </div>
      <CostField form={form} set={set} t={t} submitted={submitted} k="description" className="md:col-span-2"/>
      <div className="col-span-full flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => navigate(id ? `/trade-dossiers/${id}` : "/trade-dossiers")}>{t("common.cancel")}</Button><Button disabled={busy}>{busy ? t("common.saving") : t("forms.import-dossier-cost.submit")}</Button></div>
    </form>
  </div>;
}

function LookupField({label,required,invalid,children}:{label:string;required?:boolean;invalid?:boolean;children:ReactElement}) { return <div><Label className={invalid?"text-destructive":undefined}>{label}{required&&<span className="text-destructive"> *</span>}</Label><div className="mt-2">{children}</div></div>; }
function CostField({form,set,t,submitted,k,type="text",required=false,readOnly=false,className="",displayValue}:{form:CostForm;set:(key:keyof CostForm,value:string)=>void;t:(key:string)=>string;submitted:boolean;k:keyof CostForm;type?:string;required?:boolean;readOnly?:boolean;className?:string;displayValue?:string}) { const invalid=submitted&&required&&!form[k]; return <div className={className}><Label className={invalid?"text-destructive":undefined}>{t(`fields.${k}`)}{required&&<span className="text-destructive"> *</span>}</Label><Input className={`mt-2 ${invalid?"border-destructive ring-1 ring-destructive":""}`} type={type} step={type==="number"?"0.000001":undefined} required={required} readOnly={readOnly} value={displayValue??form[k]} onChange={(e)=>set(k,e.target.value)}/></div>; }
