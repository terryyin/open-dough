// Pure backlog document (and its plan helpers) must stay free of filesystem
// and Node-only modules so the dashboard can share listing interpretation.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";

const documentPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs",
    import.meta.url,
  ),
);

test("importing the pure backlog document pulls in no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(documentPath);

  assert.ok(
    [...visited].some((path) => path.endsWith("product-backlog-document.mjs")),
  );
  assert.ok(
    [...visited].some((path) => path.endsWith("product-backlog-plan.mjs")),
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

  const loaded = await import(pathToFileURL(documentPath).href);
  assert.equal(typeof loaded.parseBacklog, "function");
});
