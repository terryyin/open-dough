// Walks a pure module's relative import graph so tests can assert that a
// browser-shared reader never pulls in filesystem or Node-only modules.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Match module specifiers only (from "...", bare import "..."), including
// multiline named imports, without treating ordinary string assignments as
// imports.
const importPattern = /(?:from\s+|import\s+)["'](?<specifier>[^"']+)["']/g;

export function importedModules(entryPath) {
  const pending = [entryPath];
  const visited = new Set();
  const specifiers = new Set();

  while (pending.length > 0) {
    const path = pending.pop();
    if (visited.has(path)) {
      continue;
    }
    visited.add(path);
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match.groups.specifier;
      specifiers.add(specifier);
      if (!specifier.startsWith(".")) {
        continue;
      }
      const resolved = join(dirname(path), specifier);
      pending.push(resolved.endsWith(".mjs") ? resolved : `${resolved}.mjs`);
    }
  }

  return { visited, specifiers };
}
