import { makeMe } from "./makeMe.mjs";
import { durationListText } from "./job-duration-list.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { replayCutoffFragments } from "./test-runner-deadline-cutoff-helpers.mjs";
import {
  awaitReady,
  bashHangCheck,
  deadlineRepository,
  expireDeadline,
  futureDeadlineMs,
  observeDir,
  pastDeadlineMs,
  processRunning,
  readRunDeadlineReady,
  runDeadlineSuite,
} from "./test-runner-deadline-fixtures.mjs";

const fixtureEntry = "Distribution/tests/runner-deadline-fixture";

test("a past CI run cutoff starts no checks and records unfinished outcomes", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      [`${fixtureEntry}/hang.sh`]: bashHangCheck(),
      [`${fixtureEntry}/queued.sh`]: bashHangCheck(),
    },
  });
  const observation = observeDir(t, root, "past-cutoff");
  const times = path.join(root, "times");
  const outcomes = path.join(root, "outcomes");
  const deadline = pastDeadlineMs();
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      CI: "true",
      OPEN_DOUGH_TEST_DIR: fixtureEntry,
      OPEN_DOUGH_TEST_DEADLINE_MS: deadline,
      OPEN_DOUGH_TEST_TIMES: times,
      OPEN_DOUGH_TEST_OUTCOMES: outcomes,
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    [`${fixtureEntry}/hang.sh`, `${fixtureEntry}/queued.sh`],
  );
  const result = await run.result;
  assert.notEqual(result.code, 0, result.output);
  assert.match(
    result.output,
    new RegExp(
      `RUN DEADLINE: exhausted absolute cutoff \\(OPEN_DOUGH_TEST_DEADLINE_MS=${deadline}\\)`,
    ),
  );
  assert.match(
    result.output,
    new RegExp(
      `not started: ${fixtureEntry}/hang\\.sh, ${fixtureEntry}/queued\\.sh`,
    ),
  );
  assert.ok(!existsSync(path.join(observation, "ready")));
  assert.equal(readFileSync(times, "utf8").trim(), "");
  assert.equal(
    readFileSync(outcomes, "utf8"),
    `unfinished\t${fixtureEntry}/hang.sh\nunfinished\t${fixtureEntry}/queued.sh\n`,
  );
});

test("an absolute run cutoff stops running work and leaves queued checks unfinished without invented times", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      [`${fixtureEntry}/running.sh`]: bashHangCheck(),
      [`${fixtureEntry}/queued.sh`]: bashHangCheck(),
      [`${fixtureEntry}/longest-first`]: durationListText(
        makeMe.jobDurations
          .with([
            [`${fixtureEntry}/running.sh`, 10],
            [`${fixtureEntry}/queued.sh`, 9],
          ])
          .please(),
      ),
    },
  });
  const observation = observeDir(t, root, "mid-cutoff");
  const readyFile = path.join(root, "run-deadline-ready");
  const times = path.join(root, "times");
  const outcomes = path.join(root, "outcomes");
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      CI: "true",
      OPEN_DOUGH_TEST_DIR: fixtureEntry,
      OPEN_DOUGH_TEST_DEADLINE_MS: futureDeadlineMs(600),
      OPEN_DOUGH_TEST_RUN_DEADLINE_READY: readyFile,
      OPEN_DOUGH_TEST_TIMES: times,
      OPEN_DOUGH_TEST_OUTCOMES: outcomes,
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    [`${fixtureEntry}/running.sh`, `${fixtureEntry}/queued.sh`],
  );
  await awaitReady(observation, run);
  const armed = await readRunDeadlineReady(readyFile);
  assert.ok(armed.seconds > 0);
  const pid = Number(readFileSync(path.join(observation, "pid"), "utf8"));
  assert.ok(processRunning(pid));
  expireDeadline(armed.fifo);
  const result = await run.result;
  assert.notEqual(result.code, 0, result.output);
  assert.match(result.output, /RUN DEADLINE: exhausted absolute cutoff/);
  assert.match(
    result.output,
    new RegExp(`unfinished running: ${fixtureEntry}/running\\.sh`),
  );
  assert.match(
    result.output,
    new RegExp(`not started: ${fixtureEntry}/queued\\.sh`),
  );
  assert.match(
    result.output,
    new RegExp(
      `TIMEOUT: ${fixtureEntry}/running\\.sh \\(exhausted run deadline; after [0-9]+\\.[0-9]s\\)`,
    ),
  );
  assert.ok(!processRunning(pid));
  const timeText = readFileSync(times, "utf8");
  assert.match(
    timeText,
    new RegExp(`^[0-9]+\\.[0-9]\\t${fixtureEntry}/running\\.sh$`, "m"),
  );
  assert.doesNotMatch(timeText, new RegExp(`${fixtureEntry}/queued\\.sh`));
  const outcomeText = readFileSync(outcomes, "utf8");
  assert.match(
    outcomeText,
    new RegExp(`^failed\\t${fixtureEntry}/running\\.sh$`, "m"),
  );
  assert.match(
    outcomeText,
    new RegExp(`^unfinished\\t${fixtureEntry}/queued\\.sh$`, "m"),
  );

  const { summary, files } = replayCutoffFragments(t, outcomeText, timeText);
  assert.match(
    summary.stdout,
    /Distribution: 0 passed, 1 failed, 1 other test files/,
  );
  const byPath = Object.fromEntries(
    files.map((file) => [
      file.path,
      [
        file.passed,
        file.failed,
        file.other,
        file.durationMs !== undefined,
        file.untimed ?? 0,
      ],
    ]),
  );
  assert.deepEqual(byPath[`${fixtureEntry}/running.sh`], [0, 1, 0, true, 0]);
  assert.deepEqual(byPath[`${fixtureEntry}/queued.sh`], [0, 0, 1, false, 1]);
});
