// Shared plan reader: a plan's `## Execution complete` record and its product
// advice, read beside and independently of the ordered slices.
import assert from "node:assert/strict";
import { test } from "node:test";

import { readPlanSlices } from "../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs";

const completedSlices = `# Plan

## Ordered slices

### 1. First outcome
Type: Behavior
Status: done
Accepted: The focused check passed.

### 2. Second outcome
Type: Structure
Status: done
`;

const expectedSlices = [
  {
    index: 1,
    name: "First outcome",
    type: "Behavior",
    status: "done",
    accepted: "The focused check passed.",
  },
  { index: 2, name: "Second outcome", type: "Structure", status: "done" },
];

test("readPlanSlices returns a recorded execution completion's product advice verbatim, including multi-line advice, beside unchanged slices", () => {
  const read = readPlanSlices(`${completedSlices}
## Execution complete

Product advice: Queue a follow-up story for card wording.
- Split the clock story before it grows.
- Keep the detail view as it is.

  Indented note kept as written.

## Learnings

- Not advice.
`);

  assert.equal(read.status, "interpreted");
  assert.deepEqual(read.slices, expectedSlices);
  assert.deepEqual(read.completion, {
    advice: `Queue a follow-up story for card wording.
- Split the clock story before it grows.
- Keep the detail view as it is.

  Indented note kept as written.`,
  });
});

test("readPlanSlices returns “no product change, because …” and “retrospective skipped” advice verbatim", () => {
  for (const advice of [
    "No product change, because the story outcome already holds.",
    "retrospective skipped",
  ]) {
    const read = readPlanSlices(
      `${completedSlices}\n## Execution complete\n\nProduct advice: ${advice}\n`,
    );
    assert.equal(read.status, "interpreted");
    assert.deepEqual(read.slices, expectedSlices);
    assert.deepEqual(read.completion, { advice });
  }
});

test("readPlanSlices returns a completion problem when the execution-complete record has no readable product advice", () => {
  for (const record of [
    "## Execution complete\n\nThe retrospective found nothing.\n",
    "## Execution complete\n\nProduct advice:\n\n## Learnings\n\nLater text.\n",
  ]) {
    const read = readPlanSlices(`${completedSlices}\n${record}`);
    assert.equal(read.status, "interpreted");
    assert.deepEqual(read.slices, expectedSlices);
    assert.deepEqual(Object.keys(read.completion), ["problem"]);
    assert.match(read.completion.problem, /Product advice:/);
  }
});

test("readPlanSlices returns no completion without an execution-complete record, including one only quoted in a fence", () => {
  const plain = readPlanSlices(completedSlices);
  assert.equal(plain.status, "interpreted");
  assert.deepEqual(plain.slices, expectedSlices);
  assert.equal("completion" in plain, false);

  const quoted = readPlanSlices(`# Plan

## Current decisions

\`\`\`markdown
## Execution complete

Product advice: <recommendations>
\`\`\`

${completedSlices.replace("# Plan\n\n", "")}`);
  assert.equal(quoted.status, "interpreted");
  assert.deepEqual(quoted.slices, expectedSlices);
  assert.equal("completion" in quoted, false);
});

test("readPlanSlices reads the completion record independently of uninterpretable slices", () => {
  const read = readPlanSlices(`## Ordered slices

### 1. Folded outcome
Type: Behavior
Status: merged into slice 2

## Execution complete

Product advice: retrospective skipped
`);
  assert.equal(read.status, "uninterpretable");
  assert.deepEqual(read.completion, { advice: "retrospective skipped" });
});
