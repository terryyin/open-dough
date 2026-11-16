import assert from "node:assert/strict";
import test from "node:test";
import {
  executionWorktree,
  proofFiles,
  shellThroughClock,
} from "../../support/slice-clock-fixture.mjs";

const story = "SEED-367#bound-diagnosis-in-evidence-rounds";
const diagnosis = ["--identity", story, "--diagnosis", "flaky-save"];

// What a clock command says about a diagnosis round.
function roundReport({ result }) {
  const { round, roundsAuthorized, cumulativeMinutes, elapsedMinutes } = result;
  const { overrun, storyOverruns } = result;
  return {
    round,
    roundsAuthorized,
    cumulativeMinutes,
    elapsedMinutes,
    overrun,
    storyOverruns,
  };
}

function round(number, elapsedMinutes, cumulativeMinutes, more = {}) {
  return {
    round: number,
    roundsAuthorized: 3,
    cumulativeMinutes,
    elapsedMinutes,
    overrun: elapsedMinutes >= 15,
    storyOverruns: 0,
    ...more,
  };
}

const roundEnd = (number, total, cumulativeMinutes) =>
  `round ${number} of diagnosis flaky-save of ${story} reached the 15-minute limit: 15 active minutes; round ${number} of ${total} authorized, ${cumulativeMinutes} cumulative active minutes`;

// Runs one full round from `from` minutes, as a fresh context would: start,
// 15 active minutes, pause. Returns the round's report at its end.
async function fullRound({ worktree, time, clock }, from, ...flags) {
  time.at(from);
  await clock(worktree, "start", ...diagnosis, ...flags);
  time.at(from + 15);
  const ended = await clock(worktree, "status");
  await clock(worktree, "pause");
  return ended;
}

test("a diagnosis stops after three 15-minute rounds with 45 cumulative minutes, and a fourth round starts only when a human authorizes it", async (t) => {
  const run = await executionWorktree(t);
  const { worktree, time, clock } = run;

  const first = await fullRound(run, 0);
  time.at(20);
  const second = await clock(worktree, "start", ...diagnosis);
  time.at(35);
  await clock(worktree, "pause");
  const third = await fullRound(run, 40);
  time.at(60);
  const refused = await clock(worktree, "start", ...diagnosis);
  const authorized = await clock(
    worktree,
    "start",
    ...diagnosis,
    "--rounds-authorized",
    "4",
  );

  assert.deepEqual(roundReport(first), round(1, 15, 15));
  assert.deepEqual(roundReport(second), round(2, 0, 15));
  assert.deepEqual(roundReport(third), round(3, 15, 45));
  assert.equal(third.result.message, roundEnd(3, 3, 45));
  assert.equal(refused.exitStatus, 1);
  assert.equal(
    refused.stderr,
    `diagnosis flaky-save of ${story} used its 3 authorized rounds: 45 cumulative active minutes; a human may authorize more with --rounds-authorized\n`,
  );
  assert.deepEqual(
    roundReport(authorized),
    round(4, 0, 45, { roundsAuthorized: 4 }),
  );
});

test("round ends report an overrun that the story's overrun count and its slices never see", async (t) => {
  const run = await executionWorktree(t);
  const { worktree, time, clock } = run;
  await clock(worktree, "start", "--identity", story, "--slice", "1");
  time.at(15);
  await clock(worktree, "pause");

  await fullRound(run, 20);
  const second = await fullRound(run, 40);
  time.at(60);
  const slice = await clock(
    worktree,
    "start",
    "--identity",
    story,
    "--slice",
    "2",
  );
  const whileSliceRuns = await clock(worktree, "start", ...diagnosis);

  assert.deepEqual(roundReport(second), round(2, 15, 30, { storyOverruns: 1 }));
  assert.equal(second.result.message, roundEnd(2, 3, 30));
  assert.equal(slice.result.storyOverruns, 1);
  assert.equal(slice.result.overrun, false);
  assert.equal(whileSliceRuns.exitStatus, 1);
  assert.equal(
    whileSliceRuns.stderr,
    `slice 2 of ${story} is running in this checkout; pause it first\n`,
  );
});

test("proof run through the clock inside a round does not count toward the round or the cumulative minutes, and the host hook relays the round end", async (t) => {
  const { worktree, scratch, time, clock, hook } = await executionWorktree(t);
  const suite = proofFiles(scratch, "repetitions");
  await clock(worktree, "start", ...diagnosis);
  time.at(5);

  const ran = await shellThroughClock(
    clock,
    worktree,
    suite,
    time.shellStepTo(25),
  );
  time.at(35);
  const ended = await clock(worktree, "status", ...diagnosis);
  const told = await hook("claude", {
    hook_event_name: "PostToolUse",
    session_id: "diagnosing-agent",
    cwd: worktree,
    tool_name: "Bash",
  });

  assert.deepEqual(roundReport(ran), round(1, 5, 5));
  assert.deepEqual(roundReport(ended), round(1, 15, 15));
  assert.equal(
    told.result.hookSpecificOutput.additionalContext,
    `dough-execute-plan slice clock: ${roundEnd(1, 3, 15)}. Stop and return the unfinished work with the elapsed time.`,
  );
});
