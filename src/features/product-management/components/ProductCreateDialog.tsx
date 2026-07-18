import { useState, type FormEvent, type ReactElement } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productApi } from "../api/product-api";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
export function ProductCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}): ReactElement {
  const queryClient = useQueryClient();
  const [save, setSave] = useState(false);
  const q = useQuery({
    queryKey: ["product-definitions"],
    queryFn: productApi.getDefinitions,
    enabled: open,
  });
  const d = q.data?.data;
  const def = (x?: { id: number; isDefault: boolean }[]) =>
    x?.find((i) => i.isDefault)?.id;
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const n = (k: string) => Number(f.get(k) ?? 0);
    if (["productCategoryId", "productGroupId", "baseUnitId", "purchaseTaxGroupId", "salesTaxGroupId"].some((key) => n(key) <= 0)) {
      toast.error("Zorunlu seçim alanlarını doldurun.");
      return;
    }
    try {
      setSave(true);
      await productApi.create({
        code: String(f.get("code") ?? ""),
        name: String(f.get("name") ?? ""),
        searchName: String(f.get("searchName") ?? ""),
        description: String(f.get("description") ?? ""),
        productType: n("productType"),
        lifecycleStatus: n("lifecycleStatus"),
        trackingType: n("trackingType"),
        valuationMethod: n("valuationMethod"),
        procurementType: n("procurementType"),
        productCategoryId: n("productCategoryId"),
        productGroupId: n("productGroupId"),
        brandId: n("brandId") || null,
        baseUnitId: n("baseUnitId"),
        purchaseTaxGroupId: n("purchaseTaxGroupId"),
        salesTaxGroupId: n("salesTaxGroupId"),
        countryOfOriginCode: String(f.get("countryOfOriginCode") ?? ""),
        customsTariffCode: String(f.get("customsTariffCode") ?? ""),
        manufacturerCode: String(f.get("manufacturerCode") ?? ""),
        netWeight: n("netWeight") || null,
        grossWeight: n("grossWeight") || null,
        volume: n("volume") || null,
        shelfLifeDays: n("shelfLifeDays") || null,
        isPurchasable: f.get("isPurchasable") === "on",
        isSellable: f.get("isSellable") === "on",
        isInventoryTracked: f.get("isInventoryTracked") === "on",
        units: [],
        barcodes: [],
        branchSettings: [],
        translations: [],
      });
      toast.success("Ürün oluşturuldu.");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ürün oluşturulamadı.",
      );
    } finally {
      setSave(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Yeni Stok / Ürün Kartı</DialogTitle>
          <DialogDescription>
            Ürün ana verisi, izleme ve mali parametrelerini tanımlayın.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <F l="Ürün Kodu">
              <Input name="code" required />
            </F>
            <F l="Ürün Adı">
              <Input name="name" required />
            </F>
            <F l="Arama Adı">
              <Input name="searchName" />
            </F>
            <F l="Kategori">
              <LookupSelectField
                key={`c-${def(d?.categories)}`}
                name="productCategoryId"
                lookupKey="productCategories"
                options={d?.categories ?? []}
                required
                defaultValue={def(d?.categories)}
              />
            </F>
            <F l="Ürün Grubu">
              <LookupSelectField
                key={`g-${def(d?.groups)}`}
                name="productGroupId"
                lookupKey="productGroups"
                options={d?.groups ?? []}
                required
                defaultValue={def(d?.groups)}
              />
            </F>
            <F l="Marka">
              <LookupSelectField
                key={`b-${def(d?.brands)}`}
                name="brandId"
                lookupKey="brands"
                options={d?.brands ?? []}
                defaultValue={def(d?.brands) ?? ""}
              />
            </F>
            <F l="Temel Birim">
              <LookupSelectField
                key={`u-${def(d?.units)}`}
                name="baseUnitId"
                lookupKey="units"
                options={d?.units ?? []}
                required
                defaultValue={def(d?.units)}
              />
            </F>
            <F l="Alış Vergi Grubu">
              <LookupSelectField
                key={`pt-${def(d?.taxGroups)}`}
                name="purchaseTaxGroupId"
                lookupKey="taxGroups"
                options={d?.taxGroups ?? []}
                required
                defaultValue={def(d?.taxGroups)}
              />
            </F>
            <F l="Satış Vergi Grubu">
              <LookupSelectField
                key={`st-${def(d?.taxGroups)}`}
                name="salesTaxGroupId"
                lookupKey="taxGroups"
                options={d?.taxGroups ?? []}
                required
                defaultValue={def(d?.taxGroups)}
              />
            </F>
            <F l="Ürün Tipi">
              <select
                name="productType"
                className={selectClass}
                defaultValue="1"
              >
                <option value="1">Ticari Mal</option>
                <option value="2">Hizmet</option>
                <option value="3">Hammadde</option>
                <option value="4">Yarı Mamul</option>
                <option value="5">Mamul</option>
                <option value="6">Sarf</option>
                <option value="7">Ambalaj</option>
                <option value="8">Sabit Kıymet</option>
              </select>
            </F>
            <F l="Takip Tipi">
              <select
                name="trackingType"
                className={selectClass}
                defaultValue="0"
              >
                <option value="0">Takipsiz</option>
                <option value="1">Lot</option>
                <option value="2">Seri</option>
              </select>
            </F>
            <F l="Tedarik Tipi">
              <select
                name="procurementType"
                className={selectClass}
                defaultValue="1"
              >
                <option value="1">Satın Alma</option>
                <option value="2">Üretim</option>
                <option value="3">Her İkisi</option>
              </select>
            </F>
            <input type="hidden" name="lifecycleStatus" value="1" />
            <input type="hidden" name="valuationMethod" value="1" />
            <F l="Menşei Ülke Kodu">
              <Input name="countryOfOriginCode" maxLength={2} />
            </F>
            <F l="GTİP">
              <Input name="customsTariffCode" />
            </F>
            <F l="Üretici Kodu">
              <Input name="manufacturerCode" />
            </F>
            <F l="Net Ağırlık">
              <Input name="netWeight" type="number" min="0" step="0.001" />
            </F>
            <F l="Brüt Ağırlık">
              <Input name="grossWeight" type="number" min="0" step="0.001" />
            </F>
            <F l="Hacim">
              <Input name="volume" type="number" min="0" step="0.001" />
            </F>
            <F l="Raf Ömrü (Gün)">
              <Input name="shelfLifeDays" type="number" min="0" />
            </F>
            <div className="lg:col-span-3">
              <F l="Açıklama">
                <Textarea name="description" />
              </F>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <C n="isPurchasable" l="Satın Alınabilir" />
            <C n="isSellable" l="Satılabilir" />
            <C n="isInventoryTracked" l="Stok Takibi Yapılır" />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={save || q.isLoading}>
              {save ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function F({ l, children }: { l: string; children: ReactElement }) {
  return (
    <div className="space-y-2">
      <Label>{l}</Label>
      {children}
    </div>
  );
}
function LookupSelectField({ name, lookupKey, options, defaultValue, required }: {
  name: string;
  lookupKey: string;
  options: { id: number; code: string; name: string }[];
  defaultValue?: number | string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue == null ? "" : String(defaultValue));
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <ErpLookupCombobox lookupKey={lookupKey} value={value} fallbackOptions={options.map((item) => ({ ...item }))}
        placeholder="Seçiniz" searchPlaceholder="Kod veya ad ara..." required={required}
        onChange={(next) => setValue(String(next))} />
    </>
  );
}
function C({ n, l }: { n: string; l: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" name={n} defaultChecked className="h-4 w-4" />
      {l}
    </label>
  );
}
