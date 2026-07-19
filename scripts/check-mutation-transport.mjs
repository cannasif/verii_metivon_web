import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../src', import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1');
const violations = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      visit(path);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name) || name === 'http-method-tunnel.ts') continue;
    const source = readFileSync(path, 'utf8');
    const pattern = /api\.post(?:<[^;\n]+?>)?\s*\([\s\S]{0,180}?[`'\"]([^`'\"]*\/(?:update|delete))(?:\?[^`'\"]*)?[`'\"]/gi;
    for (const match of source.matchAll(pattern)) {
      if (/\/bulk-(?:quotation|order|demand)\/update$/i.test(match[1])) continue;
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      violations.push(`${relative(root, path)}:${line} -> ${match[1]}`);
    }
  }
}

visit(root);
if (violations.length) {
  console.error('Mutation transport must use api.put/api.delete; the shared interceptor adds /update or /delete.');
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('Mutation transport contract passed.');
