// A dashboard proof record as CI proof fragments (ci-proof-fragments.mjs):
// each test one test case, its time summed over every finished attempt, and
// a shared record partitioned into its most specific entries. Outcomes
// reports: ci-proof-outcomes.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { fragmentProblems } from "./ci-proof-contract.mjs";
import { fragmentFromPlaywrightRecord } from "./ci-proof-fragments.mjs";
import {
  byFile,
  fragment,
  locatedRecord,
  partIdentity,
  playwrightRecord,
  revision,
} from "./ci-proof-test-fixtures.mjs";

test("a Playwright proof record counts each test as a test case: expected passes, unexpected or flaky fails, the rest are other", () => {
  const identity = {
    entries: ["dashboard/tests"],
    part: 3,
    of: 12,
    attempt: 2,
    revision,
  };
  const [value] = fragmentFromPlaywrightRecord(
    playwrightRecord([
      "expected",
      "expected",
      "unexpected",
      "flaky",
      "skipped",
      undefined,
    ]),
    identity,
  );
  assert.deepEqual(
    value,
    fragment("dashboard/tests", 3, 12, { passed: 2, failed: 2, other: 2 }),
  );
  assert.equal("durationMs" in value, false);
  assert.deepEqual(fragmentProblems(value), []);
  assert.throws(
    () =>
      fragmentFromPlaywrightRecord(
        playwrightRecord(["expected"], "running"),
        identity,
      ),
    /did not complete a run \(phase running\)/,
  );
});

test("a Playwright proof record sums every finished attempt's durationMs, retries included", () => {
  const identity = {
    entries: ["dashboard/tests"],
    part: 1,
    of: 12,
    attempt: 2,
    revision,
  };
  const [value] = fragmentFromPlaywrightRecord(
    playwrightRecord(["expected", "flaky", "skipped"], "completed", [
      120,
      [40, 80],
      15,
    ]),
    identity,
  );
  assert.equal(value.durationMs, 255);
  assert.deepEqual(fragmentProblems(value), []);
});

test("a shared Playwright record partitions each test and its time into its most specific entry", () => {
  const cwd = "/runner/project";
  const entries = [
    "dashboard/tests",
    "dashboard/backend-tests",
    "dashboard/tests/nested",
  ];
  const values = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [
      [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [100]],
      [`${cwd}/dashboard/backend-tests/server.spec.ts`, "flaky", [20, 30]],
      [`${cwd}/dashboard/backend-tests/skipped.spec.ts`, "skipped"],
      [`${cwd}/dashboard/tests/nested/detail.spec.ts`, "expected", [0]],
      [`${cwd}/elsewhere/outside.spec.ts`, "expected", [999]],
    ]),
    partIdentity(entries, 2, 12),
    byFile,
  );
  assert.deepEqual(
    values.map(({ entry, passed, failed, other, durationMs, untimed }) => ({
      entry,
      passed,
      failed,
      other,
      durationMs,
      untimed,
    })),
    [
      {
        entry: entries[0],
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 100,
        untimed: 0,
      },
      {
        entry: entries[1],
        passed: 0,
        failed: 1,
        other: 1,
        durationMs: 50,
        untimed: 1,
      },
      {
        entry: entries[2],
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 0,
        untimed: 0,
      },
    ],
  );
  assert.deepEqual(
    values.map((value) => value.files.map((file) => file.path)),
    [
      ["dashboard/tests/browser.spec.ts"],
      [
        "dashboard/backend-tests/server.spec.ts",
        "dashboard/backend-tests/skipped.spec.ts",
      ],
      ["dashboard/tests/nested/detail.spec.ts"],
    ],
  );
  for (const value of values) {
    assert.equal(value.unit, "case");
    assert.deepEqual(fragmentProblems(value), []);
  }
});

test("a shared Playwright shard emits a zero-count fragment for an entry it selected no tests from", () => {
  const [browser, frontend, backend] = fragmentFromPlaywrightRecord(
    locatedRecord("/runner", [
      ["/runner/dashboard/tests/a.spec.ts", "expected", [3]],
    ]),
    partIdentity([
      "dashboard/tests",
      "dashboard/frontend-tests",
      "dashboard/backend-tests",
    ]),
    byFile,
  );
  assert.equal(browser.passed, 1);
  assert.deepEqual(
    frontend,
    fragment(
      "dashboard/frontend-tests",
      1,
      1,
      {},
      {
        untimed: 0,
        files: [],
      },
    ),
  );
  assert.deepEqual(
    backend,
    fragment(
      "dashboard/backend-tests",
      1,
      1,
      {},
      {
        untimed: 0,
        files: [],
      },
    ),
  );
  assert.deepEqual(fragmentProblems(frontend), []);
  assert.deepEqual(fragmentProblems(backend), []);
});
