#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const supportedLanguages = ['ar', 'de', 'en', 'es', 'fa', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'tr', 'zh'];
const adoptedFeatures = ['organization-management'];
const requiredPaths = ['api', 'pages', 'schemas', 'types', 'localization', 'index.ts', 'manifest.ts', 'permissions.ts', 'query-keys.ts'];
const errors = [];

const leafKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const next = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child) ? leafKeys(child, next) : [next];
});

for (const feature of adoptedFeatures) {
  const featureRoot = path.join(root, 'src', 'features', feature);
  for (const required of requiredPaths) {
    if (!fs.existsSync(path.join(featureRoot, required))) errors.push(`${feature}: missing ${required}`);
  }

  const referencePath = path.join(featureRoot, 'localization', 'tr.json');
  if (!fs.existsSync(referencePath)) continue;
  const referenceKeys = leafKeys(JSON.parse(fs.readFileSync(referencePath, 'utf8'))).sort();
  for (const language of supportedLanguages) {
    const localePath = path.join(featureRoot, 'localization', `${language}.json`);
    if (!fs.existsSync(localePath)) {
      errors.push(`${feature}: missing localization/${language}.json`);
      continue;
    }
    const keys = leafKeys(JSON.parse(fs.readFileSync(localePath, 'utf8'))).sort();
    if (JSON.stringify(keys) !== JSON.stringify(referenceKeys)) errors.push(`${feature}: ${language} localization schema differs from tr`);
  }
}

if (errors.length) {
  console.error(`Feature contract check failed: ${errors.length} issue(s).`);
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Feature contract check: OK — ${adoptedFeatures.length} adopted feature(s), ${supportedLanguages.length} languages.`);

