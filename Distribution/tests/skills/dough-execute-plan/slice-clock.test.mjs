import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { git } from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import {
  clockRecord,
  executionWorktree,
  proofFiles,
  shellThroughClock,
} from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#count-slice-active-time-deterministically";
const sliceThree = ["--identity", story, "--slice", "3"];

function reported(command, state, elapsedMinutes, differing = {}) {
  return {
    command,
    identity: story,
    slice: "3",
    state,
    elapsedMinutes,
    remainingMinutes: 15 - elapsedMinutes,
    limitMinutes: 15,
    overrun: false,
    storyOverruns: 0,
    ...differing,
  };
}

test("a slice with nothing recorded starts at 15 remaining, and 6 minutes of work, a 9-minute command through the clock and 4 more minutes report 10 elapsed and 5 remaining", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const suite = proofFiles(scratch, "suite");

  const started = await clock(worktree, "start", ...sliceThree);
  time.at(6);
  const ran = await shellThroughClock(
    clock,
    worktree,
    suite,
    `echo suite passed; echo warned >&2; ${time.shellStepTo(15)}`,
  );
  time.at(19);
  const status = await clock(worktree, "status");

  assert.deepEqual(started.result, reported("start", "running", 0));
  assert.partialDeepStrictEqual(ran.result, reported("run", "running", 6));
  assert.equal(ran.exitStatus, 0);
  assert.equal(readFileSync(suite.log, "utf8"), "suite passed\nwarned\n");
  assert.equal(readFileSync(suite.exitFile, "utf8"), "0\n");
  assert.deepEqual(status.result, reported("status", "running", 10));
});

test("two overlapping commands through the clock are excluded once", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const long = proofFiles(scratch, "long");
  const short = proofFiles(scratch, "short");
  const longStarted = join(scratch, "long-started");
  const release = join(scratch, "release");
  await clock(worktree, "start", ...sliceThree);

  time.at(6);
  const longRun = shellThroughClock(
    clock,
    worktree,
    long,
    `touch "${longStarted}"; until [ -e "${release}" ]; do sleep 0.02; done`,
  );
  await until("the long command runs", () => existsSync(longStarted));
  time.at(8);
  await shellThroughClock(clock, worktree, short, time.shellStepTo(12));
  const during = await clock(worktree, "status");
  time.at(15);
  writeFileSync(release, "");
  await longRun;
  time.at(19);
  const status = await clock(worktree, "status");

  assert.equal(during.result.elapsedMinutes, 6);
  assert.deepEqual(status.result, reported("status", "running", 10));
});

test("a command that exits nonzero leaves its status in the exit file and its output in the log, and its time is excluded", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const suite = proofFiles(scratch, "suite");
  await clock(worktree, "start", ...sliceThree);
  time.at(2);

  const ran = await shellThroughClock(
    clock,
    worktree,
    suite,
    `echo 1 failed; ${time.shellStepTo(9)}; exit 3`,
  );
  const status = await clock(worktree, "status");

  assert.equal(readFileSync(suite.exitFile, "utf8"), "3\n");
  assert.equal(readFileSync(suite.log, "utf8"), "1 failed\n");
  assert.equal(ran.exitStatus, 3);
  assert.equal(ran.result.exitStatus, 3);
  assert.deepEqual(status.result, reported("status", "running", 2));
});

test("a command started outside the clock counts as active time", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...sliceThree);

  // The implementer's own 3-minute command: nothing tells the clock.
  time.at(3);

  assert.deepEqual(
    (await clock(worktree, "status")).result,
    reported("status", "running", 3),
  );
});

test("a slice handed back at 11 minutes and resumed after a 20-minute review has 4 remaining for the resumed implementer, a replacement and a later coordinator session in the same worktree", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  const elsewhereInWorktree = join(worktree, "docs");
  mkdirSync(elsewhereInWorktree);
  await clock(worktree, "start", ...sliceThree);

  time.at(11);
  const handedBack = await clock(worktree, "pause");
  time.at(31);
  const reviewed = await clock(worktree, "status", ...sliceThree);
  const resumed = await clock(elsewhereInWorktree, "start", ...sliceThree);
  const replacement = await clock(elsewhereInWorktree, "status");
  const laterSession = await clock(worktree, "status", ...sliceThree);

  assert.deepEqual(handedBack.result, reported("pause", "paused", 11));
  assert.deepEqual(reviewed.result, reported("status", "paused", 11));
  assert.deepEqual(resumed.result, reported("start", "running", 11));
  assert.equal(resumed.result.remainingMinutes, 4);
  assert.deepEqual(replacement.result, reported("status", "running", 11));
  assert.deepEqual(laterSession.result, reported("status", "running", 11));
});

test("an accepted slice keeps its elapsed time through the refactor pass and CI repair", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  await clock(worktree, "start", ...sliceThree);
  time.at(10);

  await clock(worktree, "pause");
  time.at(55);

  assert.deepEqual(
    (await clock(worktree, "status", ...sliceThree)).result,
    reported("status", "paused", 10),
  );
  const unnamed = await clock(worktree, "status");
  assert.equal(unnamed.exitStatus, 1);
  assert.equal(unnamed.stderr, "no slice is running in this checkout\n");
});

test("each story's and each quick execution's slice has its own clock", async (t) => {
  const { worktree, time, clock } = await executionWorktree(t);
  const quick = "quick-execution-2026-11-16-fix-typo";
  const quickSliceOne = ["--identity", quick, "--slice", "1"];
  await clock(worktree, "start", ...sliceThree);
  time.at(7);
  await clock(worktree, "pause");

  const started = await clock(worktree, "start", ...quickSliceOne);
  time.at(9);
  const refused = await clock(worktree, "start", ...sliceThree);

  assert.deepEqual(
    started.result,
    reported("start", "running", 0, { identity: quick, slice: "1" }),
  );
  assert.equal(refused.exitStatus, 1);
  assert.equal(
    refused.stderr,
    `slice 1 of ${quick} is running in this checkout; pause it first\n`,
  );
  assert.equal((await clock(worktree, "status")).result.elapsedMinutes, 2);
  assert.equal(
    (await clock(worktree, "status", ...sliceThree)).result.elapsedMinutes,
    7,
  );
});

test("the record stays in the worktree's own Git state, uncommitted and unseen by the repository's other checkout", async (t) => {
  const { main, worktree, clock } = await executionWorktree(t);

  await clock(worktree, "start", ...sliceThree);

  assert.deepEqual((await clockRecord(worktree)).running, {
    identity: story,
    slice: "3",
  });
  assert.equal(
    (await git(worktree, "status", "--porcelain", "--ignored")).stdout,
    "",
  );
  assert.equal((await git(main, "status", "--porcelain")).stdout, "");
  const fromMain = await clock(main, "status");
  assert.equal(fromMain.stderr, "no slice is running in this checkout\n");
});
