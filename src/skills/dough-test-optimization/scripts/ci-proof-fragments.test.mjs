import assert from "node:assert/strict";
import test from "node:test";
import { fragmentProblems } from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  attemptId,
  byFile,
  fragment,
  locatedRecord,
  partIdentity,
  playwrightRecord,
  revision,
} from "./ci-proof-test-fixtures.mjs";

test("a Playwright proof record counts tests: expected passes, unexpected or flaky fails, the rest are other", () => {
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
    assert.equal(value.unit, "tests");
    assert.deepEqual(fragmentProblems(value), []);
  }
});

test("a shared Playwright shard emits a zero-count fragment for an entry it selected no tests from", () => {
  const [browser, backend] = fragmentFromPlaywrightRecord(
    locatedRecord("/runner", [
      ["/runner/dashboard/tests/a.spec.ts", "expected", [3]],
    ]),
    partIdentity(["dashboard/tests", "dashboard/backend-tests"]),
    byFile,
  );
  assert.equal(browser.passed, 1);
  assert.deepEqual(
    backend,
    fragment(
      "dashboard/backend-tests",
      1,
      1,
      {},
      {
        unit: "tests",
        untimed: 0,
        files: [],
      },
    ),
  );
  assert.deepEqual(fragmentProblems(backend), []);
});

test("an outcomes file counts each check toward the entry whose path contains it, and a check in no entry toward none", () => {
  const identity = {
    entries: ["tests", "src/skills"],
    part: 1,
    of: 3,
    attempt: 2,
    revision,
  };
  const outcomes = [
    "passed\ttests/a.sh",
    "failed\ttests/support/b.test.mjs",
    "passed\tsrc/skills/x/scripts/c.test.mjs",
    "interrupted\tsrc/skills/y/scripts/d.test.mjs",
    "failed\tscripts/check-self-installation.sh",
    "passed\ttestsuite/e.sh",
    "",
  ].join("\n");
  assert.deepEqual(fragmentsFromOutcomes(outcomes, identity), [
    fragment("tests", 1, 3, { passed: 1, failed: 1 }),
    fragment("src/skills", 1, 3, { passed: 1, other: 1 }),
  ]);
});

test("an outcomes file with a times file sets each matching entry's durationMs from its checks' seconds", () => {
  const identity = {
    entries: ["tests", "src/skills"],
    part: 1,
    of: 3,
    attempt: 2,
    revision,
  };
  const outcomes = [
    "passed\ttests/a.sh",
    "failed\ttests/support/b.test.mjs",
    "passed\tsrc/skills/x/scripts/c.test.mjs",
  ].join("\n");
  const times = [
    "0.1\ttests/a.sh",
    "1.5\ttests/support/b.test.mjs",
    "0.25\tsrc/skills/x/scripts/c.test.mjs",
    "9.0\tscripts/check-self-installation.sh",
    "",
  ].join("\n");
  assert.deepEqual(fragmentsFromOutcomes(outcomes, identity, times), [
    fragment("tests", 1, 3, { passed: 1, failed: 1 }, { durationMs: 1600 }),
    fragment("src/skills", 1, 3, { passed: 1 }, { durationMs: 250 }),
  ]);
});

test("an adapter attempt's identity names its fragment by attemptId", () => {
  const [value] = fragmentsFromOutcomes("passed\ttests/a.sh\n", {
    entries: ["tests"],
    part: 1,
    of: 1,
    attemptId,
    revision,
  });
  assert.equal(value.attemptId, attemptId);
  assert.equal("attempt" in value, false);
  assert.deepEqual(fragmentProblems(value), []);
});
