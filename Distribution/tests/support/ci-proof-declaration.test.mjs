// ci.yml's ci-proof job declares the proof entries, parts and units that its
// producers write, after the proof jobs settle however they ended: npm
// test's shares and each browser test group's own shards, run by
// browser-test-group.yml with the inputs its job gives. The two local CI
// proof actions replayed with what the workflows give them:
// ./ci-proof-actions.test.mjs. Each group's own inputs:
// ./ci-browser-groups.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  FRONTEND_TEST_PROOF_FILE,
  frontendTestProofArtifactName,
} from "../../../scripts/frontend-test-proof.mjs";

import {
  browserGroups,
  browserWorkflow,
  evaluated,
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

// A producer's evaluated fragments-step input NAME.
const declaredInput = ({ proof: [step], inputs }, name) => {
  const value = input(step, name);
  return value && evaluated(value, { inputs });
};

test("both workflows name a pull request's head as CI_PROOF_REVISION before github.sha", () => {
  // A pull-request run must name head.sha (what Intent judges), not the
  // merge commit github.sha alone would give; drop the head preference and
  // every PR summary reads as another revision.
  for (const text of [workflow, browserWorkflow])
    assert.match(
      text,
      /^ {2}CI_PROOF_REVISION: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}$/m,
    );
});

test("the ci-proof job runs after every proof job however they ended", () => {
  const lines = declared.get("ci-proof").join("\n");
  assert.deepEqual(
    /^ {4}needs:\n((?: {6}- .+\n)+)/m
      .exec(lines)?.[1]
      .trimEnd()
      .split("\n")
      .map((item) => item.slice(8)),
    producers.map(({ job }) => job),
  );
  assert.deepEqual(
    browserGroups.map(({ job }) => job),
    ["e2e", "dashboard-integrated", "dashboard-frontend", "dashboard-backend"],
  );
  assert.match(lines, /^ {4}if: \$\{\{ !cancelled\(\) \}\}$/m);
  assert.ok(summaryStep, "the ci-proof job runs no ci-proof-summary step");
  assert.ok(
    summaryAction.includes(
      `pattern: ci-proof-fragments-*-attempt-${attempt}\n`,
    ),
  );
  assert.ok(summaryAction.includes(`name: ${summaryArtifactName(attempt)}\n`));
});

test("npm test's per-file outcomes are published as test files and each browser group's record's tests as test cases", () => {
  // scripts/test.sh runs each shell check and node --test file as one job
  // and writes one outcome line per job (Distribution/tests/runner-settings.md): that
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
      ["distribution-tests", [["outcomes", "file", "file"]]],
      ...browserGroups.map(({ job }) => [
        job,
        [["playwright-record", undefined, "case"]],
      ]),
    ],
  );
});

test("the declared parts and units equal the matrix lengths and report units of the jobs that write each entry, in Intent location order", () => {
  const expected = new Map();
  for (const producer of producers) {
    for (const entry of declaredInput(producer, "entries").split(" ")) {
      assert.equal(expected.has(entry), false, `${entry} has one producer`);
      expected.set(entry, `${producer.parts}:${unitOf(producer.proof[0])}`);
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

test("every producer keeps its part's attempt-named fragments under its own name whenever its suite ran", () => {
  for (const producer of producers) {
    const { job, axis, suite, proof } = producer;
    assert.equal(proof.length, 1, `${job} keeps its CI proof fragments once`);
    const [step] = proof;
    assert.match(
      step,
      /\n {8}if: \$\{\{ !cancelled\(\) && steps\.suite\.outcome != 'skipped' \}\}\n/,
    );
    assert.ok(suite, `${job} names no suite step`);
    assert.equal(input(step, "part"), `\${{ matrix.${axis} }}`);
    assert.equal(input(step, "parts"), "${{ strategy.job-total }}");
    assert.equal(declaredInput(producer, "producer"), job);
  }
  assert.ok(
    fragmentsAction.includes(
      `name: ci-proof-fragments-\${{ inputs.producer }}-\${{ inputs.part }}-attempt-${attempt}\n`,
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
