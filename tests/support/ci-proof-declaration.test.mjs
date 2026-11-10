// ci.yml's ci-proof job declares the proof entries, parts and units that its
// producers write, after the proof jobs settle however they ended. The two
// local CI proof actions replayed with what ci.yml gives them:
// ./ci-proof-actions.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  FRONTEND_TEST_PROOF_FILE,
  frontendTestProofArtifactName,
} from "../../scripts/frontend-test-proof.mjs";

import {
  workflow,
  fragmentsAction,
  summaryAction,
  locations,
  jobs,
  input,
  producers,
  summaryStep,
  frontendProofUploadStep,
} from "./ci-proof-action-fixtures.mjs";

const attempt = "${{ github.run_attempt }}";

const declared = jobs(workflow);

// The unit of a fragments step's results: a Playwright record's tests are
// test cases; an outcomes report's lines are in the unit the step declares.
const unitOf = (step) =>
  input(step, "report-format") === "playwright-record"
    ? "case"
    : input(step, "unit");

test("the workflow names a pull request's head as CI_PROOF_REVISION before github.sha", () => {
  // A pull-request run must name head.sha (what Intent judges), not the
  // merge commit github.sha alone would give; drop the head preference and
  // every PR summary reads as another revision.
  assert.match(
    workflow,
    /^ {2}CI_PROOF_REVISION: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}$/m,
  );
});

test("the ci-proof job runs after both proof jobs however they ended", () => {
  const lines = declared.get("ci-proof").join("\n");
  assert.match(lines, /^ {4}needs: \[test, dashboard\]$/m);
  assert.match(lines, /^ {4}if: \$\{\{ !cancelled\(\) \}\}$/m);
  assert.ok(summaryStep, "the ci-proof job runs no ci-proof-summary step");
  assert.ok(
    summaryAction.includes(
      `pattern: ci-proof-fragments-*-attempt-${attempt}\n`,
    ),
  );
  assert.ok(summaryAction.includes(`name: ${summaryArtifactName(attempt)}\n`));
});

test("npm test's per-file outcomes are published as test files and the dashboard records' tests as test cases", () => {
  // scripts/test.sh runs each shell check and node --test file as one job
  // and writes one outcome line per job (tests/runner-settings.md): that
  // file's aggregate outcome, however many cases it holds. A Playwright
  // record names no unit input: its tests are test cases.
  assert.deepEqual(
    producers.map(({ job, proof }) => [
      job,
      proof.map((step) => [
        input(step, "report-format"),
        input(step, "unit"),
        unitOf(step),
      ]),
    ]),
    [
      ["test", [["outcomes", "file", "file"]]],
      ["dashboard", [["playwright-record", undefined, "case"]]],
    ],
  );
});

test("the declared parts and units equal the matrix lengths and report units of the jobs that write each entry, in Intent location order", () => {
  const expected = new Map();
  for (const { proof, parts } of producers) {
    for (const step of proof) {
      for (const entry of input(step, "entries").split(" ")) {
        expected.set(entry, `${parts}:${unitOf(step)}`);
      }
    }
  }
  const declaration = input(summaryStep, "expect")
    .split(" ")
    .map((value) => value.split("="));
  assert.deepEqual(
    declaration,
    locations
      .filter((entry) => expected.has(entry))
      .map((entry) => [entry, expected.get(entry)]),
  );
  assert.deepEqual(
    new Set(declaration.map(([entry]) => entry)),
    new Set(expected.keys()),
  );
});

test("every producer keeps its part's attempt-named fragments whenever its suite ran", () => {
  for (const { job, axis, suite, proof } of producers) {
    assert.equal(proof.length, 1, `${job} keeps its CI proof fragments once`);
    const [step] = proof;
    assert.match(
      step,
      /\n {8}if: \$\{\{ !cancelled\(\) && steps\.suite\.outcome != 'skipped' \}\}\n/,
    );
    assert.ok(suite, `${job} names no suite step`);
    assert.equal(input(step, "part"), `\${{ matrix.${axis} }}`);
    assert.equal(input(step, "parts"), "${{ strategy.job-total }}");
  }
  assert.ok(
    fragmentsAction.includes(
      `name: ci-proof-fragments-\${{ github.job }}-\${{ inputs.part }}-attempt-${attempt}\n`,
    ),
  );
});

test("the ci-proof summary optionally publishes the frontend test proof beside the combined summary", () => {
  assert.equal(
    input(summaryStep, "frontend-entry"),
    "dashboard/frontend-tests",
  );
  assert.match(
    summaryAction,
    /\n {2}frontend-entry:\n[\s\S]*?\n {4}default: ""\n/,
  );
  assert.match(
    summaryAction,
    /\n {8}FRONTEND_ENTRY: \$\{\{ inputs\.frontend-entry \}\}\n/,
  );
  assert.match(
    summaryAction,
    /if \[\[ -n "\$\{FRONTEND_ENTRY\}" \]\]; then\n\s+node scripts\/frontend-test-proof\.mjs \\/,
  );
  assert.match(
    summaryAction,
    new RegExp(
      `path: \\$\\{\\{ runner\\.temp \\}\\}/${FRONTEND_TEST_PROOF_FILE.replace(".", "\\.")}\\n`,
    ),
  );
  assert.ok(
    frontendProofUploadStep.includes(
      `name: ${frontendTestProofArtifactName(attempt)}\n`,
    ),
  );
  assert.match(
    frontendProofUploadStep,
    /\n {6}if: \$\{\{ inputs\.frontend-entry != '' \}\}\n/,
  );
  assert.ok(frontendProofUploadStep.includes("if-no-files-found: error\n"));
  assert.ok(frontendProofUploadStep.includes("retention-days: 30\n"));
  // Combined summary upload stays attempt-named with the same retention.
  assert.ok(summaryAction.includes(`name: ${summaryArtifactName(attempt)}\n`));
  assert.ok(
    summaryAction.includes(
      `path: \${{ runner.temp }}/ci-proof-summary.json\n        if-no-files-found: error\n        retention-days: 30\n`,
    ),
  );
});
