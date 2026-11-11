// The cancelled-landing forward walk in Story Branch Landed
// (`lookupResultBuild`, `laterTrunkCancelledSlot`): a cancelled landing
// without later proof keeps its explanation and says why, naming the build
// it could not use -- the nearest later trunk build whose proof is
// unusable, and whether GitHub left that proof read unanswered, or else its
// own cancelled build; its answer is remembered only when the walk cannot
// gain a later build. Nothing unavailable, in any slot or as the whole
// answer, is remembered either. The walk itself lives in
// ./dashboard-later-trunk-build.test.mjs; timed-out and rerun-passed
// landings, which stay exact, in ./dashboard-landed-exact-build.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import { lookupResultBuild } from "../../dashboard/server/baseCiRevisionLookup.ts";
import { baselineAncestorLimit } from "../../dashboard/server/exactSkippedEquivalent.ts";
import { unreadableBy } from "../../dashboard/server/ciProofArtifact.ts";
import { isFinalCiComparisonAnswer } from "../../dashboard/server/intentCiComparisonAnswers.ts";
import { laterTrunkCancelledSlot } from "../../dashboard/server/laterTrunkBuild.ts";
import { GitHubAcquisitionFailed } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import {
  absent,
  exactFor,
  lookupOf,
  ownBuild,
  sourceFor,
  run,
  trunk,
  trunkOf,
} from "./dashboard-later-trunk-fixture.mjs";

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

test("a cancelled landing without later proof says why and names the build it could not use, and only a walk that may still gain a build is not remembered", async (t) => {
  const repo = await trunk(t);
  const head = repo.later[3];
  const short = (sha) => sha.slice(0, 7);
  const cancelled = "The CI build at the landing merge was cancelled.";

  const atHead = await lookupResultBuild(
    head,
    head,
    sourceFor(repo, lookupOf({ [head]: [run(head, 61, "cancelled")] }).lookup),
    "missing",
    exactFor(),
  );
  assert.deepEqual(atHead, {
    kind: "none",
    explanation: `${cancelled} No later trunk build has finished yet.`,
    cancelled: true,
    awaitingLaterBuild: true,
    unusableBuild: ownBuild(head, 61),
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(atHead)), false);

  const [later1, later2] = repo.later;
  const stillRunning = await lookupResultBuild(
    repo.landing,
    repo.landing,
    sourceFor(
      repo,
      lookupOf({
        [repo.landing]: [run(repo.landing, 62, "cancelled")],
        [later1]: [run(later1, 63, null, { status: "in_progress" })],
      }).lookup,
    ),
    "missing",
    exactFor(),
  );
  assert.deepEqual(stillRunning, {
    kind: "none",
    explanation: `${cancelled} A later trunk build at ${short(later1)} (run 63 #1) is still running, so no later trunk build has finished yet.`,
    cancelled: true,
    awaitingLaterBuild: true,
    unusableBuild: ownBuild(repo.landing, 62),
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(stillRunning)), false);

  const cancelledRuns = [run(repo.landing, 64, "cancelled")];
  const prooflessBeforeRunning = await laterTrunkCancelledSlot(
    repo.landing,
    cancelledRuns,
    sourceFor(
      repo,
      lookupOf({
        [later1]: [run(later1, 65, "success")],
        [later2]: [run(later2, 66, null, { status: "in_progress" })],
      }).lookup,
    ),
    exactFor(),
    async () => absent("none"),
  );
  // A later build as the walk names it: run 65 from noon for 3 min.
  const laterBuild = (revision, runId) =>
    makeMe.anUnusableBuild
      .with({
        revision,
        selection: "later",
        runId,
        runAttempt: 1,
        startedAt: "2026-11-05T12:00:00Z",
        completedAt: "2026-11-05T12:03:00Z",
      })
      .please();
  assert.deepEqual(prooflessBeforeRunning, {
    kind: "none",
    explanation: `${cancelled} The nearest later trunk build at ${short(later1)} (run 65 #1) published no CI proof summary. A later trunk build at ${short(later2)} (run 66 #1) is still running.`,
    cancelled: true,
    awaitingLaterBuild: true,
    unusableProof: "none",
    unusableBuild: laterBuild(later1, 65),
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
    sourceFor(deep, lookupOf(runs).lookup),
    exactFor(),
    async () => absent("none"),
  );
  assert.deepEqual(capped, {
    kind: "none",
    explanation: `${cancelled} The nearest later trunk build at ${short(deep.later[0])} (run 71 #1) published no CI proof summary.`,
    cancelled: true,
    unusableProof: "none",
    unusableBuild: laterBuild(deep.later[0], 71),
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(capped)), true);

  // No later build over the whole bound: final, naming its own build.
  const unbuilt = await laterTrunkCancelledSlot(
    deep.landing,
    [run(deep.landing, 80, "cancelled")],
    sourceFor(deep, lookupOf({}).lookup),
    exactFor(),
    async () => undefined,
  );
  assert.deepEqual(unbuilt, {
    kind: "none",
    explanation: `${cancelled} No later trunk build finished within ${String(baselineAncestorLimit)} later trunk revisions.`,
    cancelled: true,
    unusableBuild: ownBuild(deep.landing, 80),
  });
  assert.equal(isFinalCiComparisonAnswer(answerWith(unbuilt)), true);

  // GitHub left the nearest later build's proof read unanswered.
  const unanswered = unreadableBy(
    new GitHubAcquisitionFailed("repos/o/r/actions/runs/71/artifacts", {
      kind: "http",
      status: 502,
    }),
  );
  const unread = await laterTrunkCancelledSlot(
    deep.landing,
    runs[deep.landing],
    sourceFor(deep, lookupOf(runs).lookup),
    exactFor(),
    async (build) => (build.runId === 71 ? unanswered : absent("none")),
  );
  assert.equal(unread.unusableProof, "unreadable");
  assert.equal(unread.proofUnanswered, true);
  assert.deepEqual(unread.unusableBuild, laterBuild(deep.later[0], 71));
});
