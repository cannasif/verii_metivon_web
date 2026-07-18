#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const languages = ['tr','en','de','fr','es','it','pt','nl','pl','ru','ar','fa','zh','ja','ko'];
const flatten = (value, prefix = '', output = {}) => {
  for (const [key, child] of Object.entries(value ?? {})) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, output);
    else output[full] = child;
  }
  return output;
};
const read = (file) => flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
const errors = [];
let checkedNamespaces = 0;

function checkFamily(label, filesByLanguage) {
  const referenceFile = filesByLanguage.tr;
  if (!referenceFile) return;
  checkedNamespaces += 1;
  const reference = read(referenceFile);
  for (const language of languages) {
    const file = filesByLanguage[language];
    if (!file) { errors.push(`${label}: missing ${language}`); continue; }
    const resource = read(file);
    for (const key of Object.keys(reference)) {
      if (!(key in resource) || String(resource[key] ?? '').trim() === '') errors.push(`${label}/${language}: missing ${key}`);
    }
    // Language bundles may intentionally contain compatibility aliases or newer
    // keys. They are harmless; this gate is specifically about missing UI text.
  }
}

const sharedRoot = path.join(root, 'src', 'locales');
const sharedNamespaces = fs.readdirSync(path.join(sharedRoot, 'tr')).filter((name) => name.endsWith('.json'));
for (const fileName of sharedNamespaces) {
  const files = Object.fromEntries(languages.map((language) => [language, path.join(sharedRoot, language, fileName)]).filter(([,file]) => fs.existsSync(file)));
  checkFamily(`shared/${fileName}`, files);
}

const featuresRoot = path.join(root, 'src', 'features');
for (const feature of fs.readdirSync(featuresRoot)) {
  const localization = path.join(featuresRoot, feature, 'localization');
  if (!fs.existsSync(localization)) continue;
  const files = Object.fromEntries(languages.map((language) => [language, path.join(localization, `${language}.json`)]).filter(([,file]) => fs.existsSync(file)));
  checkFamily(`feature/${feature}`, files);
}

// Dynamic ERP forms build translation keys at runtime (`fields.${field.key}`).
// Static i18n scanners cannot see those references, so keep the form contract
// and every language bundle in sync explicitly.
const erpConfigFiles = [
  path.join(root, 'src', 'features', 'erp-form-management', 'configs.ts'),
  path.join(root, 'src', 'features', 'erp-operation-management', 'configs.ts'),
];
const dynamicFieldKeys = new Set();
for (const configFile of erpConfigFiles) {
  const source = fs.readFileSync(configFile, 'utf8');
  for (const match of source.matchAll(/\bkey:\s*["']([^"']+)["']/g)) dynamicFieldKeys.add(match[1]);
}
const requiredStatusKeys = ['Asset','Liability','Equity','Revenue','Expense','Amount','Quantity','Weight','Volume','Manual'];
for (const language of languages) {
  const erpFile = path.join(sharedRoot, language, 'erp.json');
  const erp = JSON.parse(fs.readFileSync(erpFile, 'utf8'));
  for (const key of dynamicFieldKeys) {
    if (String(erp.fields?.[key] ?? '').trim() === '') errors.push(`shared/erp.json/${language}: missing dynamic fields.${key}`);
  }
  for (const key of requiredStatusKeys) {
    if (String(erp.statuses?.[key] ?? '').trim() === '') errors.push(`shared/erp.json/${language}: missing statuses.${key}`);
  }
  if (String(erp.fields?.id ?? '').trim() === '') errors.push(`shared/erp.json/${language}: fields.id is required`);
}

if (errors.length) {
  console.error(`Metivon locale check failed: ${errors.length} issue(s).`);
  console.error(errors.slice(0, 500).join('\n'));
  if (errors.length > 500) console.error(`... ${errors.length - 500} more issue(s)`);
  process.exit(1);
}
console.log(`Metivon locale check: OK — ${checkedNamespaces} namespace(s), ${languages.length} languages.`);
