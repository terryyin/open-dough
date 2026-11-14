import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import { importedModules } from "./pure-module-imports.mjs";

const modulePath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-start-eligibility.mjs",
    import.meta.url,
  ),
);

test("start eligibility: imports no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(modulePath);
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-start-eligibility.mjs"),
    ),
  );
  for (const specifier of specifiers) {
    assert.equal(
      specifier.startsWith("node:"),
      false,
      `unexpected Node built-in import: ${specifier}`,
    );
    assert.equal(
      /product-backlog-(store|home\.mjs|story-state-home)/.test(specifier),
      false,
      `unexpected filesystem wrapper import: ${specifier}`,
    );
  }
  const loaded = await import(pathToFileURL(modulePath).href);
  assert.equal(typeof loaded.deriveStartEligibility, "function");
});
