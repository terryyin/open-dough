import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const finish = read("dough-execute-plan/references/finish-or-stop.md");

// The documented record is the fenced Markdown example under its heading.
const recordHeading = "## Record execution completion";
const recordStart = finish.indexOf(`\n${recordHeading}\n`);
assert.notEqual(recordStart, -1, `missing ${recordHeading}`);
const recordExample = /\n```markdown\n(?<body>[\s\S]*?)\n```\n/.exec(
  finish.slice(recordStart),
)?.groups.body;
assert.ok(
  recordExample,
  `missing fenced record example under ${recordHeading}`,
);

test("finish-or-stop's documented record is read by the plan reader as the plan's product advice", () => {
  const advice = "Queue a follow-up story for card wording.";
  assert.match(recordExample, /<advice>/, "record example has no advice slot");
  const plan = readPlanSlices(`# Plan

## Ordered slices

### 1. Only outcome
Type: Behavior
Status: done

${recordExample.replace("<advice>", advice)}
`);
  assert.equal(plan.status, "interpreted");
  assert.equal(plan.slices.length, 1);
  assert.deepEqual(plan.completion, { advice });
});
