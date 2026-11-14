import assert from "node:assert/strict";
import { test } from "node:test";
import { readFakeGh } from "../src/fake-gh.mjs";
import { repeatDecision } from "../src/repeat-checks.mjs";

const runs = (...list) => readFakeGh({ runs: list }, ["run", "list"]);
const eligible = { eligible: true, runId: 7 };

test("a passed run needs no repeat", () => {
  const decision = repeatDecision(
    eligible,
    runs({ id: 7, status: "completed", conclusion: "success", attempt: 1 }),
  );
  assert.deepEqual(decision, { action: "none", label: "CI passed" });
});

test("a failed rerun requests no further repeat", () => {
  const decision = repeatDecision(
    eligible,
    runs({ id: 7, status: "completed", conclusion: "failure", attempt: 2 }),
  );
  assert.deepEqual(decision, {
    action: "none",
    label: "CI failed after rerun",
  });
});
