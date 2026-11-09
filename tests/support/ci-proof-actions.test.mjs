// The two local CI proof actions' scripts, replayed with what ci.yml gives
// them (./ci-proof-declaration.test.mjs) on representative runner reports:
// npm test's outcomes, one line per check file it ran as one job, publish
// test files, the dashboard's Playwright record publishes each test as a
// test case to its own proof entry, and a part whose runner wrote no report
// stays missing. One location reporting both units:
// ./ci-proof-action-units.test.mjs.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";
import {
  evaluated,
  input,
  producers,
  root,
  runAttempt,
  stepInputs,
  summaryStep,
} from "./ci-proof-action-fixtures.mjs";

// JOB's PART on the runner TEMP as ci.yml declares it: its fragments step's
// inputs, and where its suite step has the runner write a report.
function declaredPart(job, part, temp) {
  const declared = producers.find((producer) => producer.job === job);
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

// The collector log's gaps of an entry's unit whose part 1 of OF alone
// reported.
const missingAfterFirst = (of) =>
  Array.from(
    { length: of - 1 },
    (...[, index]) => `part ${index + 2} of ${of} missing`,
  ).join("; ");

test("Open Dough's CI publishes npm test's per-file outcomes as test files and each dashboard test as a test case; a part whose runner wrote no report stays missing", (t) => {
  const run = runAttempt(t);
  // Share 1's runner reports each check file it ran as one job: a Node file
  // of five cases is one line, and a failed file job without case output
  // is one failed line. A check outside both entries counts toward neither.
  const share = run.runner("test", 1);
  const shareReport = declaredPart("test", 1, share).report;
  writeFileSync(
    shareReport("OPEN_DOUGH_TEST_OUTCOMES"),
    "passed\ttests/a.sh\npassed\tsrc/skills/x/scripts/five-cases.test.mjs\nfailed\tsrc/skills/x/scripts/b.test.mjs\npassed\tscripts/check-self-installation.sh\n",
  );
  writeFileSync(
    shareReport("OPEN_DOUGH_TEST_TIMES"),
    "2.5\tsrc/skills/x/scripts/five-cases.test.mjs\n1.2\tscripts/check-self-installation.sh\n0.5\tsrc/skills/x/scripts/b.test.mjs\n0.2\ttests/a.sh\n",
  );
  // Share 2's runner ended with a global error before writing any report.
  const failed = run.runner("test", 2);
  const shard = run.runner("dashboard", 1);
  const cwd = fileURLToPath(root).replace(/\/$/, "");
  writeFileSync(
    declaredPart("dashboard", 1, shard).report(
      "OPEN_DOUGH_DASHBOARD_PROOF_RECORD",
    ),
    JSON.stringify(
      locatedRecord(cwd, [
        [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [35]],
        [`${cwd}/dashboard/frontend-tests/dom.spec.ts`, "expected", [20]],
        [`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [50]],
        [`${cwd}/dashboard/backend-tests/problem.spec.ts`, "unexpected", [15]],
      ]),
    ),
  );
  const kept = [
    ["test", 1, share],
    ["test", 2, failed],
    ["dashboard", 1, shard],
  ].map(([job, part, temp]) =>
    run.fragments(job, part, temp, declaredPart(job, part, temp).inputs),
  );
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
    ],
  );
  const summary = run.summary(stepInputs(summaryStep).expect);
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    [
      `dashboard/tests: 1 passed, 0 failed, 0 other test cases; ${missingAfterFirst(12)}`,
      `dashboard/frontend-tests: 1 passed, 0 failed, 0 other test cases; ${missingAfterFirst(12)}`,
      `dashboard/backend-tests: 1 passed, 1 failed, 0 other test cases; ${missingAfterFirst(12)}`,
      `tests: 1 passed, 0 failed, 0 other test files; ${missingAfterFirst(3)}`,
      `src/skills: 1 passed, 1 failed, 0 other test files; ${missingAfterFirst(3)}`,
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
      "dashboard/tests 35 ms: dashboard/tests/browser.spec.ts 1 passed 0 failed",
      "dashboard/frontend-tests 20 ms: dashboard/frontend-tests/dom.spec.ts 1 passed 0 failed",
      "dashboard/backend-tests 65 ms: dashboard/backend-tests/problem.spec.ts 0 passed 1 failed",
      "dashboard/backend-tests 65 ms: dashboard/backend-tests/server.spec.ts 1 passed 0 failed",
      "tests 200 ms: tests/a.sh 1 passed 0 failed",
      "src/skills 3000 ms: src/skills/x/scripts/b.test.mjs 0 passed 1 failed",
      "src/skills 3000 ms: src/skills/x/scripts/five-cases.test.mjs 1 passed 0 failed",
    ],
  );
});
