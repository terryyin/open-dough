// Checks that start from the landing's receipt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { repeatDecision } from "../src/repeat-checks.mjs";
import { eligible, runs } from "./support/repeat-fixture.mjs";

test("a refused receipt requests no repeat", () => {
  const decision = repeatDecision({ eligible: false, runId: 7 }, runs());
  assert.deepEqual(decision, { action: "none", label: "Receipt refused" });
});

test("a receipt naming an unknown run requests no repeat", () => {
  const decision = repeatDecision(eligible, runs());
  assert.deepEqual(decision, { action: "none", label: "Run unknown" });
});
