// Shared plan-slice reader: established Ordered slices section, done versus
// prospective proof, and uninterpretable layout — without filesystem access.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";

const readerPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs",
    import.meta.url,
  ),
);

const { readPlanSlices } = await import(pathToFileURL(readerPath).href);

test("importing the pure plan reader pulls in no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(readerPath);

  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-plan-reader.mjs"),
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
      specifier.includes("product-backlog-plan.mjs"),
      false,
      `unexpected filesystem plan wrapper import: ${specifier}`,
    );
  }

  assert.equal(typeof readPlanSlices, "function");
});

test("readPlanSlices interprets ordered slices and separates accepted evidence from prospective proof", () => {
  const read = readPlanSlices(`# Example

## Ordered slices

### 1. First outcome
Type: Behavior
Status: done
Proof: Run the focused check.
Accepted: The focused check passed after the fixture commit.

### 2. Second outcome
Type: Structure
Status: planned
Proof: A prospective recipe alone.

### 3. Third outcome
Type: Behavior
Status: done (2026-09-22)
Proof: Needs evidence.
`);

  assert.equal(read.status, "interpreted");
  assert.equal(read.slices.length, 3);
  assert.deepEqual(read.slices[0], {
    index: 1,
    name: "First outcome",
    type: "Behavior",
    status: "done",
    proof: "Run the focused check.",
    accepted: "The focused check passed after the fixture commit.",
  });
  assert.deepEqual(read.slices[1], {
    index: 2,
    name: "Second outcome",
    type: "Structure",
    status: "planned",
    proof: "A prospective recipe alone.",
  });
  assert.equal(read.slices[2].status, "done");
  assert.equal(read.slices[2].accepted, undefined);
  assert.equal("accepted" in read.slices[2], false);
  assert.equal(read.slices[2].proof, "Needs evidence.");
});

test("readPlanSlices treats a missing or malformed ordered-slices section as uninterpretable, not zero slices", () => {
  assert.equal(
    readPlanSlices("# No section\n\n### 1. Alone\n").status,
    "uninterpretable",
  );
  assert.equal(
    readPlanSlices(`## Ordered slices

### First without a number
Type: Behavior
Status: planned
`).status,
    "uninterpretable",
  );
  assert.equal(
    readPlanSlices(`## Ordered slices

### 1. Missing status
Type: Behavior
Proof: Only a recipe.
`).status,
    "uninterpretable",
  );
  const empty = readPlanSlices(`## Ordered slices

`);
  assert.equal(empty.status, "interpreted");
  assert.deepEqual(empty.slices, []);
});
