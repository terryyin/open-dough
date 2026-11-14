// Checks that start from a repeat request.
import assert from "node:assert/strict";
import { test } from "node:test";
import { repeatDecision } from "../src/repeat-checks.mjs";
import { eligible, run } from "./support/repeat-fixture.mjs";

test("a failed first attempt requests one rerun", () => {
  const decision = repeatDecision(eligible, run({ conclusion: "failure" }));
  assert.deepEqual(decision, { action: "rerun", label: "Requesting CI rerun" });
});

test("a queued repeat reads as progress", () => {
  for (const status of ["queued", "in_progress"]) {
    const decision = repeatDecision(eligible, run({ status, attempt: 2 }));
    assert.deepEqual(decision, {
      action: "wait",
      label: "CI rerun in progress",
    });
  }
});
