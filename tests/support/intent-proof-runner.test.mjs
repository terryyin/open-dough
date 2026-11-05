import assert from "node:assert/strict";
import { test } from "node:test";
import { declaredLocations } from "../../dashboard/server/intentLocationsSettings.ts";
import { proofMeasureOf } from "../../dashboard/src/proofCases.ts";
import { durationWords } from "../../dashboard/src/proofDurationWords.ts";
import {
  proofKindOf,
  runnerProblemOf,
  unrecordedReferenceOf,
} from "../../dashboard/src/proofKinds.ts";

test("fractional durations are proof measures and read rounded", () => {
  const measure = proofMeasureOf(
    {
      attempts: 1,
      durationMs: 42.375,
      finishedAt: "2026-11-04T00:00:00.000Z",
      commit: "a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4",
    },
    "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
  );
  assert.equal(measure?.durationMs, 42.375);
  assert.equal(durationWords(42.375), "42 ms");
  assert.equal(durationWords(999.6), "1.0 s");
});

test("a location's runner is read as its proof is", () => {
  const settings = JSON.stringify({
    intent: {
      locations: [
        {
          path: "web/tests",
          kind: "typescript",
          runner: "vitest",
          proof: "web/tests/proof",
        },
        { path: "web/other", kind: "typescript", runner: 3 },
        { path: "e2e/features", kind: "gherkin", runner: "" },
      ],
    },
  });
  assert.deepEqual(declaredLocations(settings), {
    kind: "locations",
    locations: [
      {
        path: "web/tests",
        kind: "typescript",
        runner: "vitest",
        proof: "web/tests/proof",
      },
      { path: "web/other", kind: "typescript" },
      { path: "e2e/features", kind: "gherkin" },
    ],
  });
});

test("gherkin and python imply their proof kind; typescript and javascript take it from the runner", () => {
  assert.equal(proofKindOf("gherkin", undefined)?.words.caseHeader, "Scenario");
  assert.equal(proofKindOf("python", "pytest")?.words.caseHeader, "Test case");
  for (const kind of ["typescript", "javascript"]) {
    assert.equal(proofKindOf(kind, undefined), undefined);
    assert.equal(proofKindOf(kind, "vitest")?.words.inventory(2), "2 tests");
    assert.equal(
      proofKindOf(kind, "playwright")?.words.family,
      "Playwright tests",
    );
    assert.equal(
      proofKindOf(kind, "playwright")?.words.reference,
      "dough-test-optimization/references/playwright-proof.md",
    );
    assert.equal(
      proofKindOf(kind, "node:test")?.words.family,
      "Node test files",
    );
    assert.equal(
      proofKindOf(kind, "node:test")?.words.reference,
      "dough-test-optimization/references/node-test-proof.md",
    );
    assert.equal(proofKindOf(kind, "node:test")?.words.cases(1), "1 test case");
    assert.equal(
      proofKindOf(kind, "node:test")?.words.cases(2),
      "2 test cases",
    );
    assert.equal(proofKindOf(kind, "node:test")?.words.caseHeader, "Test case");
    assert.equal(proofKindOf(kind, "gherkin"), undefined);
  }
  assert.equal(proofKindOf(undefined, "vitest"), undefined);
});

test("a declared proof's runner problem is its kind's: undeclared or unsupported only where the runner selects the format", () => {
  for (const kind of ["typescript", "javascript"]) {
    assert.equal(runnerProblemOf(kind, undefined), "undeclared");
    assert.equal(runnerProblemOf(kind, "jest"), "unsupported");
    assert.equal(runnerProblemOf(kind, "vitest"), undefined);
    assert.equal(runnerProblemOf(kind, "playwright"), undefined);
    assert.equal(runnerProblemOf(kind, "node:test"), undefined);
  }
  assert.equal(runnerProblemOf("gherkin", undefined), undefined);
  assert.equal(runnerProblemOf("python", "jest"), undefined);
  assert.equal(runnerProblemOf("shell", undefined), undefined);
});

test("unrecorded proof names the declared runner's reference, else every runner's", () => {
  const vitest = "dough-test-optimization/references/vitest-proof.md";
  const playwright = "dough-test-optimization/references/playwright-proof.md";
  const nodeTest = "dough-test-optimization/references/node-test-proof.md";
  assert.deepEqual(unrecordedReferenceOf("typescript", undefined), [
    vitest,
    playwright,
    nodeTest,
  ]);
  assert.deepEqual(unrecordedReferenceOf("javascript", "vitest"), [vitest]);
  assert.deepEqual(unrecordedReferenceOf("typescript", "playwright"), [
    playwright,
  ]);
  assert.deepEqual(unrecordedReferenceOf("javascript", "node:test"), [
    nodeTest,
  ]);
  assert.deepEqual(unrecordedReferenceOf("python", undefined), [
    "dough-test-optimization/references/pytest-proof.md",
  ]);
  assert.equal(unrecordedReferenceOf("shell", undefined), undefined);
  assert.equal(unrecordedReferenceOf(undefined, undefined), undefined);
});
