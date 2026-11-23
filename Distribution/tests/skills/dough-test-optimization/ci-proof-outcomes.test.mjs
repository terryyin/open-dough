// An outcomes report, one `<status><TAB><check path>` line per check, as CI
// proof fragments (ci-proof-fragments.mjs): each check counts toward the
// entry whose path contains it, with its seconds from a times file. Declared
// units: ci-proof-units.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { fragmentsFromOutcomes } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs";
import { partIdentity } from "./ci-proof-test-fixtures.mjs";

test("an outcomes path never declares a unit, including dashboard/tests", () => {
  const entries = ["dashboard/tests", "dashboard/backend-tests", "tests"];
  assert.throws(
    () =>
      fragmentsFromOutcomes(
        entries.map((entry) => `passed\t${entry}/a.spec.ts\n`).join(""),
        partIdentity(entries),
      ),
    /outcomes require a unit of case or file/,
  );
});

test("an outcomes file counts each check toward the entry whose path contains it, and a check in no entry toward none", () => {
  const identity = partIdentity(["tests", "src/skills"]);
  const outcomes = [
    "passed\ttests/a.sh",
    "failed\ttests/support/b.test.mjs",
    "passed\tsrc/skills/x/scripts/c.test.mjs",
    "interrupted\tsrc/skills/y/scripts/d.test.mjs",
    "failed\tscripts/check-self-installation.sh",
    "passed\ttestsuite/e.sh",
    "",
  ].join("\n");
  const values = fragmentsFromOutcomes(outcomes, identity, undefined, {
    unit: "file",
  });
  const countsByEntry = new Map(
    values.map(({ entry, passed, failed, other }) => [
      entry,
      { passed, failed, other },
    ]),
  );
  assert.deepEqual(
    countsByEntry,
    new Map([
      ["tests", { passed: 1, failed: 1, other: 0 }],
      ["src/skills", { passed: 1, failed: 0, other: 1 }],
    ]),
  );
});

test("an outcomes file with a times file sets each matching entry's durationMs from its checks' seconds", () => {
  const identity = partIdentity(["tests", "src/skills"]);
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
  const values = fragmentsFromOutcomes(outcomes, identity, times, {
    unit: "file",
  });
  const durationsByEntry = new Map(
    values.map(({ entry, durationMs }) => [entry, durationMs]),
  );
  assert.deepEqual(
    durationsByEntry,
    new Map([
      ["tests", 1600],
      ["src/skills", 250],
    ]),
  );
});
