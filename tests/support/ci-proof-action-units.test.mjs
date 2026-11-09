// The two local CI proof actions' scripts keep one location's test cases and
// test files apart when its producers report both units, each declared in
// the summary (`<entry>=<parts>:case` and `:file`). Open Dough's own CI
// replayed: ./ci-proof-actions.test.mjs.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";
import { runAttempt } from "./ci-proof-action-fixtures.mjs";

test("one location's producers may report both units: the actions keep its test cases and test files apart, even for one path", (t) => {
  const run = runAttempt(t);
  const cwd = "/runner/project";
  const browser = run.runner("browser", 1);
  const node = run.runner("node", 1);
  writeFileSync(
    join(browser, "proof.json"),
    JSON.stringify(
      locatedRecord(
        cwd,
        [10, 20, 30, 40, 50].map((ms) => [
          `${cwd}/tests/check.test.mjs`,
          "expected",
          [ms],
        ]),
      ),
    ),
  );
  // The same file's own aggregate outcome, and a failed file job that
  // reported no cases.
  writeFileSync(
    join(node, "outcomes.txt"),
    "passed\ttests/check.test.mjs\nfailed\ttests/broken.test.mjs\n",
  );
  const kept = [
    run.fragments("browser", 1, browser, {
      entries: "tests",
      "report-format": "playwright-record",
      report: join(browser, "proof.json"),
      parts: "1",
    }),
    run.fragments("node", 1, node, {
      entries: "tests",
      "report-format": "outcomes",
      unit: "file",
      report: join(node, "outcomes.txt"),
      parts: "1",
    }),
  ];
  assert.deepEqual(
    kept.map((result) => [result.status, result.stdout, result.stderr]),
    [
      [0, "", ""],
      [0, "", ""],
    ],
  );
  const summary = run.summary("tests=1:case tests=1:file");
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    "tests: 5 passed, 0 failed, 0 other test cases\ntests: 1 passed, 1 failed, 0 other test files\n",
  );
  assert.deepEqual(summaryProblems(summary.written), []);
  assert.deepEqual(
    summary.written.entries.flatMap(({ path, evidence }) =>
      evidence.flatMap(({ unit, durationMs, untimed, files }) => {
        const time = durationMs === undefined ? "no time" : `${durationMs} ms`;
        return files.map(
          (file) =>
            `${path} ${unit}, ${time}, ${untimed} untimed: ${file.path} ${file.passed} passed ${file.failed} failed`,
        );
      }),
    ),
    [
      "tests case, 150 ms, 0 untimed: tests/check.test.mjs 5 passed 0 failed",
      "tests file, no time, 2 untimed: tests/broken.test.mjs 0 passed 1 failed",
      "tests file, no time, 2 untimed: tests/check.test.mjs 1 passed 0 failed",
    ],
  );
});
