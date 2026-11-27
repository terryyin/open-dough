// ci.yml's ci-proof job declares the proof entries, parts and units that its
// producers write, after the proof jobs settle however they ended: the
// standalone frontend job, npm test's shares and the sharded browser groups.
// The two local CI
// proof actions replayed with what the workflows give them:
// ./ci-proof-actions.test.mjs. Each group's own inputs:
// ./ci-browser-groups.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

import {
  browserWorkflow,
  evaluated,
  workflow,
  summaryAction,
  locations,
  jobs,
  input,
  producers,
  summaryStep,
} from "./ci-proof-action-fixtures.mjs";
import { runAttempt } from "./ci-proof-action-replay.mjs";

const attempt = "${{ github.run_attempt }}";

const declared = jobs(workflow);

// The unit of a fragments step's results: a browser record's tests are
// test cases; an outcomes report's lines are in the unit the step declares.
const unitOf = (step) =>
  input(step, "report-format") === "browser-record"
    ? "case"
    : input(step, "unit");

// A producer's evaluated fragments-step input NAME.
const declaredInput = ({ proof: [step], inputs }, name) => {
  const value = input(step, name);
  return value && evaluated(value, { inputs });
};

// Resolve a workflow's CI_PROOF_REVISION expression for a pull_request event
// whose head differs from github.sha (the merge commit).
const revisionUnderPullRequest = (text, { headSha, mergeSha }) => {
  const declaredRevision = /^ {2}CI_PROOF_REVISION: \$\{\{ (.+) \}\}$/m.exec(
    text,
  )?.[1];
  assert.ok(declaredRevision, "workflow declares CI_PROOF_REVISION");
  const context = {
    "github.event.pull_request.head.sha": headSha,
    "github.sha": mergeSha,
  };
  for (const term of declaredRevision.split(/\s*\|\|\s*/)) {
    const value = context[term.trim()];
    if (value) return value;
  }
  return undefined;
};

test("a pull request's CI proof names the head revision, not the merge commit", (t) => {
  // A pull-request run must name head.sha (what Intent judges), not the
  // merge commit github.sha alone would give; drop the head preference and
  // every PR summary reads as another revision.
  const headSha = "b".repeat(40);
  const mergeSha = "c".repeat(40);
  const revision = revisionUnderPullRequest(workflow, { headSha, mergeSha });
  assert.equal(
    revisionUnderPullRequest(browserWorkflow, { headSha, mergeSha }),
    revision,
  );
  const run = runAttempt(t, { revision });
  const summary = run.summary(input(summaryStep, "expect"));
  assert.equal(summary.status, 0, summary.stderr);
  assert.equal(summary.written.revision, headSha);
});

test("the ci-proof job runs after every proof job however they ended", () => {
  const lines = declared.get("ci-proof").join("\n");
  assert.deepEqual(
    /^ {4}needs:\n((?: {6}- .+\n)+)/m
      .exec(lines)?.[1]
      .trimEnd()
      .split("\n")
      .map((item) => item.slice(8))
      .sort(),
    producers.map(({ job }) => job).sort(),
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

test("the declared parts and units match their producers in Intent location order", () => {
  const expected = new Map();
  for (const producer of producers) {
    const units = [unitOf(producer.proof[0])];
    if (declaredInput(producer, "case-report")) units.unshift("case");
    for (const entry of declaredInput(producer, "entries").split(" ")) {
      assert.equal(expected.has(entry), false, `${entry} has one producer`);
      expected.set(
        entry,
        units.map((unit) => [entry, `${producer.parts}:${unit}`]),
      );
    }
  }
  const declaration = input(summaryStep, "expect")
    .split(" ")
    .map((value) => value.split("="));
  assert.deepEqual(
    declaration,
    locations
      .filter((entry) => expected.has(entry))
      .flatMap((entry) => expected.get(entry)),
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
    assert.equal(input(step, "part"), axis ? `\${{ matrix.${axis} }}` : "1");
    assert.equal(
      input(step, "parts"),
      axis ? "${{ strategy.job-total }}" : "1",
    );
    assert.equal(declaredInput(producer, "producer"), job);
  }
});
