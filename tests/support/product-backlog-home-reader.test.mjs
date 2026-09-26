// The pure canonical-home reader must stay free of filesystem and Node-only
// modules so a browser can share the same region/identity interpretation.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";

const readerPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs",
    import.meta.url,
  ),
);

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

test("a correction story's plan records the story identity while a plan-homed correction names its own", async () => {
  const { readHome, namedIdentity } = await import(
    pathToFileURL(readerPath).href
  );
  const seed = `---\nid: SEED-030\n---\n\n# Notes\n\n<a id="order-notes"></a>\n\n### Order notes\n\n**Identity:** SEED-030#order-notes\n\n**Goal:** Newest first.\n`;
  const storyPlan = `# Order notes\n\n**Identity:** SEED-030#order-notes\n\n## Findings\n`;
  const legacyPlan = `# Repair notes\n\n**Identity:** slice-plans/060-repair\n\n## Findings\n`;

  const story = readHome(seed, "seeds/SEED-030.md#order-notes");
  assert.equal(namedIdentity(story), "SEED-030#order-notes");
  assert.equal(
    namedIdentity(readHome(storyPlan, "slice-plans/070/PLAN.md")),
    namedIdentity(story),
  );
  assert.equal(
    namedIdentity(readHome(legacyPlan, "slice-plans/060-repair/PLAN.md")),
    "slice-plans/060-repair",
  );
});
