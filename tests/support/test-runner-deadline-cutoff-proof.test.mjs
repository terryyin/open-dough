import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { replayCutoffFragments } from "./test-runner-deadline-cutoff-helpers.mjs";
import {
  awaitReady,
  bashHangCheck,
  deadlineRepository,
  observeDir,
  pastDeadlineMs,
  runDeadlineSuite,
} from "./test-runner-deadline-fixtures.mjs";

const fixtureEntry = "tests/runner-deadline-fixture";

test("run cutoff fails when disabled and the real cutoff reports feed CI proof as failed/other", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      [`${fixtureEntry}/a.sh`]: bashHangCheck(),
      [`${fixtureEntry}/b.sh`]: bashHangCheck(),
    },
  });
  const disabledObservation = observeDir(t, root, "disabled");
  const disabled = runDeadlineSuite(
    t,
    project,
    disabledObservation,
    {
      CI: "true",
      OPEN_DOUGH_TEST_DIR: fixtureEntry,
      OPEN_DOUGH_TEST_DEADLINE_MS: pastDeadlineMs(),
      OPEN_DOUGH_TEST_DISABLE_RUN_DEADLINE: "1",
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    [`${fixtureEntry}/a.sh`],
  );
  await awaitReady(disabledObservation, disabled);
  writeFileSync(path.join(disabledObservation, "release"), "");
  const disabledResult = await disabled.result;
  assert.equal(disabledResult.code, 0, disabledResult.output);

  const observation = observeDir(t, root, "proof-cutoff");
  const times = path.join(root, "proof-times");
  const outcomes = path.join(root, "proof-outcomes");
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      CI: "true",
      OPEN_DOUGH_TEST_DIR: fixtureEntry,
      OPEN_DOUGH_TEST_DEADLINE_MS: pastDeadlineMs(),
      OPEN_DOUGH_TEST_TIMES: times,
      OPEN_DOUGH_TEST_OUTCOMES: outcomes,
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    [`${fixtureEntry}/a.sh`, `${fixtureEntry}/b.sh`],
  );
  const result = await run.result;
  assert.notEqual(result.code, 0, result.output);
  assert.equal(
    readFileSync(outcomes, "utf8"),
    `unfinished\t${fixtureEntry}/a.sh\nunfinished\t${fixtureEntry}/b.sh\n`,
  );
  assert.equal(readFileSync(times, "utf8").trim(), "");

  const { summary, files } = replayCutoffFragments(
    t,
    readFileSync(outcomes, "utf8"),
    readFileSync(times, "utf8"),
  );
  assert.match(summary.stdout, /tests: 0 passed, 0 failed, 2 other test files/);
  assert.deepEqual(
    files.map((file) => [
      file.path,
      file.passed,
      file.failed,
      file.other,
      file.durationMs,
      file.untimed,
    ]),
    [
      [`${fixtureEntry}/a.sh`, 0, 0, 1, undefined, 1],
      [`${fixtureEntry}/b.sh`, 0, 0, 1, undefined, 1],
    ],
  );
});
