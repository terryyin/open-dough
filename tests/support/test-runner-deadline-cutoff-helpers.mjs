import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  evaluated,
  input,
  producers,
  runAttempt,
  stepInputs,
  summaryStep,
} from "./ci-proof-action-fixtures.mjs";

export function declaredTestPart(part, temp) {
  const declared = producers.find((producer) => producer.job === "test");
  const context = { temp, part, parts: declared.parts };
  const [step] = declared.proof;
  return {
    inputs: Object.fromEntries(
      Object.entries(stepInputs(step)).map(([name, value]) => [
        name,
        evaluated(value, context),
      ]),
    ),
    report: (variable) => evaluated(input(declared.suite, variable), context),
  };
}

// Feeds the real runner's outcome/time files into the checked-in fragments
// action and returns the summary's per-file evidence under the tests entry.
export function replayCutoffFragments(t, outcomeText, timeText) {
  const proof = runAttempt(t);
  const temp = proof.runner("test", 1);
  const declared = declaredTestPart(1, temp);
  writeFileSync(declared.report("OPEN_DOUGH_TEST_OUTCOMES"), outcomeText);
  writeFileSync(declared.report("OPEN_DOUGH_TEST_TIMES"), timeText);
  const kept = proof.fragments("test", 1, temp, declared.inputs);
  assert.equal(kept.status, 0, `${kept.stdout}\n${kept.stderr}`);
  const summary = proof.summary(stepInputs(summaryStep).expect);
  assert.equal(summary.status, 0, summary.stderr);
  assert.deepEqual(summaryProblems(summary.written), []);
  const files = summary.written.entries
    .filter((entry) => entry.path === "tests")
    .flatMap((entry) => entry.evidence.flatMap((block) => block.files ?? []));
  return { summary, files };
}
