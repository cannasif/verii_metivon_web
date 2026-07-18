import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
type Lookup = { id: number; code: string; name: string };
type Lookups = { landedCostTypes: Lookup[]; partners: Lookup[] };
type Envelope<T> = { data: T };
export function ImportDossierCostCreatePage(): ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("erp");
  const [lookups, setLookups] = useState<Lookups>({
    landedCostTypes: [],
    partners: [],
  });
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    landedCostTypeId: "",
    amountType: "2",
    allocationMethod: "",
    sourceType: "1",
    supplierId: "",
    invoiceNumber: "",
    invoiceDate: "",
    paymentReference: "",
    paymentDate: "",
    currencyCode: "TRY",
    foreignAmount: "0",
    exchangeRate: "1",
    description: "",
  });
  useEffect(() => {
    void api
      .get<Envelope<Lookups>>("/api/erp-lookups")
      .then((x) => setLookups(x.data));
  }, []);
  const set = (key: string, value: string) =>
    setForm((v) => ({ ...v, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/api/import-dossiers/${id}/costs`, {
        landedCostTypeId: Number(form.landedCostTypeId),
        amountType: Number(form.amountType),
        allocationMethod: form.allocationMethod
          ? Number(form.allocationMethod)
          : null,
        sourceType: Number(form.sourceType),
        supplierId: form.supplierId ? Number(form.supplierId) : null,
        invoiceNumber: form.invoiceNumber || null,
        invoiceDate: form.invoiceDate || null,
        paymentReference: form.paymentReference || null,
        paymentDate: form.paymentDate || null,
        currencyCode: form.currencyCode,
        foreignAmount: Number(form.foreignAmount),
        exchangeRate: Number(form.exchangeRate),
        description: form.description || null,
        manualAllocations: null,
      });
      navigate(`/import-dossiers/${id}`);
    } finally {
      setBusy(false);
    }
  };
  const invoice = form.sourceType === "1";
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-cyan-200">
          {t("pages.import-dossiers.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {t("forms.import-dossier-cost.title")}
        </h1>
        <p className="mt-2 text-slate-300">
          {t("forms.import-dossier-cost.description")}
        </p>
      </section>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-5 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-2"
      >
        <div>
          <Label>{t("nav.landedCostTypes")}</Label>
          <div className="mt-2">
            <ErpLookupCombobox lookupKey="landedCostTypes" value={form.landedCostTypeId} fallbackOptions={lookups.landedCostTypes}
              placeholder={t("common.select")} searchPlaceholder={t("common.searchPlaceholder")} required
              onChange={(value) => set("landedCostTypeId", String(value))} />
          </div>
        </div>
        <div>
          <Label>{t("fields.sourceType")}</Label>
          <select
            value={form.sourceType}
            onChange={(e) => set("sourceType", e.target.value)}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3"
          >
            <option value="1">{t("sourceTypes.PurchaseInvoice")}</option>
            <option value="2">{t("sourceTypes.PaymentReceipt")}</option>
            <option value="3">{t("sourceTypes.BankReceipt")}</option>
            <option value="4">{t("sourceTypes.CustomsAssessment")}</option>
            <option value="5">{t("sourceTypes.Other")}</option>
          </select>
        </div>
        <div>
          <Label>{t("fields.supplierId")}</Label>
          <div className="mt-2">
            <ErpLookupCombobox lookupKey="partners" value={form.supplierId} fallbackOptions={lookups.partners}
              placeholder={t("common.select")} searchPlaceholder={t("common.searchPlaceholder")}
              onChange={(value) => set("supplierId", String(value))} />
          </div>
        </div>
        {invoice ? (
          <>
            <Field k="invoiceNumber" required />
            <Field k="invoiceDate" type="date" />
          </>
        ) : (
          <>
            <Field k="paymentReference" required />
            <Field k="paymentDate" type="date" />
          </>
        )}
        {["currencyCode", "foreignAmount", "exchangeRate", "description"].map(
          (k) => (
            <Field
              key={k}
              k={k}
              type={
                ["foreignAmount", "exchangeRate"].includes(k)
                  ? "number"
                  : "text"
              }
              required={k !== "description"}
            />
          ),
        )}
        <div className="col-span-full flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/import-dossiers/${id}`)}
          >
            {t("common.cancel")}
          </Button>
          <Button disabled={busy}>
            {busy ? t("common.saving") : t("forms.import-dossier-cost.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
  function Field({
    k,
    type = "text",
    required = false,
  }: {
    k: string;
    type?: string;
    required?: boolean;
  }) {
    return (
      <div>
        <Label>{t(`fields.${k}`)}</Label>
        <Input
          className="mt-2"
          type={type}
          step={type === "number" ? "0.0001" : undefined}
          required={required}
          value={form[k as keyof typeof form]}
          onChange={(e) => set(k, e.target.value)}
        />
      </div>
    );
  }
}
