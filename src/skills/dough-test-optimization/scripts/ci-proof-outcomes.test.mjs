// An outcomes report, one `<status><TAB><check path>` line per check, as CI
// proof fragments (ci-proof-fragments.mjs): each check counts toward the
// entry whose path contains it, with its seconds from a times file. Declared
// units: ci-proof-units.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { fragmentsFromOutcomes } from "./ci-proof-fragments.mjs";
import { fragment, revision } from "./ci-proof-test-fixtures.mjs";

// An outcomes file that declares no unit: legacy results, labelled checks.
const checks = { unit: "legacy", label: "checks" };

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
    fragment("tests", 1, 3, { passed: 1, failed: 1 }, checks),
    fragment("src/skills", 1, 3, { passed: 1, other: 1 }, checks),
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
    fragment(
      "tests",
      1,
      3,
      { passed: 1, failed: 1 },
      { ...checks, durationMs: 1600 },
    ),
    fragment("src/skills", 1, 3, { passed: 1 }, { ...checks, durationMs: 250 }),
  ]);
});
