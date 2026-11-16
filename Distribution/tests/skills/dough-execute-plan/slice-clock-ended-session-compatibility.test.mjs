import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { recordPath } from "../../../src/skills/dough-execute-plan/scripts/slice-clock-record.mjs";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import {
  limitReport,
  limitReportsOf,
} from "../../support/slice-clock-limit-reports.mjs";
import {
  clockRecord,
  executionWorktree,
  proofFiles,
  shellThroughClock,
} from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#discard-time-after-an-ended-session";
const slice = (key = "3") => ["--identity", story, "--slice", key];
const { withinLimit, overrun } = limitReportsOf(story);
const at = (time) => Date.parse(`2026-11-16T${time}:00Z`);

test("run completion records its end, and a legacy record settles at its latest command timestamp", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(2);
  await shellThroughClock(
    clock,
    worktree,
    proofFiles(scratch, "suite"),
    time.shellStepTo(9),
  );
  const legacy = await clockRecord(worktree);
  assert.equal(legacy.lastClockCommandAt, at("09:09"));
  delete legacy.lastClockCommandAt;
  writeFileSync(recordPath(worktree), JSON.stringify(legacy));
  time.at(249);
  const resumed = await clock(
    worktree,
    "start",
    ...slice(),
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(resumed), withinLimit("3", 2, 0));
  assert.equal(
    (await clockRecord(worktree)).stories[story].slices[3].periods[0].endedAt,
    at("09:09"),
  );
});

test("a legacy record with only periods settles at its latest period timestamp", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(2);
  await clock(worktree, "pause");
  time.at(7);
  await clock(worktree, "start", ...slice("4"));
  const legacy = await clockRecord(worktree);
  delete legacy.lastClockCommandAt;
  writeFileSync(recordPath(worktree), JSON.stringify(legacy));
  time.at(247);
  const resumed = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(resumed), withinLimit("4", 0, 0));
  assert.equal(
    (await clockRecord(worktree)).stories[story].slices[4].periods[0].endedAt,
    at("09:07"),
  );
});

test("host hooks leave the last clock command unchanged and a new session preserves the overrun they already detected", async (t) => {
  const { worktree, time, clock, hook } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(9);
  await clock(worktree, "status");
  const input = {
    hook_event_name: "PostToolUse",
    session_id: "ended-session",
    cwd: worktree,
    tool_name: "Bash",
  };
  time.at(14);
  assert.deepEqual((await hook("claude", input)).result, {});
  assert.equal((await clockRecord(worktree)).lastClockCommandAt, at("09:09"));
  time.at(16);
  assert.match(
    (await hook("claude", input)).result.hookSpecificOutput.additionalContext,
    /reached the 15-minute limit/,
  );
  assert.equal((await clockRecord(worktree)).lastClockCommandAt, at("09:09"));
  time.at(249);
  const resumed = await clock(
    worktree,
    "start",
    ...slice(),
    "--after-ended-session",
  );
  assert.equal(resumed.result.elapsedMinutes, 9);
  assert.equal(resumed.result.remainingMinutes, 6);
  assert.equal(resumed.result.overrun, true);
  assert.equal(resumed.result.storyOverruns, 1);
  assert.equal(
    (await clockRecord(worktree)).stories[story].slices[3].overrunDetectedAt,
    at("09:16"),
  );
});

test("a new session can continue a renamed slice or split a detected overrun without losing the story's overrun", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(9);
  await clock(worktree, "status");
  time.at(249);
  const renamed = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--after-ended-session",
    "--continues",
    "3",
  );
  assert.deepEqual(limitReport(renamed), withinLimit("4", 9, 0));
  time.at(255);
  assert.deepEqual(
    limitReport(await clock(worktree, "status")),
    overrun("4", 15, 1),
  );
  time.at(495);
  const split = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--split-from",
    "4",
    "--after-ended-session",
  );
  assert.deepEqual(limitReport(split), withinLimit("4", 0, 1));
});

test("settlement itself does not detect another slice's overrun, but reporting its settled limit still does", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice());
  time.at(15);
  // Starting a run records a clock command without reporting the slice yet.
  const files = proofFiles(scratch, "waiting");
  const marker = join(scratch, "started");
  const release = join(scratch, "release");
  const run = shellThroughClock(
    clock,
    worktree,
    files,
    `touch "${marker}"; until [ -e "${release}" ]; do sleep 0.02; done`,
  );
  try {
    await until("the run started", () => existsSync(marker));
    time.at(255);
    const started = await clock(
      worktree,
      "start",
      ...slice("4"),
      "--after-ended-session",
    );
    assert.deepEqual(limitReport(started), withinLimit("4", 0, 0));
    assert.equal(
      (await clockRecord(worktree)).stories[story].slices[3].overrunDetectedAt,
      undefined,
    );
    const settled = await clock(worktree, "status", ...slice());
    assert.deepEqual(limitReport(settled), overrun("3", 15, 1));
  } finally {
    writeFileSync(release, "");
    await run;
  }
  assert.equal(
    (await clockRecord(worktree)).stories[story].slices[3].commands[0].endedAt,
    at("09:15"),
  );
});
