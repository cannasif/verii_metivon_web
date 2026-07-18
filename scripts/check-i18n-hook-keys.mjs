#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const src = path.join(root, 'src');
const language = process.env.I18N_CHECK_LANG ?? 'tr';
const missing = new Set();
const cache = new Map();

function merge(base, overlay) {
  const output = { ...base };
  for (const [key, value] of Object.entries(overlay ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) output[key] = merge(output[key], value);
    else output[key] = value;
  }
  return output;
}

function hasKey(value, dottedKey) {
  let current = value;
  for (const segment of dottedKey.split('.')) {
    if (!current || typeof current !== 'object' || !(segment in current)) return false;
    current = current[segment];
  }
  return current !== undefined && current !== null && String(current).trim() !== '';
}

function namespaceBundle(namespace) {
  const cacheKey = `${language}:${namespace}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  let result = {};
  const shared = path.join(src, 'locales', language, `${namespace}.json`);
  if (fs.existsSync(shared)) {
    const parsed = JSON.parse(fs.readFileSync(shared, 'utf8'));
    result = merge(result, parsed[namespace] && typeof parsed[namespace] === 'object' ? parsed[namespace] : {});
    result = merge(result, parsed);
  }
  const feature = path.join(src, 'features', namespace, 'localization', `${language}.json`);
  if (fs.existsSync(feature)) result = merge(result, JSON.parse(fs.readFileSync(feature, 'utf8')));

  // Mirror the namespace compatibility layer in src/lib/i18n.ts so the
  // static test accepts every key shape that i18next exposes at runtime.
  const camelNamespace = namespace.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const namespacedValue = result[namespace] && typeof result[namespace] === 'object'
    ? result[namespace]
    : result;
  const camelNamespacedValue = result[camelNamespace] && typeof result[camelNamespace] === 'object'
    ? result[camelNamespace]
    : namespacedValue;
  result = {
    ...namespacedValue,
    ...result,
    [namespace]: namespacedValue,
    [camelNamespace]: camelNamespacedValue,
  };

  cache.set(cacheKey, result);
  return result;
}

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

function stringValue(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null;
}

function staticNamespaces(node) {
  const single = stringValue(node);
  if (single) return [single];
  if (!node || !ts.isArrayLiteralExpression(node)) return null;
  const values = node.elements.map(stringValue);
  return values.every(Boolean) ? values : null;
}

function objectStringProperty(node, propertyName) {
  if (!node || !ts.isObjectLiteralExpression(node)) return null;
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
    if (name === propertyName) return stringValue(property.initializer);
  }
  return null;
}

function hasObjectProperty(node, propertyName) {
  if (!node || !ts.isObjectLiteralExpression(node)) return false;
  return node.properties.some((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    const name = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
    return name === propertyName;
  });
}

function containingFunction(node) {
  let current = node.parent;
  while (current && !ts.isFunctionLike(current) && !ts.isSourceFile(current)) current = current.parent;
  return current;
}

for (const file of walk(src)) {
  const source = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  function findHooks(node) {
    if (ts.isVariableDeclaration(node)
      && ts.isObjectBindingPattern(node.name)
      && node.initializer
      && ts.isCallExpression(node.initializer)
      && ts.isIdentifier(node.initializer.expression)
      && node.initializer.expression.text === 'useTranslation') {
      const namespaces = staticNamespaces(node.initializer.arguments[0]);
      if (namespaces?.length) {
        const tElement = node.name.elements.find((element) => {
          const sourceName = element.propertyName && ts.isIdentifier(element.propertyName) ? element.propertyName.text : ts.isIdentifier(element.name) ? element.name.text : null;
          return sourceName === 't';
        });
        const bindingName = tElement && ts.isIdentifier(tElement.name) ? tElement.name.text : null;
        if (bindingName) {
          const keyPrefix = objectStringProperty(node.initializer.arguments[1], 'keyPrefix');
          const scope = containingFunction(node) ?? sourceFile;
          inspectCalls(scope, bindingName, namespaces, keyPrefix);
        }
      }
    }
    ts.forEachChild(node, findHooks);
  }

  function inspectCalls(scope, bindingName, namespaces, keyPrefix) {
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === bindingName) {
        const rawKey = stringValue(node.arguments[0]);
        if (rawKey) {
          const nsOverride = objectStringProperty(node.arguments[1], 'ns');
          const hasDefaultValue = hasObjectProperty(node.arguments[1], 'defaultValue');
          const effectiveNamespaces = nsOverride ? [nsOverride] : namespaces;
          const prefixedKey = keyPrefix && !rawKey.includes(':') ? `${keyPrefix}.${rawKey}` : rawKey;
          let candidates = effectiveNamespaces.map((namespace) => [namespace, prefixedKey]);
          if (prefixedKey.includes(':')) {
            const separator = prefixedKey.indexOf(':');
            candidates = [[prefixedKey.slice(0, separator), prefixedKey.slice(separator + 1)]];
          }
          // A literal defaultValue prevents a raw translation key from leaking
          // into the UI. Locale bundles are still parity-checked separately.
          if (!hasDefaultValue && !candidates.some(([namespace, key]) => hasKey(namespaceBundle(namespace), key))) {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
            missing.add(`${path.relative(root, file)}:${line} ${prefixedKey} [${effectiveNamespaces.join(', ')}]`);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(scope);
  }

  findHooks(sourceFile);
}

const rows = [...missing].sort();
if (rows.length) {
  console.error(`Hook translation key check (${language}) failed: ${rows.length} missing key(s).`);
  console.error(rows.slice(0, 300).join('\n'));
  if (rows.length > 300) console.error(`... ${rows.length - 300} more issue(s)`);
  process.exit(1);
}

console.log(`Hook translation key check (${language}): OK.`);
