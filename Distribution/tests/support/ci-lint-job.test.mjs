// The lint job reports lint and the dashboard type-check as separate outcomes.
import assert from "node:assert/strict";
import test from "node:test";

import { jobs, steps, workflow } from "./ci-proof-action-fixtures.mjs";

test("the dashboard type-check runs when dependencies are installed and the run is not cancelled", () => {
  const lintJob = jobs(workflow).get("lint");
  const typeChecks = steps(lintJob ?? []).filter((step) =>
    /^ {8}run: npm run typecheck:dashboard$/m.test(step),
  );
  assert.equal(typeChecks.length, 1, "the lint job has one type-check step");

  const [typeCheck] = typeChecks;
  const conditions = typeCheck
    .split("\n")
    .filter((line) => line.startsWith("        if:"));
  assert.deepEqual(conditions, [
    "        if: ${{ !cancelled() && steps.npm.outcome == 'success' }}",
  ]);
});
