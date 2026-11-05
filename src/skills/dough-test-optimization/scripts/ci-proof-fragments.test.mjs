import assert from "node:assert/strict";
import test from "node:test";
import { fragmentProblems } from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  attemptId,
  fragment,
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
