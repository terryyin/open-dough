// The cancelled-landing forward walk in Story Branch Landed
// (`lookupResultBuild`, `laterTrunkCancelledSlot`): a cancelled landing
// without later proof keeps its explanation and says why; its answer is
// remembered only when the walk cannot gain a later build. Timed-out and
// rerun-passed landings stay exact. Nothing unavailable, in any slot or as
// the whole answer, is remembered either. The walk itself lives in
// ./dashboard-later-trunk-build.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { lookupResultBuild } from "../../dashboard/server/baseCiRevisionLookup.ts";
import {
  baselineAncestorLimit,
  storyBranchLandedExactLookup,
} from "../../dashboard/server/exactSkippedEquivalent.ts";
import { isFinalCiComparisonAnswer } from "../../dashboard/server/intentCiComparisonAnswers.ts";
import { laterTrunkCancelledSlot } from "../../dashboard/server/laterTrunkBuild.ts";
import {
  absent,
  lookupOf,
  run,
  trunk,
  trunkOf,
} from "./dashboard-later-trunk-fixture.mjs";

function exactFor() {
  return storyBranchLandedExactLookup(
    false,
    "terryyin/open-dough",
    new AbortController().signal,
    "main",
  );
}

function answerWith(landed, slots = {}) {
  return {
    kind: "comparison",
    identity: "SEED-1#story",
    phase: "done",
    mode: "story-branch",
    storyStart: "a".repeat(40),
    checkedAt: "2026-11-07T00:00:00.000Z",
    baseline: { kind: "none", explanation: "none" },
    branch: { kind: "none", explanation: "none" },
    landed,
    ...slots,
  };
}

test("an answer with anything unavailable is read again; a final gap is remembered", () => {
  const unavailable = {
    kind: "unavailable",
    explanation: "GitHub request failed: GitHub is unreachable",
  };
  const final = { kind: "none", explanation: "none" };
  for (const slot of ["baseline", "branch", "landed"])
    assert.equal(
      isFinalCiComparisonAnswer(answerWith(final, { [slot]: unavailable })),
      false,
      slot,
    );
  assert.equal(
    isFinalCiComparisonAnswer({
      kind: "unavailable",
      identity: "SEED-1#story",
      explanation:
        "The story's published completion history could not be read.",
      checkedAt: "2026-11-07T00:00:00.000Z",
    }),
    false,
  );
  assert.equal(
    isFinalCiComparisonAnswer(
      answerWith(final, {
        branch: { kind: "not-applicable", explanation: "Trunk Mode" },
      }),
    ),
    true,
  );
});

test("a cancelled landing without later proof says why, and only a walk that may still gain a build is not remembered", async (t) => {
  const repo = await trunk(t);
  const head = repo.later[3];
  const short = (sha) => sha.slice(0, 7);
  const cancelled = "The CI build at the landing merge was cancelled.";

  const atHead = await lookupResultBuild(
    head,
    head,
    lookupOf({ [head]: [run(head, 61, "cancelled")] }).lookup,
    repo.call,
    "ci.yml",
    "missing",
    exactFor(),
  );
  assert.deepEqual(atHead, {
    kind: "none",
    explanation: `${cancelled} No later trunk build has finished yet.`,
    cancelled: true,
    awaitingLaterBuild: true,
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(atHead)), false);

  const [later1, later2] = repo.later;
  const stillRunning = await lookupResultBuild(
    repo.landing,
    repo.landing,
    lookupOf({
      [repo.landing]: [run(repo.landing, 62, "cancelled")],
      [later1]: [run(later1, 63, null, { status: "in_progress" })],
    }).lookup,
    repo.call,
    "ci.yml",
    "missing",
    exactFor(),
  );
  assert.deepEqual(stillRunning, {
    kind: "none",
    explanation: `${cancelled} A later trunk build at ${short(later1)} (run 63 #1) is still running, so no later trunk build has finished yet.`,
    cancelled: true,
    awaitingLaterBuild: true,
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(stillRunning)), false);

  const cancelledRuns = [run(repo.landing, 64, "cancelled")];
  const prooflessBeforeRunning = await laterTrunkCancelledSlot(
    repo.landing,
    cancelledRuns,
    lookupOf({
      [later1]: [run(later1, 65, "success")],
      [later2]: [run(later2, 66, null, { status: "in_progress" })],
    }).lookup,
    repo.call,
    "ci.yml",
    exactFor(),
    async () => absent("none"),
  );
  assert.deepEqual(prooflessBeforeRunning, {
    kind: "none",
    explanation: `${cancelled} The nearest later trunk build at ${short(later1)} (run 65 #1) published no CI proof summary. A later trunk build at ${short(later2)} (run 66 #1) is still running.`,
    cancelled: true,
    awaitingLaterBuild: true,
    unusableProof: "none",
  });
  assert.equal(
    isFinalCiComparisonAnswer(answerWith(prooflessBeforeRunning)),
    false,
  );

  // Proofless builds over the whole bound: a final answer naming the nearest.
  const deep = await trunkOf(t, baselineAncestorLimit + 1);
  const runs = { [deep.landing]: [run(deep.landing, 70, "cancelled")] };
  for (const [index, sha] of deep.later.entries())
    runs[sha] = [run(sha, 71 + index, "success")];
  const capped = await laterTrunkCancelledSlot(
    deep.landing,
    runs[deep.landing],
    lookupOf(runs).lookup,
    deep.call,
    "ci.yml",
    exactFor(),
    async () => absent("none"),
  );
  assert.deepEqual(capped, {
    kind: "none",
    explanation: `${cancelled} The nearest later trunk build at ${short(deep.later[0])} (run 71 #1) published no CI proof summary.`,
    cancelled: true,
    unusableProof: "none",
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(capped)), true);
});

test("Story Branch Landed keeps a rerun attempt's own build and a timed-out landing exact without walking forward", async (t) => {
  const repo = await trunk(t);
  const [later1] = repo.later;
  const exact = exactFor();
  const rerun = lookupOf({
    [repo.landing]: [run(repo.landing, 41, "success", { attempt: 2 })],
    [later1]: [run(later1, 42, "success")],
  });
  const own = await lookupResultBuild(
    repo.landing,
    repo.landing,
    rerun.lookup,
    repo.call,
    "ci.yml",
    "missing",
    exact,
  );
  assert.equal(own.kind, "build");
  assert.equal(own.runId, 41);
  assert.equal(own.selection, "exact");
  assert.equal(own.requestedStatus, undefined);
  assert.ok(!rerun.listed.includes(later1));

  const timedOut = lookupOf({
    [repo.landing]: [run(repo.landing, 51, "timed_out")],
    [later1]: [run(later1, 52, "success")],
  });
  const slot = await lookupResultBuild(
    repo.landing,
    repo.landing,
    timedOut.lookup,
    repo.call,
    "ci.yml",
    "missing",
    exact,
  );
  assert.deepEqual(slot, {
    kind: "none",
    explanation: "The CI build at the landing merge timed out.",
    cancelled: true,
  });
  assert.ok(!timedOut.listed.includes(later1));
});
