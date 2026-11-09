// ci.yml's ci-proof job declares the proof entries and parts that its
// producers write, after the proof jobs settle however they ended. The two
// local CI proof actions running the collector with what ci.yml gives them:
// ./ci-proof-actions.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

import {
  workflow,
  fragmentsAction,
  summaryAction,
  locations,
  jobs,
  steps,
  input,
} from "./ci-proof-action-fixtures.mjs";

const attempt = "${{ github.run_attempt }}";

const declared = jobs(workflow);
const collector = steps(declared.get("ci-proof"));
const producers = [
  { job: "test", axis: "share" },
  { job: "dashboard", axis: "shard" },
].map(({ job, axis }) => {
  const lines = declared.get(job);
  const matrix = new RegExp(`^ +${axis}: \\[([^\\]]*)\\]$`, "m").exec(
    lines.join("\n"),
  );
  const jobSteps = steps(lines);
  const proof = jobSteps.filter((step) =>
    step.includes("uses: ./.github/actions/ci-proof-fragments\n"),
  );
  return {
    job,
    axis,
    parts: matrix[1].split(",").length,
    steps: jobSteps,
    proof,
  };
});

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
  assert.ok(
    collector.some((step) =>
      step.includes("uses: ./.github/actions/ci-proof-summary\n"),
    ),
  );
  assert.ok(
    summaryAction.includes(
      `pattern: ci-proof-fragments-*-attempt-${attempt}\n`,
    ),
  );
  assert.ok(summaryAction.includes(`name: ${summaryArtifactName(attempt)}\n`));
});

test("the declared parts equal the matrix lengths of the jobs that write each entry, in Intent location order", () => {
  const expected = new Map();
  for (const { proof, parts } of producers) {
    for (const entry of proof.flatMap((step) =>
      input(step, "entries").split(" "),
    )) {
      expected.set(entry, parts);
    }
  }
  const [summarize] = collector.filter((step) =>
    step.includes("ci-proof-summary\n"),
  );
  const declaration = input(summarize, "expect")
    .split(" ")
    .map((value) => value.split("="));
  assert.deepEqual(
    declaration,
    locations
      .filter((entry) => expected.has(entry))
      .map((entry) => [entry, String(expected.get(entry))]),
  );
  assert.deepEqual(
    new Set(declaration.map(([entry]) => entry)),
    new Set(expected.keys()),
  );
});

test("every producer keeps its part's attempt-named fragments whenever its suite ran", () => {
  for (const { job, axis, steps: jobSteps, proof } of producers) {
    assert.equal(proof.length, 1, `${job} keeps its CI proof fragments once`);
    const [step] = proof;
    assert.match(
      step,
      /\n {8}if: \$\{\{ !cancelled\(\) && steps\.suite\.outcome != 'skipped' \}\}\n/,
    );
    assert.ok(
      jobSteps.some((other) => /\n {8}id: suite\n/.test(other)),
      `${job} names no suite step`,
    );
    assert.equal(input(step, "part"), `\${{ matrix.${axis} }}`);
    assert.equal(input(step, "parts"), "${{ strategy.job-total }}");
  }
  assert.ok(
    fragmentsAction.includes(
      `name: ci-proof-fragments-\${{ github.job }}-\${{ inputs.part }}-attempt-${attempt}\n`,
    ),
  );
});
