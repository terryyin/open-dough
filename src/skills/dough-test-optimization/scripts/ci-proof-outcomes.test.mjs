// An outcomes report, one `<status><TAB><check path>` line per check, as CI
// proof fragments (ci-proof-fragments.mjs): each check counts toward the
// entry whose path contains it, with its seconds from a times file. Declared
// units: ci-proof-units.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { fragmentsFromOutcomes } from "./ci-proof-fragments.mjs";
import { revision } from "./ci-proof-test-fixtures.mjs";

test("an outcomes path never declares a unit, including dashboard/tests", () => {
  const entries = ["dashboard/tests", "dashboard/backend-tests", "tests"];
  const values = fragmentsFromOutcomes(
    entries.map((entry) => `passed\t${entry}/a.spec.ts\n`).join(""),
    { entries, part: 1, of: 1, attempt: 2, revision },
  );
  assert.deepEqual(
    values.map(({ entry, unit, label, passed }) => [
      entry,
      unit,
      label,
      passed,
    ]),
    [
      ["dashboard/tests", "legacy", "checks", 1],
      ["dashboard/backend-tests", "legacy", "checks", 1],
      ["tests", "legacy", "checks", 1],
    ],
  );
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
    {
      schemaVersion: 2,
      entry: "tests",
      part: 1,
      of: 3,
      attempt: 2,
      revision,
      unit: "legacy",
      passed: 1,
      failed: 1,
      other: 0,
      label: "checks",
    },
    {
      schemaVersion: 2,
      entry: "src/skills",
      part: 1,
      of: 3,
      attempt: 2,
      revision,
      unit: "legacy",
      passed: 1,
      failed: 0,
      other: 1,
      label: "checks",
    },
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
    {
      schemaVersion: 2,
      entry: "tests",
      part: 1,
      of: 3,
      attempt: 2,
      revision,
      unit: "legacy",
      passed: 1,
      failed: 1,
      other: 0,
      label: "checks",
      durationMs: 1600,
    },
    {
      schemaVersion: 2,
      entry: "src/skills",
      part: 1,
      of: 3,
      attempt: 2,
      revision,
      unit: "legacy",
      passed: 1,
      failed: 0,
      other: 0,
      label: "checks",
      durationMs: 250,
    },
  ]);
});
