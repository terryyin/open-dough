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

test("readPlanSlices reads a “## Slices” heading with the same slices as “## Ordered slices”", () => {
  const body = `
### 1. First outcome
Type: Behavior
Status: done
Proof: Run the focused check.
Accepted: The focused check passed.

### 2. Second outcome
Type: Structure
Status: planned
Proof: A prospective recipe alone.

## Later notes

### Not a slice
`;
  const ordered = readPlanSlices(`# Example\n\n## Ordered slices\n${body}`);
  const slices = readPlanSlices(`# Example\n\n## Slices\n${body}`);

  assert.equal(slices.status, "interpreted");
  assert.equal(slices.slices.length, 2);
  assert.deepEqual(slices, ordered);
});

test("readPlanSlices keeps unsupported status and missing slices sections uninterpretable under the “## Slices” heading", () => {
  const merged = readPlanSlices(`## Slices

### 1. Kept outcome
Type: Behavior
Status: done

### 2. Folded outcome
Type: Behavior
Status: merged into slice 1
`);
  assert.equal(merged.status, "uninterpretable");

  const neither = readPlanSlices(`# Plan

## Slice notes

### 1. Alone
Type: Behavior
Status: planned
`);
  assert.equal(neither.status, "uninterpretable");
  assert.match(neither.problem, /## Ordered slices/);
  assert.match(neither.problem, /## Slices/);
});

for (const [example, quote] of [
  [
    "a fenced “## Execution complete” record",
    "```markdown\n## Execution complete\n\nProduct advice: example only.\n```",
  ],
  [
    "fenced “### …” headings",
    "~~~markdown\n### Not a numbered slice\n### 9. Not a slice either\n~~~",
  ],
  [
    "a four-backtick fence not closed by an inner three-backtick line",
    "````markdown\n```text\n### Not a slice\n## Execution complete\n### 9. Not a slice either\n```\n````",
  ],
  [
    "inline code spans of backtick runs at the start of a line",
    "  ```` ```markdown ```` / `## Execution complete` / ```` ``` ````.",
  ],
]) {
  test(`readPlanSlices keeps every slice when a slice quotes ${example}`, () => {
    const read = readPlanSlices(`# Plan

## Ordered slices

### 1. Quote an example
Type: Behavior
Status: done
Proof: The guidance shows:

${quote}

### 2. After the quote
Type: Structure
Status: planned
`);

    assert.equal(read.status, "interpreted");
    assert.deepEqual(
      read.slices.map((slice) => [slice.index, slice.name]),
      [
        [1, "Quote an example"],
        [2, "After the quote"],
      ],
    );
    assert.equal(read.completion, undefined);
  });
}

test("readPlanSlices keeps a slice's own Type and Status when its Proof quotes fenced field lines", () => {
  const read = readPlanSlices(`# Plan

## Ordered slices

### 1. Quote fields
Type: Behavior
Status: done
Proof: The guidance shows
\`\`\`text
Status: merged into slice 2
Type: Structure
\`\`\`

### 2. After the quote
Type: Structure
Status: planned
`);

  assert.equal(read.status, "interpreted");
  assert.deepEqual(
    read.slices.map((slice) => [slice.index, slice.type, slice.status]),
    [
      [1, "Behavior", "done"],
      [2, "Structure", "planned"],
    ],
  );
  assert.equal(
    read.slices[0].proof,
    "The guidance shows\n```text\nStatus: merged into slice 2\nType: Structure\n```",
  );
});
