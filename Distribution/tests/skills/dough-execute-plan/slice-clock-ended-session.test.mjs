import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import { endProcess } from "./process-lifetime-test-fixtures.mjs";
import {
  limitReport,
  limitReportsOf,
} from "../../support/slice-clock-limit-reports.mjs";
import {
  clockRecord,
  executionWorktree,
  proofFiles,
} from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#discard-time-after-an-ended-session";
const slice = (key = "3") => ["--identity", story, "--slice", key];
const { withinLimit } = limitReportsOf(story);
const at = (time) => Date.parse(`2026-11-16T${time}:00Z`);

test("a new session resumes the same slice at 9 elapsed and 6 remaining after the last status at 10:00, excluding the gap to 14:00", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  time.at(51);
  await clock(worktree, "start", ...slice());
  assert.equal((await clockRecord(worktree)).lastClockCommandAt, at("09:51"));
  time.at(60);
  await clock(worktree, "status");
  assert.equal((await clockRecord(worktree)).lastClockCommandAt, at("10:00"));

  time.at(300);
  const resumed = await clock(
    worktree,
    "start",
    ...slice(),
    "--after-ended-session",
  );
  const record = await clockRecord(worktree);
  assert.deepEqual(limitReport(resumed), withinLimit("3", 9, 0));
  assert.equal(resumed.result.state, "running");
  assert.deepEqual(record.stories[story].slices[3].periods, [
    { startedAt: at("09:51"), endedAt: at("10:00") },
    { startedAt: at("14:00"), endedAt: null },
  ]);
  assert.equal(record.lastClockCommandAt, at("14:00"));
  assert.equal(record.schemaVersion, 1);
  time.at(303);
  assert.deepEqual(
    limitReport(await clock(worktree, "status")),
    withinLimit("3", 12, 0),
  );
});

test("a new session starts a different slice without pause, while a plain start is still refused and the prior slice stays paused at 9 minutes", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(9);
  await clock(worktree, "status");
  time.at(249);
  const refused = await clock(worktree, "start", ...slice("4"));
  assert.equal(refused.exitStatus, 1);
  assert.equal(
    refused.stderr,
    `slice 3 of ${story} is running in this checkout; pause it first\n`,
  );
  const started = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(started), withinLimit("4", 0, 0));
  await clock(worktree, "pause");
  const previous = await clock(worktree, "start", ...slice());
  assert.equal(previous.result.state, "running");
  assert.deepEqual(limitReport(previous), withinLimit("3", 9, 0));
});

test("when nothing runs, a new session starts and resumes a paused slice just as plain start does, and pause records its command time", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  const initial = await clock(
    worktree,
    "start",
    ...slice(),
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(initial), withinLimit("3", 0, 0));
  time.at(9);
  await clock(worktree, "pause");
  assert.equal((await clockRecord(worktree)).lastClockCommandAt, at("09:09"));
  time.at(249);
  const resumed = await clock(
    worktree,
    "start",
    ...slice(),
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(resumed), withinLimit("3", 9, 0));
  assert.equal(resumed.result.state, "running");
});

test("killing the real run process leaves its command open, and a new session closes it at 10:02 so status at 14:03 counts 11 active minutes", async (t) => {
  const { worktree, scratch, time, clock, launchClock, defer } =
    await executionWorktree(t);
  const suite = proofFiles(scratch, "dead-suite");
  const childPid = join(scratch, "command-pid");
  time.at(54);
  await clock(worktree, "start", ...slice());
  time.at(62);
  const run = launchClock(
    worktree,
    "run",
    ...suite.flags,
    "--",
    "sh",
    "-c",
    `echo $$ > "${childPid}"; exec sleep 60`,
  );
  await until("the command started", () => existsSync(childPid));
  const commandPid = Number(readFileSync(childPid, "utf8"));
  defer(() => endProcess(commandPid, "sleep 60"));
  const beforeDeath = await clockRecord(worktree);
  assert.equal(beforeDeath.lastClockCommandAt, at("10:02"));
  assert.equal(beforeDeath.stories[story].slices[3].commands[0].endedAt, null);
  run.child.kill("SIGKILL");
  assert.equal((await run.finished).exitStatus, null);
  assert.equal(existsSync(suite.exitFile), false);
  time.at(300);
  await clock(worktree, "start", ...slice(), "--after-ended-session");
  const settled = (await clockRecord(worktree)).stories[story].slices[3];
  assert.equal(settled.periods[0].endedAt, at("10:02"));
  assert.equal(settled.commands[0].endedAt, at("10:02"));
  time.at(303);
  assert.deepEqual(
    limitReport(await clock(worktree, "status")),
    withinLimit("3", 11, 0),
  );
});
