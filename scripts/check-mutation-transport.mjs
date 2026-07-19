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
    const sourcePath = relative(root, path);
    const addViolation = (index, reason) => {
      const line = source.slice(0, index).split(/\r?\n/).length;
      violations.push(`${sourcePath}:${line} -> ${reason}`);
    };

    if (sourcePath !== join('lib', 'axios.ts')) {
      const defaultAxiosImport = /import\s+axios\s+from\s+['"]axios['"]/g;
      for (const match of source.matchAll(defaultAxiosImport)) {
        addViolation(match.index, 'shared api client must be used instead of a separate Axios client');
      }
    }

    const nativeAxiosMutation = /axios\.(?:put|delete)\s*\(/gi;
    for (const match of source.matchAll(nativeAxiosMutation)) {
      addViolation(match.index, 'native axios PUT/DELETE is forbidden');
    }

    const nativeFetchMutation = /fetch\s*\([\s\S]{0,500}?method\s*:\s*['"](?:PUT|DELETE)['"]/gi;
    for (const match of source.matchAll(nativeFetchMutation)) {
      addViolation(match.index, 'fetch PUT/DELETE is forbidden');
    }

    const nativeMethodEscape = /useNativeHttpMethod/g;
    for (const match of source.matchAll(nativeMethodEscape)) {
      addViolation(match.index, 'native HTTP method escape hatch is forbidden');
    }

    const pattern = /api\.post(?:<[^;\n]+?>)?\s*\([\s\S]{0,180}?[`'\"]([^`'\"]*\/(?:update|delete))(?:\?[^`'\"]*)?[`'\"]/gi;
    for (const match of source.matchAll(pattern)) {
      if (/\/bulk-(?:quotation|order|demand)\/update$/i.test(match[1])) continue;
      addViolation(match.index, `${match[1]} must be expressed as api.put/api.delete`);
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
