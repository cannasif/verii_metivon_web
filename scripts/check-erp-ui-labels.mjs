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

if (failures.length) {
  console.error(`ERP görünür metin denetimi başarısız (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("ERP görünür metin denetimi geçti: Türkçe alanlarda teknik ID ve İngilizce etiket yok.");
