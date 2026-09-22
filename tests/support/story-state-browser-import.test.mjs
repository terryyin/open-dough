// Pure story-state reader must stay free of filesystem and Node-only modules
// so the dashboard can share preparation interpretation.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";

const readerPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs",
    import.meta.url,
  ),
);

test("importing the pure story-state reader pulls in no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(readerPath);

  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state.mjs"),
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
  assert.equal(typeof loaded.readStoryState, "function");
});
