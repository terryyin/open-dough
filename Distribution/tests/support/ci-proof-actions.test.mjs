// The two local CI proof actions' scripts, replayed with what ci.yml and the
// browser test group workflow give them (./ci-proof-declaration.test.mjs) on
// representative runner reports: npm test's outcomes, one line per check
// file it ran as one job, publish test files; each browser test group's
// Playwright record publishes its own tests as test cases to its own proof
// entry; a part whose runner wrote no report stays missing, while a part
// whose runner reported no test is a reported zero. One location reporting
// both units is covered by
// ../../src/skills/dough-test-optimization/scripts/ci-proof-units-cli.test.mjs.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";
import {
  declaredPart,
  root,
  stepInputs,
  summaryStep,
} from "./ci-proof-action-fixtures.mjs";
import { runAttempt } from "./ci-proof-action-replay.mjs";

// The collector log's gaps of an entry's unit whose parts FROM to OF are
// missing.
const missingFrom = (from, of) =>
  Array.from(
    { length: of - from + 1 },
    (...[, index]) => `part ${index + from} of ${of} missing`,
  ).join("; ");

const cwd = fileURLToPath(root).replace(/\/$/, "");

// Keeps JOB's PART fragments after its runner wrote RECORD (none when
// undefined) as its suite step's proof record.
function keepGroupPart(run, job, part, record, parts) {
  const temp = run.runner(job, part);
  const declared = declaredPart(job, part, temp, parts);
  if (record !== undefined)
    writeFileSync(
      declared.report("PROOF_RECORD"),
      JSON.stringify(locatedRecord(cwd, record)),
    );
  return run.fragments(part, temp, declared.inputs);
}

test("Open Dough's CI publishes npm test's per-file outcomes as test files and each browser group's tests as its own entry's test cases; a part whose runner wrote no report stays missing", (t) => {
  const run = runAttempt(t);
  // Share 1's runner reports each check file it ran as one job: a Node file
  // of five cases is one line, and a failed file job without case output
  // is one failed line. A check outside Distribution counts toward no entry.
  const share = run.runner("distribution-tests", 1);
  const shareReport = declaredPart("distribution-tests", 1, share).report;
  writeFileSync(
    shareReport("OPEN_DOUGH_TEST_OUTCOMES"),
    "passed\tDistribution/tests/a.sh\npassed\tDistribution/src/skills/x/scripts/five-cases.test.mjs\nfailed\tDistribution/src/skills/x/scripts/b.test.mjs\npassed\tscripts/check-self-installation.sh\n",
  );
  writeFileSync(
    shareReport("OPEN_DOUGH_TEST_TIMES"),
    "2.5\tDistribution/src/skills/x/scripts/five-cases.test.mjs\n1.2\tscripts/check-self-installation.sh\n0.5\tDistribution/src/skills/x/scripts/b.test.mjs\n0.2\tDistribution/tests/a.sh\n",
  );
  // Share 2's runner ended with a global error before writing any report.
  const failed = run.runner("distribution-tests", 2);
  const kept = [
    run.fragments(
      1,
      share,
      declaredPart("distribution-tests", 1, share).inputs,
    ),
    run.fragments(
      2,
      failed,
      declaredPart("distribution-tests", 2, failed).inputs,
    ),
    // Each group's first shard records only its own selection.
    keepGroupPart(run, "e2e", 1, [
      [`${cwd}/e2e/workflow.spec.ts`, "expected", [40]],
    ]),
    keepGroupPart(run, "dashboard-integrated", 1, [
      [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [35]],
    ]),
    keepGroupPart(run, "dashboard-frontend", 1, [
      [`${cwd}/dashboard/frontend-tests/dom.spec.ts`, "expected", [20]],
    ]),
    keepGroupPart(run, "dashboard-backend", 1, [
      [`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [50]],
      [`${cwd}/dashboard/backend-tests/problem.spec.ts`, "unexpected", [15]],
    ]),
  ];
  assert.deepEqual(
    kept.map((result) => [result.status, result.stdout, result.stderr]),
    [
      [0, "", ""],
      [
        1,
        "",
        `ci-proof-summary: ENOENT: no such file or directory, open '${join(failed, "test-outcomes.txt")}'\n`,
      ],
      [0, "", ""],
      [0, "", ""],
      [0, "", ""],
      [0, "", ""],
    ],
  );
  const summary = run.summary(stepInputs(summaryStep).expect);
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    [
      `e2e: 1 passed, 0 failed, 0 other test cases; ${missingFrom(2, 5)}`,
      `dashboard/tests: 1 passed, 0 failed, 0 other test cases; ${missingFrom(2, 5)}`,
      `dashboard/frontend-tests: 1 passed, 0 failed, 0 other test cases`,
      `dashboard/backend-tests: 1 passed, 1 failed, 0 other test cases; ${missingFrom(2, 3)}`,
      `Distribution: 2 passed, 1 failed, 0 other test files; ${missingFrom(2, 3)}`,
      "",
    ].join("\n"),
  );
  assert.deepEqual(summaryProblems(summary.written), []);
  assert.deepEqual(
    [summary.written.schemaVersion, summary.written.runAttempt],
    [2, 2],
  );
  // Each unit's time sums its own reports' durations, and every file keeps
  // its outcome under its own path.
  assert.deepEqual(
    summary.written.entries.flatMap(({ path, evidence }) =>
      evidence.flatMap(({ durationMs, files }) =>
        files.map(
          (file) =>
            `${path} ${durationMs} ms: ${file.path} ${file.passed} passed ${file.failed} failed`,
        ),
      ),
    ),
    [
      "e2e 40 ms: e2e/workflow.spec.ts 1 passed 0 failed",
      "dashboard/tests 35 ms: dashboard/tests/browser.spec.ts 1 passed 0 failed",
      "dashboard/frontend-tests 20 ms: dashboard/frontend-tests/dom.spec.ts 1 passed 0 failed",
      "dashboard/backend-tests 65 ms: dashboard/backend-tests/problem.spec.ts 0 passed 1 failed",
      "dashboard/backend-tests 65 ms: dashboard/backend-tests/server.spec.ts 1 passed 0 failed",
      "Distribution 3200 ms: Distribution/src/skills/x/scripts/b.test.mjs 0 passed 1 failed",
      "Distribution 3200 ms: Distribution/src/skills/x/scripts/five-cases.test.mjs 1 passed 0 failed",
      "Distribution 3200 ms: Distribution/tests/a.sh 1 passed 0 failed",
    ],
  );
});

test("a browser group's shard that ran no test is a reported zero, while a shard whose runner wrote no record leaves its part missing", (t) => {
  const run = runAttempt(t);
  const kept = [
    keepGroupPart(
      run,
      "dashboard-backend",
      1,
      [[`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [50]]],
      4,
    ),
    // Shard 2's deal selected no spec; its run completed and recorded none.
    keepGroupPart(run, "dashboard-backend", 2, [], 4),
    // Shard 3's runner ended before writing its record.
    keepGroupPart(run, "dashboard-backend", 3, undefined, 4),
    keepGroupPart(
      run,
      "dashboard-backend",
      4,
      [[`${cwd}/dashboard/backend-tests/other.spec.ts`, "expected", [10]]],
      4,
    ),
  ];
  assert.deepEqual(
    kept.map((result) => result.status),
    [0, 0, 1, 0],
  );
  const summary = run.summary("dashboard/backend-tests=4:case");
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    "dashboard/backend-tests: 2 passed, 0 failed, 0 other test cases; part 3 of 4 missing\n",
  );
  assert.deepEqual(summaryProblems(summary.written), []);
});
