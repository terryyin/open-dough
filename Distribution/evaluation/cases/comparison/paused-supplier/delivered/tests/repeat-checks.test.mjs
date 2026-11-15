import assert from "node:assert/strict";
import { test } from "node:test";
import { readFakeGh } from "../src/fake-gh.mjs";
import { repeatDecision } from "../src/repeat-checks.mjs";

const runs = (...list) => readFakeGh({ runs: list }, ["run", "list"]);
const eligible = { eligible: true, runId: 7 };

test("a refused receipt requests no repeat", () => {
  const decision = repeatDecision({ eligible: false, runId: 7 }, runs());
  assert.deepEqual(decision, { action: "none", label: "Receipt refused" });
});

test("a receipt naming an unknown run requests no repeat", () => {
  const decision = repeatDecision(eligible, runs());
  assert.deepEqual(decision, { action: "none", label: "Run unknown" });
});

test("a failed first attempt requests one rerun", () => {
  const decision = repeatDecision(
    eligible,
    runs({ id: 7, status: "completed", conclusion: "failure", attempt: 1 }),
  );
  assert.deepEqual(decision, { action: "rerun", label: "Requesting CI rerun" });
});

test("a queued repeat reads as progress", () => {
  for (const status of ["queued", "in_progress"]) {
    const decision = repeatDecision(
      eligible,
      runs({ id: 7, status, conclusion: null, attempt: 2 }),
    );
    assert.deepEqual(decision, {
      action: "wait",
      label: "CI rerun in progress",
    });
  }
});

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
