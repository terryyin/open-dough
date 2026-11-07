// The optional file breakdown of CI proof fragments
// (ci-proof-figures.mjs "File breakdown"): converters keep repository paths
// and within-part timing coverage, and leave what is not a path inside the
// entry unassigned. Summing and validation:
// ci-proof-breakdown-summary.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { fragmentProblems } from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  byFile,
  locatedRecord,
  partIdentity,
} from "./ci-proof-test-fixtures.mjs";

test("a Playwright record broken down by file names repository paths from its run directory, never machine paths", () => {
  const cwd = "/home/runner/work/open-dough/open-dough";
  const at = (path) => `${cwd}/${path}`;
  const [value] = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [
      [at("dashboard/tests/a.spec.ts"), "expected", [200]],
      [at("dashboard/tests/a.spec.ts"), "flaky", [40, 60]],
      [at("dashboard/tests/folder/b.spec.ts"), "expected", [0]],
      [at("dashboard/tests/folder/nested/c.spec.ts"), "skipped", [undefined]],
      ["/elsewhere/dashboard/tests/d.spec.ts", "expected", [5]],
      [undefined, "expected", [7]],
      [at("dashboard/other/e.spec.ts"), "expected", [9]],
    ]),
    partIdentity(["dashboard/tests"], 2, 12),
    byFile,
  );
  assert.deepEqual(fragmentProblems(value), []);
  assert.deepEqual(
    [value.passed, value.failed, value.other, value.durationMs, value.untimed],
    [5, 1, 1, 321, 1],
  );
  assert.deepEqual(value.files, [
    {
      path: "dashboard/tests/a.spec.ts",
      passed: 1,
      failed: 1,
      other: 0,
      durationMs: 300,
    },
    // A measured zero stays zero.
    {
      path: "dashboard/tests/folder/b.spec.ts",
      passed: 1,
      failed: 0,
      other: 0,
      durationMs: 0,
    },
    {
      path: "dashboard/tests/folder/nested/c.spec.ts",
      passed: 0,
      failed: 0,
      other: 1,
      untimed: 1,
    },
  ]);
  // A file outside the run directory, without a location, or outside the
  // entry is counted, unassigned, with its time.
  assert.deepEqual(value.unassigned, {
    passed: 3,
    failed: 0,
    other: 0,
    durationMs: 21,
  });
  assert.equal(JSON.stringify(value).includes("/home/runner"), false);
  assert.equal(JSON.stringify(value).includes("/elsewhere"), false);
});

test("without --by-file a Playwright record keeps entry totals only", () => {
  const cwd = "/w";
  const [value] = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [[`${cwd}/dashboard/tests/a.spec.ts`, "expected", [3]]]),
    partIdentity(["dashboard/tests"]),
  );
  assert.equal("files" in value, false);
  assert.equal("untimed" in value, false);
  assert.equal(value.durationMs, 3);
});

test("an outcomes file broken down by file keeps each check's path and leaves a check without times untimed", () => {
  const outcomes = [
    "passed\ttests/root.sh",
    "passed\ttests/support/check.test.mjs",
    "failed\tsrc/skills/x/scripts/a.test.mjs",
    "passed\tscripts/elsewhere.sh",
  ].join("\n");
  const times = [
    "1.5\ttests/root.sh",
    "0\tsrc/skills/x/scripts/a.test.mjs",
  ].join("\n");
  const [tests, skills] = fragmentsFromOutcomes(
    outcomes,
    partIdentity(["tests", "src/skills"]),
    times,
    byFile,
  );
  for (const value of [tests, skills])
    assert.deepEqual(fragmentProblems(value), []);
  assert.deepEqual(
    [tests.passed, tests.durationMs, tests.untimed],
    [2, 1500, 1],
  );
  assert.deepEqual(tests.files, [
    { path: "tests/root.sh", passed: 1, failed: 0, other: 0, durationMs: 1500 },
    {
      path: "tests/support/check.test.mjs",
      passed: 1,
      failed: 0,
      other: 0,
      untimed: 1,
    },
  ]);
  assert.equal("unassigned" in tests, false);
  assert.deepEqual(skills.files, [
    {
      path: "src/skills/x/scripts/a.test.mjs",
      passed: 0,
      failed: 1,
      other: 0,
      durationMs: 0,
    },
  ]);
  assert.equal(skills.untimed, 0);
  // Without times every check is untimed and no duration is invented.
  const [untimed] = fragmentsFromOutcomes(
    outcomes,
    partIdentity(["tests"]),
    undefined,
    byFile,
  );
  assert.equal("durationMs" in untimed, false);
  assert.equal(untimed.untimed, 2);
});

test("timed and untimed outcomes in one file keep a partial duration", () => {
  const path = "tests/mixed.sh";
  const [value] = fragmentsFromOutcomes(
    [`passed\t${path}`, `other\t${path}`, `failed\t${path}`].join("\n"),
    partIdentity(["tests"]),
    [`0.125\t${path}`, `0.375\t${path}`].join("\n"),
    byFile,
  );
  assert.equal(value.untimed, 1);
  assert.deepEqual(value.files, [
    { path, passed: 1, failed: 1, other: 1, durationMs: 500, untimed: 1 },
  ]);
});

test("an outcomes label that is not a path inside its entry is unassigned, keeping its count and time", () => {
  const [value] = fragmentsFromOutcomes(
    "passed\ttests/./odd.sh\nfailed\ttests/a.sh\n",
    partIdentity(["tests"]),
    "2\ttests/./odd.sh\n",
    byFile,
  );
  assert.deepEqual(fragmentProblems(value), []);
  assert.deepEqual(value.files, [
    { path: "tests/a.sh", passed: 0, failed: 1, other: 0, untimed: 1 },
  ]);
  assert.deepEqual(value.unassigned, {
    passed: 1,
    failed: 0,
    other: 0,
    durationMs: 2000,
  });
});
