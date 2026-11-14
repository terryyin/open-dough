// Discriminating action replay for the optional frontend test proof: the
// summarize shell block writes the Markdown named by the upload step, scoped
// to dashboard/frontend-tests, without rerunning tests or changing the
// combined summary. Declaration and upload wiring:
// ./ci-proof-declaration.test.mjs. Broader producer replay:
// ./ci-proof-actions.test.mjs.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import test from "node:test";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";
import { summaryAction } from "./ci-proof-action-fixtures.mjs";
import { runAttempt } from "./ci-proof-action-replay.mjs";
import {
  declaredFrontend,
  declaredGroup,
  expect,
  frontendEntry,
} from "./ci-proof-frontend-report-support.mjs";
import { makeMe } from "./makeMe.mjs";

const cwd = "/runner/project";

function writeProof(path, record) {
  writeFileSync(path, JSON.stringify(record));
}

test("with frontend-entry the summarize action writes the upload-named report for frontend only", (t) => {
  const run = runAttempt(t);
  // The frontend producer's shard and two other groups' shards.
  const records = {
    "dashboard-frontend": [
      [`${cwd}/dashboard/frontend-tests/pass.spec.ts`, "expected", [0]],
      [`${cwd}/dashboard/frontend-tests/fail.spec.ts`, "unexpected", [30]],
      [`${cwd}/dashboard/frontend-tests/other.spec.ts`, undefined, []],
    ],
    "dashboard-integrated": [
      [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [90]],
    ],
    "dashboard-backend": [
      [`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [60]],
    ],
  };
  for (const [group, tests] of Object.entries(records)) {
    const shard = run.runner(group, 1);
    const declared = declaredGroup(group, 1, shard);
    writeProof(declared.report, locatedRecord(cwd, tests));
    assert.equal(run.fragments(1, shard, declared.inputs).status, 0);
  }

  const summary = run.summary({ expect, "frontend-entry": frontendEntry });
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.deepEqual(summaryProblems(summary.written), []);
  assert.equal(summary.written.repository, "owner/repo");
  assert.equal(summary.written.runId, 7);
  assert.equal(summary.written.runAttempt, 2);
  assert.equal(typeof summary.report, "string");
  assert.match(
    summary.report,
    /Frontend test proof: dashboard\/frontend-tests/,
  );
  assert.match(summary.report, /Repository: owner\/repo/);
  assert.match(summary.report, /Run ID: 7/);
  assert.match(summary.report, /Attempt: 2/);
  assert.match(summary.report, /1 passed, 1 failed, 1 other test cases/);
  assert.match(summary.report, /pass\.spec\.ts \| 1 \| 0 \| 0 \| 0 ms/);
  assert.match(summary.report, /fail\.spec\.ts \| 0 \| 1 \| 0 \| 30 ms/);
  assert.match(summary.report, /other\.spec\.ts \| 0 \| 0 \| 1 \| unavailable/);
  assert.doesNotMatch(summary.report, /browser\.spec\.ts/);
  assert.doesNotMatch(summary.report, /server\.spec\.ts/);
  // Combined summary still holds the other locations; report generation
  // only reads that written summary.
  assert.deepEqual(
    summary.written.entries.map(({ path }) => path),
    [
      "e2e",
      "dashboard/tests",
      "dashboard/frontend-tests",
      "dashboard/backend-tests",
    ],
  );
  assert.match(summaryAction, /scripts\/frontend-test-proof\.mjs/);
  assert.match(
    summaryAction,
    /--summary "\$\{RUNNER_TEMP\}\/ci-proof-summary\.json"/,
  );
});

test("without frontend-entry the summarize action still writes only the combined summary", (t) => {
  const run = runAttempt(t);
  const shard = run.runner("dashboard-frontend", 1);
  const declared = declaredFrontend(1, shard);
  writeProof(
    declared.report,
    makeMe.aDashboardProofRecord
      .from(cwd)
      .completed()
      .withTest(`${cwd}/dashboard/frontend-tests/dom.spec.ts`, "expected", [20])
      .please(),
  );
  assert.equal(run.fragments(1, shard, declared.inputs).status, 0);
  const summary = run.summary(expect);
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(summary.report, undefined);
  assert.deepEqual(summaryProblems(summary.written), []);
});

test("a failed and unfinished frontend selection stays failed/other, and a present empty shard stays zero beside missing parts", (t) => {
  const run = runAttempt(t);
  // The frontend producer as if it ran three shards.
  const declared = (part, temp) => declaredFrontend(part, temp, 3);
  const first = run.runner("dashboard-frontend", 1);
  const second = run.runner("dashboard-frontend", 2);
  const third = run.runner("dashboard-frontend", 3);
  writeProof(
    declared(1, first).report,
    makeMe.aDashboardProofRecord
      .from(cwd)
      .completed()
      .withTest(
        `${cwd}/dashboard/frontend-tests/fail.spec.ts`,
        "unexpected",
        [30],
      )
      .withTest(`${cwd}/dashboard/frontend-tests/hang.spec.ts`, undefined, [])
      .please(),
  );
  writeProof(
    declared(2, second).report,
    makeMe.aDashboardProofRecord.from(cwd).completed().please(),
  );
  writeProof(
    declared(3, third).report,
    makeMe.aDashboardProofRecord
      .from(cwd)
      .running()
      .withTest(`${cwd}/dashboard/frontend-tests/late.spec.ts`, "expected", [5])
      .please(),
  );
  assert.equal(run.fragments(1, first, declared(1, first).inputs).status, 0);
  assert.equal(run.fragments(2, second, declared(2, second).inputs).status, 0);
  assert.equal(run.fragments(3, third, declared(3, third).inputs).status, 1);

  const summary = run.summary({
    expect: `${frontendEntry}=3:case`,
    "frontend-entry": frontendEntry,
  });
  assert.equal(summary.status, 0);
  assert.deepEqual(summaryProblems(summary.written), []);
  const frontend = summary.written.entries.find(
    (item) => item.path === frontendEntry,
  ).evidence[0];
  assert.deepEqual(
    [frontend.passed, frontend.failed, frontend.other, frontend.durationMs],
    [0, 1, 1, 30],
  );
  assert.match(summary.report, /0 passed, 1 failed, 1 other test cases/);
  assert.match(summary.report, /fail\.spec\.ts \| 0 \| 1 \| 0 \| 30 ms/);
  assert.match(summary.report, /hang\.spec\.ts \| 0 \| 0 \| 1 \| unavailable/);
  assert.match(summary.report, /Part 2 of 3: present zero/);
  assert.match(summary.report, /Part 3 of 3: missing/);
  assert.doesNotMatch(summary.report, /late\.spec\.ts/);
  assert.match(summary.report, /Incomplete/);
  assert.doesNotMatch(summary.report, /All declared parts are present/);
});

test("a wrong-revision or wrong-attempt fragment does not fill this attempt's frontend report", (t) => {
  const run = runAttempt(t);
  const revision = "a".repeat(40);
  run.plantFragment(
    makeMe.aCiProofFragment
      .at(frontendEntry)
      .part(1, 12)
      .ofAttempt(2, "b".repeat(40))
      .counting(1)
      .timed(40)
      .please(),
  );
  run.plantFragment(
    makeMe.aCiProofFragment
      .at(frontendEntry)
      .part(2, 12)
      .ofAttempt(1, revision)
      .counting(2)
      .timed(80)
      .please(),
  );
  run.plantFragment(
    makeMe.aCiProofFragment
      .at(frontendEntry)
      .part(3, 12)
      .ofAttempt(2, revision)
      .counting(1)
      .timed(10)
      .please(),
    "dup-a",
  );
  run.plantFragment(
    makeMe.aCiProofFragment
      .at(frontendEntry)
      .part(3, 12)
      .ofAttempt(2, revision)
      .counting(1)
      .timed(11)
      .please(),
    "dup-b",
  );
  const summary = run.summary({
    expect: "dashboard/frontend-tests=12:case",
    "frontend-entry": frontendEntry,
  });
  assert.equal(summary.status, 0);
  assert.match(summary.stderr, /exclud/);
  assert.deepEqual(
    [
      summary.written.entries[0].evidence[0].passed,
      summary.written.entries[0].evidence[0].failed,
      summary.written.entries[0].evidence[0].other,
      summary.written.entries[0].evidence[0].durationMs,
    ],
    [0, 0, 0, undefined],
  );
  assert.match(summary.report, /0 passed, 0 failed, 0 other test cases/);
  assert.match(summary.report, /Part 1 of 12: missing/);
  assert.match(summary.report, /Part 2 of 12: missing/);
  assert.match(summary.report, /Part 3 of 12: ambiguous/);
  assert.match(summary.report, /Incomplete/);
  assert.doesNotMatch(summary.report, /All declared parts are present/);
});
