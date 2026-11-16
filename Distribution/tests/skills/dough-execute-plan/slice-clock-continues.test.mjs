import assert from "node:assert/strict";
import test from "node:test";
import {
  limitReport,
  limitReportsOf,
} from "../../support/slice-clock-limit-reports.mjs";
import { executionWorktree } from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#count-slice-active-time-deterministically";
const { withinLimit, overrun } = limitReportsOf(story);

function slice(key) {
  return ["--identity", story, "--slice", key];
}

test("a 13-minute slice refined in place with a new title resumes with 2 minutes remaining, also when renumbered to key 4", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice("3"));
  time.at(13);
  await clock(worktree, "pause");
  time.at(40);

  const retitled = await clock(
    worktree,
    "start",
    ...slice("3"),
    "--continues",
    "3",
  );
  await clock(worktree, "pause");
  const renumbered = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--continues",
    "3",
  );
  const oldKey = await clock(worktree, "status", ...slice("3"));
  time.at(42);
  const atLimit = await clock(worktree, "status");

  assert.deepEqual(limitReport(retitled), withinLimit("3", 13, 0));
  assert.equal(retitled.result.remainingMinutes, 2);
  assert.deepEqual(limitReport(renumbered), withinLimit("4", 13, 0));
  assert.equal(renumbered.result.state, "running");
  assert.equal(oldKey.stderr, `no record of slice 3 of ${story}\n`);
  assert.deepEqual(limitReport(atLimit), overrun("4", 15, 1));
});

test("a slice that overran keeps its one overrun when it continues under a new key", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice("3"));
  time.at(16);
  await clock(worktree, "pause");

  const renumbered = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--continues",
    "3",
  );

  assert.deepEqual(limitReport(renumbered), overrun("4", 16, 1));
});

test("continuing a slice the story has no record of, or onto a key that has one, is refused", async (t) => {
  const { worktree, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...slice("3"));
  await clock(worktree, "pause");
  await clock(worktree, "start", ...slice("4"));
  await clock(worktree, "pause");

  const unknown = await clock(
    worktree,
    "start",
    ...slice("5"),
    "--continues",
    "9",
  );
  const taken = await clock(
    worktree,
    "start",
    ...slice("4"),
    "--continues",
    "3",
  );

  assert.equal(unknown.exitStatus, 1);
  assert.equal(
    unknown.stderr,
    `no record of slice 9 of ${story} to continue\n`,
  );
  assert.equal(taken.exitStatus, 1);
  assert.equal(taken.stderr, `slice 4 of ${story} already has a record\n`);
});
