#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const mainFile = path.join(src, 'main.tsx');
const main = fs.readFileSync(mainFile, 'utf8');
const violations = [];

const contracts = [
  {
    name: 'Tooltip',
    usage: /(?:<Tooltip\b|\bTooltipTrigger\b|\bTooltipContent\b)/,
    provider: 'TooltipProvider',
    importSource: "./components/ui/tooltip",
  },
  {
    name: 'React Query',
    usage: /\b(?:useQuery|useMutation|useInfiniteQuery|useQueryClient)\s*\(/,
    provider: 'QueryClientProvider',
    importSource: '@tanstack/react-query',
  },
  {
    name: 'i18next',
    usage: /\buseTranslation\s*\(/,
    provider: 'I18nextProvider',
    importSource: 'react-i18next',
  },
  {
    name: 'Theme',
    usage: /\buseTheme\s*\(/,
    provider: 'ThemeProvider',
    importSource: './components/theme-provider',
  },
];

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) result.push(full);
  }
  return result;
}

const files = walk(src);
for (const contract of contracts) {
  const usedBy = files.filter((file) => contract.usage.test(fs.readFileSync(file, 'utf8')));
  if (!usedBy.length) continue;

  const importsProvider = new RegExp(`\\b${contract.provider}\\b`).test(main)
    && main.includes(contract.importSource);
  const providerStart = main.indexOf(`<${contract.provider}`);
  const appPosition = main.indexOf('<App />');
  const providerEnd = main.indexOf(`</${contract.provider}>`);

  if (!importsProvider) {
    violations.push(`${contract.name}: ${contract.provider} must be imported by src/main.tsx.`);
    continue;
  }
  if (providerStart < 0 || providerStart > appPosition || providerEnd < appPosition) {
    violations.push(`${contract.name}: ${contract.provider} must wrap <App /> in src/main.tsx.`);
  }
}

if (violations.length) {
  console.error(`Runtime provider contract check failed: ${violations.length} issue(s).`);
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('Runtime provider contract check: OK.');
