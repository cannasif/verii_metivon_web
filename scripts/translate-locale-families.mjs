#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allLanguages = ['de','fr','es','it','pt','nl','pl','ru','ar','fa','zh','ja','ko'];
const languageArgument = process.argv.find((argument) => argument.startsWith('--languages='));
const requestedLanguages = languageArgument?.split('=')[1].split(',').filter(Boolean) ?? [];
const languages = requestedLanguages.length ? allLanguages.filter((language) => requestedLanguages.includes(language)) : allLanguages;
const requested = new Set(process.argv.slice(2).filter((argument) => !argument.startsWith('--languages=')));
const delimiter = '__V3RII_SPLIT__';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const flatten = (value, prefix = '', output = []) => {
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      const full = prefix ? `${prefix}.${index}` : String(index);
      if (isObject(child) || Array.isArray(child)) flatten(child, full, output);
      else output.push([full, child]);
    });
    return output;
  }
  for (const [key, child] of Object.entries(value ?? {})) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (isObject(child) || Array.isArray(child)) flatten(child, full, output);
    else output.push([full, child]);
  }
  return output;
};
const getPath = (target, dottedPath) => dottedPath.split('.').reduce((value, key) => value?.[key], target);
const setPath = (target, dottedPath, value) => {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const nextIsIndex = /^\d+$/.test(parts[index + 1]);
    if (!isObject(cursor[parts[index]]) && !Array.isArray(cursor[parts[index]])) cursor[parts[index]] = nextIsIndex ? [] : {};
    cursor = cursor[parts[index]];
  }
  cursor[parts.at(-1)] = value;
};
const protect = (value) => {
  const placeholders = [];
  const text = value.replace(/\{\{[^{}]+\}\}|\{\d+\}/g, (match) => {
    const token = `ZXQVAR${placeholders.length}ZXQ`;
    placeholders.push(match);
    return token;
  });
  return { text, placeholders };
};
const restore = (value, placeholders) => placeholders.reduce((text, placeholder, index) => text.replaceAll(`ZXQVAR${index}ZXQ`, placeholder), value);
const translateBatch = async (values, language, sourceLanguage) => {
  const protectedValues = values.map(protect);
  const lineSeparated = language === 'ja' || language === 'ko';
  const joined = protectedValues.map((item) => item.text).join(lineSeparated ? '\n' : `\n${delimiter}\n`);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', sourceLanguage);
  url.searchParams.set('tl', language);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', joined);
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      const translated = payload[0].map((part) => part[0]).join('');
      const pieces = lineSeparated
        ? translated.split(/\r?\n/).map((piece) => piece.trim()).filter(Boolean)
        : translated.split(new RegExp(`\\s*${delimiter}\\s*`)).map((piece) => piece.trim());
      if (pieces.length !== values.length) {
        if (values.length === 1) return [restore(translated.trim(), protectedValues[0].placeholders)];
        const individual = [];
        for (const value of values) individual.push(...await translateBatch([value], language, sourceLanguage));
        return individual;
      }
      return pieces.map((piece, index) => restore(piece, protectedValues[index].placeholders));
    }
    if (attempt === 5) throw new Error(`${language}: translation failed (${response.status})`);
    await sleep(attempt * 900);
  }
};

const families = [];
const sharedRoot = path.join(root, 'src/locales');
for (const fileName of fs.readdirSync(path.join(sharedRoot, 'tr')).filter((name) => name.endsWith('.json'))) {
  const name = fileName.replace(/\.json$/, '');
  if (requested.size && !requested.has(name)) continue;
  const tr = path.join(sharedRoot, 'tr', fileName);
  families.push({ label:`shared/${name}`, name, sourceFile:tr, sourceLanguage:'auto', targetFile:(language) => path.join(sharedRoot, language, fileName) });
}
const featuresRoot = path.join(root, 'src/features');
for (const feature of fs.readdirSync(featuresRoot)) {
  if (requested.size && !requested.has(feature)) continue;
  const directory = path.join(featuresRoot, feature, 'localization');
  if (!fs.existsSync(directory)) continue;
  const tr = path.join(directory, 'tr.json');
  if (!fs.existsSync(tr)) continue;
  families.push({ label:`feature/${feature}`, name:feature, sourceFile:tr, sourceLanguage:'auto', targetFile:(language) => path.join(directory, `${language}.json`) });
}

if (!families.length) throw new Error(`No locale family matched: ${[...requested].join(', ')}`);
for (const family of families) {
  const source = JSON.parse(fs.readFileSync(family.sourceFile, 'utf8'));
  const entries = flatten(source);
  for (const language of languages) {
    const file = family.targetFile(language);
    const target = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const missing = entries.filter(([key, value]) => getPath(target, key) === undefined && typeof value === 'string');
    const scalarMissing = entries.filter(([key, value]) => getPath(target, key) === undefined && typeof value !== 'string');
    scalarMissing.forEach(([key, value]) => setPath(target, key, value));
    for (let start = 0; start < missing.length; start += 24) {
      const batch = missing.slice(start, start + 24);
      const translated = await translateBatch(batch.map(([, value]) => value), language, family.sourceLanguage);
      batch.forEach(([key], index) => setPath(target, key, translated[index]));
      await sleep(100);
    }
    if (missing.length || scalarMissing.length || !fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `${JSON.stringify(target, null, 2)}\n`, 'utf8');
      console.log(`${family.label}/${language}: ${missing.length + scalarMissing.length} value(s) added`);
    }
  }
}
