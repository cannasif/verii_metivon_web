#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const languages = ['tr','en','de','fr','es','it','pt','nl','pl','ru','ar','fa','zh','ja','ko'];
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const mergeMissing = (target, source) => {
  if (Array.isArray(source)) return target === undefined ? structuredClone(source) : target;
  if (!isObject(source)) return target === undefined ? source : target;
  const output = isObject(target) ? target : {};
  for (const [key, value] of Object.entries(source)) output[key] = mergeMissing(output[key], value);
  return output;
};

const families = [];
const sharedRoot = path.join(root, 'src/locales');
for (const fileName of new Set(languages.flatMap((language) => {
  const directory = path.join(sharedRoot, language);
  return fs.existsSync(directory) ? fs.readdirSync(directory).filter((name) => name.endsWith('.json')) : [];
}))) {
  families.push({
    label: `shared/${fileName}`,
    file: (language) => path.join(sharedRoot, language, fileName),
  });
}
const featuresRoot = path.join(root, 'src/features');
for (const feature of fs.readdirSync(featuresRoot)) {
  const directory = path.join(featuresRoot, feature, 'localization');
  if (!fs.existsSync(directory)) continue;
  families.push({
    label: `feature/${feature}`,
    file: (language) => path.join(directory, `${language}.json`),
  });
}

for (const family of families) {
  let canonical = {};
  for (const language of languages) {
    const file = family.file(language);
    if (fs.existsSync(file)) canonical = mergeMissing(canonical, JSON.parse(fs.readFileSync(file, 'utf8')));
  }
  for (const language of ['tr', 'en']) {
    const file = family.file(language);
    const current = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const completed = mergeMissing(current, canonical);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(completed, null, 2)}\n`, 'utf8');
  }
}
console.log(`Canonicalized ${families.length} locale families into tr/en reference schemas.`);
