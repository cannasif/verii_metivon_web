#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allLanguages = ['de','fr','es','it','pt','nl','pl','ru','ar','fa','zh','ja','ko'];
const requestedLanguages = process.argv.slice(2);
const languages = requestedLanguages.length ? allLanguages.filter((language) => requestedLanguages.includes(language)) : allLanguages;
const delimiter = '__V3RII_SPLIT__';
const source = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en/erp.json'), 'utf8'));

const flatten = (value, prefix = '', output = []) => {
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, output);
    else output.push([full, String(child)]);
  }
  return output;
};
const setPath = (target, dottedPath, value) => {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) cursor = cursor[parts[index]] ??= {};
  cursor[parts.at(-1)] = value;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const translateBatch = async (values, language) => {
  const lineSeparated = language === 'ja' || language === 'ko';
  const text = values.join(lineSeparated ? '\n' : `\n${delimiter}\n`);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', language);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      const translated = payload[0].map((part) => part[0]).join('');
      const pieces = lineSeparated
        ? translated.split(/\r?\n/).map((piece) => piece.trim()).filter(Boolean)
        : translated.split(new RegExp(`\\s*${delimiter}\\s*`));
      if (pieces.length !== values.length) throw new Error(`${language}: batch split mismatch (${pieces.length}/${values.length})`);
      return pieces.map((piece) => piece.trim());
    }
    if (attempt === 4) throw new Error(`${language}: translation request failed (${response.status})`);
    await sleep(attempt * 750);
  }
};

const entries = [
  ...flatten(source.fields, 'fields'),
  ...flatten(source.pages, 'pages'),
  ...flatten(source.forms, 'forms'),
  ...flatten(source.statuses, 'statuses'),
  ...flatten(source.nav, 'nav'),
  ...flatten(source.sourceTypes, 'sourceTypes'),
  ...flatten(source.documentTypes, 'documentTypes'),
];
for (const language of languages) {
  const file = path.join(root, `src/locales/${language}/erp.json`);
  const target = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (let start = 0; start < entries.length; start += 35) {
    const batch = entries.slice(start, start + 35);
    const translated = await translateBatch(batch.map(([, value]) => value), language);
    batch.forEach(([key], index) => setPath(target, key, translated[index]));
    await sleep(120);
  }
  fs.writeFileSync(file, `${JSON.stringify(target, null, 2)}\n`, 'utf8');
  console.log(`${language}: ${entries.length} ERP values translated`);
}
