#!/usr/bin/env node
// node native-import-closure.mjs ROOT MODULE...
// Prints, one per line and sorted, each MODULE and every module it reaches
// through relative imports (`import … from "./…"`, `export … from "../…"`,
// `import "./…"`, or `import("./…")` with a literal path), as paths relative
// to ROOT. A native evidence identity hashes this closure so a change to any
// module a journey's command runs changes the identity.
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const relativeImport =
  /(?:\bfrom|^\s*import|\bimport\s*\()\s*["'](\.{1,2}\/[^"']+)["']/gmu;

const [root, ...modules] = process.argv.slice(2);
if (!root || modules.length === 0) {
  process.stderr.write("usage: native-import-closure.mjs ROOT MODULE...\n");
  process.exit(2);
}

const seen = new Set();
const pending = modules.map((module) => resolve(root, module));
while (pending.length > 0) {
  const file = pending.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  for (const [, specifier] of readFileSync(file, "utf8").matchAll(
    relativeImport,
  )) {
    pending.push(join(dirname(file), specifier));
  }
}
const closure = [...seen].map((file) => relative(root, file)).sort();
process.stdout.write(`${closure.join("\n")}\n`);
