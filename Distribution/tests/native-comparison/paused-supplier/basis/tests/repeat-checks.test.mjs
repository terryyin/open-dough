import assert from "node:assert/strict";
import { test } from "node:test";
import { readFakeGh } from "../src/fake-gh.mjs";
import { repeatDecision } from "../src/repeat-checks.mjs";

const runs = (...list) => readFakeGh({ runs: list }, ["run", "list"]);

test("a refused receipt requests no repeat", () => {
  const decision = repeatDecision({ eligible: false, runId: 7 }, runs());
  assert.deepEqual(decision, { action: "none", label: "Receipt refused" });
});

test("a receipt naming an unknown run requests no repeat", () => {
  const decision = repeatDecision({ eligible: true, runId: 7 }, runs());
  assert.deepEqual(decision, { action: "none", label: "Run unknown" });
});

test("a passed run needs no repeat", () => {
  const decision = repeatDecision(
    { eligible: true, runId: 7 },
    runs({ id: 7, status: "completed", conclusion: "success", attempt: 1 }),
  );
  assert.deepEqual(decision, { action: "none", label: "CI passed" });
});
