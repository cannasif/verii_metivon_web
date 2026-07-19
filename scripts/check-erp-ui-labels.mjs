import fs from "node:fs";

const locale = JSON.parse(fs.readFileSync(new URL("../src/locales/tr/erp.json", import.meta.url), "utf8"));
const forbiddenEnglishWords = /\b(?:account|accepted|actual|address|aisle|allocated|allow|attempt|available|branch|buyer|carrier|city|code|coordinate|cost|count|credit|currency|customer|customs|debit|declaration|default|delivery|discount|display|document|dossier|driver|exchange|expected|expiry|file|finalized|from|grand|history|inventory|issue|journal|last|ledger|level|linked|location|manufacture|maximum|movement|order|parent|payment|physical|position|posting|prices|priority|provider|purchase|receipt|reference|rejected|requested|reserved|sales|scenario|serial|shipment|source|storage|supplier|tax|total|tracking|type|under|unit|upload|valid|variance|vehicle|warehouse|zone)\b/i;

const failures = [];
for (const [key, value] of Object.entries(locale.fields ?? {})) {
  const label = String(value);
  if (/\bIDs?\b/i.test(label)) failures.push(`fields.${key}: teknik ID ifadesi içeriyor (${label})`);
  if (forbiddenEnglishWords.test(label)) failures.push(`fields.${key}: İngilizce iş etiketi içeriyor (${label})`);
}

const collectStrings = (value) =>
  value && typeof value === "object"
    ? Object.values(value).flatMap(collectStrings)
    : [String(value ?? "")];
const serializedFormValues = collectStrings(locale.forms ?? {}).join("\n");
if (/\b(?:accounts|journals|landed-cost-types)\b/i.test(serializedFormValues)) {
  failures.push("forms: çevrilmemiş teknik sayfa adı içeriyor");
}

const landedCostForm = fs.readFileSync(new URL("../src/features/import-dossier-management/ImportDossierCostCreatePage.tsx", import.meta.url), "utf8");
const erpFormConfigs = fs.readFileSync(new URL("../src/features/erp-form-management/configs.ts", import.meta.url), "utf8");
const importDossierConfig = erpFormConfigs.slice(
  erpFormConfigs.indexOf("export const importDossierForm"),
  erpFormConfigs.indexOf("export const landedCostTypeForm"),
);
if (/currencyCode\s*:\s*["']/.test(landedCostForm) || /<Field\s+k=["']currencyCode["']/.test(landedCostForm)) {
  failures.push("import-dossier cost: para birimi serbest metin olamaz; CurrencyId selector kullanılmalıdır");
}
if (/key:\s*["']currencyCode["'][\s\S]{0,120}type:\s*["']text["']/.test(importDossierConfig) || !/key:\s*["']currencyId["'][\s\S]{0,160}lookup:\s*["']currencies["']/.test(importDossierConfig)) {
  failures.push("import-dossier: para birimi CurrencyId ile currencies lookup'a bağlanmalıdır");
}
if (/key:\s*["']currencyCode["'][\s\S]{0,120}type:\s*["']text["']/.test(erpFormConfigs)) {
  failures.push("ERP formları: para birimi serbest metin olamaz; CurrencyId selector kullanılmalıdır");
}
for (const configName of ["accountForm", "journalForm", "importDossierForm", "tradeDossierForm"]) {
  const start = erpFormConfigs.indexOf(`export const ${configName}`);
  const end = erpFormConfigs.indexOf("export const ", start + 13);
  const config = erpFormConfigs.slice(start, end < 0 ? undefined : end);
  if (start < 0 || !/key:\s*["']currencyId["'][\s\S]{0,160}lookup:\s*["']currencies["']/.test(config)) {
    failures.push(`${configName}: para birimi CurrencyId ile currencies lookup'a bağlanmalıdır`);
  }
}
const accountingParameters = fs.readFileSync(new URL("../src/features/parameter-management/components/AccountingParametersPage.tsx", import.meta.url), "utf8");
if (!/defaultCurrencyId:\s*number/.test(accountingParameters) || !/lookupKey=["']currencies["']/.test(accountingParameters) || /set\(["']defaultCurrencyCode["']/.test(accountingParameters)) {
  failures.push("accounting parameters: varsayılan para birimi CurrencyId selector ile seçilmelidir");
}
for (const [fileName, idField, forbiddenSetter] of [
  ["ReceivingParametersPage.tsx", "inventoryCurrencyId", "inventoryCurrencyCode"],
  ["TransferParametersPage.tsx", "inventoryCurrencyId", "inventoryCurrencyCode"],
  ["ShippingParametersPage.tsx", "inventoryCurrencyId", "inventoryCurrencyCode"],
  ["InventoryCountParametersPage.tsx", "postingCurrencyId", "postingCurrencyCode"],
  ["EDocumentParametersPage.tsx", "defaultCurrencyId", "defaultCurrencyCode"],
]) {
  const page = fs.readFileSync(new URL(`../src/features/parameter-management/components/${fileName}`, import.meta.url), "utf8");
  if (!new RegExp(`${idField}:\\s*number`).test(page) || !/lookupKey=["']currencies["']/.test(page) || new RegExp(`set\\(["']${forbiddenSetter}["']`).test(page)) {
    failures.push(`${fileName}: para birimi kodu yazılamaz; CurrencyId selector zorunludur`);
  }
}
const landedCostDynamicFieldKeys = ["invoiceNumber", "invoiceDate", "paymentReference", "paymentDate", "foreignAmount", "description", "originalExchangeRate", "exchangeRate", "exchangeRateDate", "exchangeRateSource"];
for (const language of ["tr", "en", "de", "fr", "es", "it", "pt", "nl", "pl", "ru", "ar", "fa", "ja", "ko", "zh"]) {
  const target = JSON.parse(fs.readFileSync(new URL(`../src/locales/${language}/erp.json`, import.meta.url), "utf8"));
  for (const key of landedCostDynamicFieldKeys) {
    if (!target.fields?.[key]) failures.push(`${language}: fields.${key} ithalat masraf formu çevirisi eksik`);
  }
}

if (failures.length) {
  console.error(`ERP görünür metin denetimi başarısız (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("ERP görünür metin denetimi geçti: Türkçe alanlarda teknik ID ve İngilizce etiket yok.");
