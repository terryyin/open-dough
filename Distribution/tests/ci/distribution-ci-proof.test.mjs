import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import {
  declaredPart,
  stepInputs,
  summaryStep,
} from "../support/ci-proof-action-fixtures.mjs";
import { runAttempt } from "../support/ci-proof-action-replay.mjs";
import { suiteRunnerLayer } from "../support/local-test-suite-checkout.mjs";
import { makeMe } from "../support/makeMe.mjs";
import { materializeLocalCheckout } from "../support/repository-fixture.mjs";

const mixed = "Distribution/tests/ci/mixed.test.mjs";
const unloadable = "Distribution/tests/ci/unloadable.test.mjs";
const shell = "Distribution/tests/ci/shell.sh";
const shellOnly = "Distribution/tests/ci/shell-only.sh";

test("real Distribution job outcomes reach CI proof as Node cases and file results", async (t) => {
  const { integration } = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("distribution checks", {
        backlog: null,
        files: {
          [mixed]: `import { describe, test } from "node:test";
test("passes", () => {});
describe("suite", () => {
  test("also passes", () => {});
  test("fails", () => { throw new Error("case failure"); });
});
test.skip("skipped");
test.todo("pending");
`,
          [unloadable]: 'throw new Error("load failure");\n',
          [shell]: "exit 0\n",
          [shellOnly]: "exit 0\n",
        },
      })
      .please(),
    { layer: suiteRunnerLayer() },
  );
  const run = runAttempt(t);
  for (const [part, expectedExit, checks] of [
    [1, 1, [mixed, shell]],
    [2, 1, [unloadable]],
    [3, 0, [shellOnly]],
  ]) {
    const temp = run.runner("distribution-tests", part);
    const declared = declaredPart("distribution-tests", part, temp);
    const env = { ...process.env, CI: "true", OPEN_DOUGH_TEST_JOBS: "1" };
    delete env.NODE_TEST_CONTEXT;
    for (const variable of [
      "OPEN_DOUGH_TEST_OUTCOMES",
      "OPEN_DOUGH_TEST_TIMES",
      "OPEN_DOUGH_TEST_CASE_OUTCOMES",
    ]) {
      env[variable] = declared.report(variable);
    }
    const suite = spawnSync("bash", ["scripts/test.sh", ...checks], {
      cwd: integration,
      env,
      encoding: "utf8",
    });
    assert.equal(suite.status, expectedExit, suite.stderr);
    if (part === 1) assert.match(suite.stderr, /not ok: suite > fails/);
    if (part === 3) assert.equal(suite.stderr, "");
    const kept = run.fragments(part, temp, declared.inputs);
    assert.equal(kept.status, 0, kept.stderr);
  }

  const summary = run.summary(stepInputs(summaryStep));
  assert.equal(summary.status, 0, summary.stderr);
  const distribution = summary.written.entries.find(
    ({ path }) => path === "Distribution",
  );
  assert.deepEqual(
    distribution.evidence.map(({ unit, passed, failed, other, parts }) => [
      unit,
      passed,
      failed,
      other,
      parts.map(({ status }) => status),
    ]),
    [
      ["case", 2, 1, 2, ["present", "missing", "present"]],
      ["file", 2, 2, 0, ["present", "present", "present"]],
    ],
  );
  const cases = distribution.evidence.find(({ unit }) => unit === "case");
  assert.equal(
    cases.durationMs,
    undefined,
    "file timing belongs to file proof",
  );
  assert.deepEqual(
    cases.files.map(({ path, passed, failed, other }) => [
      path,
      passed,
      failed,
      other,
    ]),
    [[mixed, 2, 1, 2]],
  );
});
