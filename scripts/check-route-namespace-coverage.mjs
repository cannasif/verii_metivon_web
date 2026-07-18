#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "src", "lib", "route-namespaces.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const routeModule = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const contracts = [
  {
    namespace: "number-format-builder",
    routes: [
      "/accounts/parameters",
      "/goods-receipts/parameters",
      "/goods-receipts/number-series/new",
      "/transfer-orders/parameters",
      "/purchase-orders/parameters",
      "/sales-orders/parameters",
      "/shipments/parameters",
      "/inventory-counts/parameters",
      "/accounting/parameters",
    ],
  },
];

const errors = [];
for (const contract of contracts) {
  for (const route of contract.routes) {
    const namespaces = routeModule.getNamespacesForPath(route);
    if (!namespaces.includes(contract.namespace)) {
      errors.push(`${route}: missing runtime namespace ${contract.namespace}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Route namespace coverage failed: ${errors.length} issue(s).`);
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Route namespace coverage: OK — ${contracts.reduce((count, item) => count + item.routes.length, 0)} route contract(s).`,
);
