import assert from "node:assert/strict";
import { test } from "node:test";
import { readPlanSlices } from "../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
const plan = (status) =>
  `# Plan\n## Ordered slices\n### 1. Deliver selected behavior\n**Type:** Behavior\n**Status:** ${status}\n**Proof:** Direct observation\n**Accepted proof:** Behavior passed\n`;
test("canonical bold labels carry slice completion and separate accepted evidence", () => {
  const read = readPlanSlices(plan("done"));
  assert.equal(read.status, "interpreted");
  assert.deepEqual(read.slices[0], {
    index: 1,
    name: "Deliver selected behavior",
    type: "Behavior",
    status: "done",
    proof: "Direct observation",
    accepted: "Behavior passed",
  });
  assert.equal(readPlanSlices(plan("merged")).status, "uninterpretable");
  const quoted = readPlanSlices(
    `${plan("planned")}\n\`\`\`md\n### 2. Quoted\n**Type:** Structure\n**Status:** done\n\`\`\`\n`,
  );
  assert.equal(quoted.slices.length, 1);
  assert.equal(quoted.slices[0].status, "planned");
});
