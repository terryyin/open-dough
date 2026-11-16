import assert from "node:assert/strict";
import test from "node:test";
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

const story = "SEED-367#count-slice-active-time-deterministically";
const { withinLimit, overrun } = limitReportsOf(story);

function slice(key) {
  return ["--identity", story, "--slice", key];
}

// The overruns the story's record keeps in the worktree's Git state.
async function recordedOverruns(worktree) {
  return (await clockRecord(worktree)).stories[story].overruns;
}

test("an implementer who passes 15 active minutes without a command reads the overrun and the elapsed time at the next status and the next run, counted once in the story's record", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const suite = proofFiles(scratch, "suite");
  await clock(worktree, "start", ...slice("3"));

  time.at(14);
  const before = await clock(worktree, "status");
  time.at(15);
  const atLimit = await clock(worktree, "status");
  time.at(17);
  const ran = await shellThroughClock(clock, worktree, suite, "exit 0");
  const handedBack = await clock(worktree, "pause");
  const later = await clock(worktree, "status", ...slice("3"));

  assert.deepEqual(limitReport(before), withinLimit("3", 14, 0));
  assert.deepEqual(limitReport(atLimit), overrun("3", 15, 1));
  assert.deepEqual(limitReport(ran), overrun("3", 17, 1));
  assert.equal(ran.exitStatus, 0);
  assert.deepEqual(limitReport(handedBack), overrun("3", 17, 1));
  assert.deepEqual(limitReport(later), overrun("3", 17, 1));
  assert.equal((await recordedOverruns(worktree)).length, 1);
});

test("an overrun first seen by a run through the clock is counted once", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const suite = proofFiles(scratch, "suite");
  await clock(worktree, "start", ...slice("3"));
  time.at(16);

  const ran = await shellThroughClock(clock, worktree, suite, "exit 4");
  const status = await clock(worktree, "status");

  assert.deepEqual(limitReport(ran), overrun("3", 16, 1));
  assert.equal(ran.exitStatus, 4);
  assert.deepEqual(limitReport(status), overrun("3", 16, 1));
});

test("a slice split after an overrun starts each new slice at 15 remaining, and the story's record keeps the overrun so a second one shows as 2", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice("3"));
  time.at(16);
  await clock(worktree, "pause");

  const first = await clock(worktree, "start", ...slice("3a"));
  time.at(20);
  await clock(worktree, "pause");
  const second = await clock(worktree, "start", ...slice("3b"));
  const afterSplit = await recordedOverruns(worktree);
  time.at(35);
  const secondOverrun = await clock(worktree, "status");

  assert.deepEqual(limitReport(first), withinLimit("3a", 0, 1));
  assert.deepEqual(limitReport(second), withinLimit("3b", 0, 1));
  assert.equal(second.result.remainingMinutes, 15);
  assert.equal(afterSplit.length, 1);
  assert.equal(afterSplit[0].slice, "3");
  assert.deepEqual(limitReport(secondOverrun), overrun("3b", 15, 2));
});

test("a slice split after an overrun onto its own number starts at 15 remaining, and the next split slice leaves the new slice's time alone", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  const splitFromThree = ["--split-from", "3"];
  await clock(worktree, "start", ...slice("3"));
  time.at(16);
  await clock(worktree, "pause");

  const first = await clock(
    worktree,
    "start",
    ...slice("3"),
    ...splitFromThree,
  );
  time.at(20);
  await clock(worktree, "pause");
  const second = await clock(
    worktree,
    "start",
    ...slice("4"),
    ...splitFromThree,
  );
  const newThree = await clock(worktree, "status", ...slice("3"));
  const both = await clock(
    worktree,
    "start",
    ...slice("5"),
    ...splitFromThree,
    "--continues",
    "3",
  );

  assert.deepEqual(limitReport(first), withinLimit("3", 0, 1));
  assert.equal(first.result.remainingMinutes, 15);
  assert.deepEqual(limitReport(second), withinLimit("4", 0, 1));
  assert.deepEqual(limitReport(newThree), withinLimit("3", 4, 1));
  assert.equal((await recordedOverruns(worktree)).length, 1);
  assert.equal(both.exitStatus, 2);
  assert.match(both.stderr, /^name --continues or --split-from, not both\n/);
});
