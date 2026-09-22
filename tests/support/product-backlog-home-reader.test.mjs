// The pure canonical-home reader must stay free of filesystem and Node-only
// modules so a browser can share the same region/identity interpretation.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const readerPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs",
    import.meta.url,
  ),
);

const importPattern =
  /(?:import|export)\s+(?:[^'"\n]+from\s+)?["'](?<specifier>[^"']+)["']/g;

function importedModules(entryPath) {
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

test("importing the pure home reader pulls in no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(readerPath);

  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-home-reader.mjs"),
    ),
  );
  for (const specifier of specifiers) {
    assert.equal(
      specifier.startsWith("node:"),
      false,
      `unexpected Node built-in import: ${specifier}`,
    );
    assert.equal(
      specifier.includes("product-backlog-store"),
      false,
      `unexpected store import: ${specifier}`,
    );
    assert.equal(
      specifier.includes("product-backlog-home.mjs"),
      false,
      `unexpected filesystem home wrapper import: ${specifier}`,
    );
  }

  const loaded = await import(pathToFileURL(readerPath).href);
  assert.equal(typeof loaded.readHome, "function");
  assert.equal(typeof loaded.namedIdentity, "function");
  assert.equal(typeof loaded.impliedIdentity, "function");
});
