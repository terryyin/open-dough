// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// of landings no build measures, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking at a test's pace: a final gap names the build
// the CI timing comparison's Landed rule named for its landing, with that
// build's run -- a confirmed skip's equivalent build whose CI proof expired,
// cannot be opened or was never published, a landing's own build that timed
// out, and the later trunk build that failed after a cancelled landing; a
// build whose attempt completed before it started names no CI wall time, so
// it is a gap and never a zero; and a run link that is not a web address is
// left out of a point and a pending gap alike, keeping their run words
// (SEED-285#see-landed-ci-wall-time-history). The CI timing comparison
// answers the same Landed gap without the build or the proof read the
// history keeps (../../server/intentCiComparisonSlots.ts). Run times follow
// when their landings were recorded, so the history answers them in trunk
// order. A skip whose equivalent build's CI proof read GitHub does not
// answer is in ./landed-ci-history-pending-proof.spec.ts; a landing CI never
// built is a No build gap in ./landed-ci-history-pending.spec.ts; how
// Project Intent shows these gaps is in
// ../../tests/intent/intent-ci-wall-time-history-gaps.spec.ts and the
// journeys beside it.

import path from "node:path";
import { collectedScopeHistory } from "../../tests/support/collectedScopeHistory.ts";
import {
  answeredLanding,
  landedCiHistory,
  restartAsLandedCiReader,
  untilKept,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  answeredRun,
  landingMinutesAgo,
  passedBetween,
  passedFrom,
  publishCiWorkflow,
  publishedChange,
  recordedOnTrunk,
  runningFrom,
  timeAfter,
  trunkRun,
  usableProofOf,
} from "../../tests/support/landedCiTrunk.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const minuteMs = 60_000;

// A final gap as the history read answers it: its landing, why, and the
// build the Landed rule named for it, at `revision`, standing for it as
// `provenance`, with that build's run `runId` (`answeredRun`).
const gapNaming = (
  reason: string,
  landed: Parameters<typeof answeredLanding>[0],
  revision: string,
  provenance: string,
  runId: number,
) => ({
  kind: "gap",
  reason,
  ...answeredLanding(landed),
  build: { revision, provenance, ...answeredRun(runId) },
});

test("a final gap names the build the Landed rule named for its landing and links its run: a skip's equivalent build whose CI proof expired, cannot be opened or was never published, a landing's own build that timed out, and the later trunk build that failed after a cancelled landing", async ({
  origin,
  github,
  startServer,
}) => {
  await publishCiWorkflow(origin);
  // Oldest first: three skips, each resting on a build of its own, whose CI
  // proof expired, cannot be opened, or was never published; a landing whose
  // own build timed out; and one whose build the push of d6 cancelled, and
  // d6's build failed, publishing its CI proof.
  const b1 = await publishedChange(origin, { title: "b1", kind: "code" });
  const expired = await landingMinutesAgo(origin, "expired", 6, true);
  const b2 = await publishedChange(origin, { title: "b2", kind: "code" });
  const unopenable = await landingMinutesAgo(origin, "unopenable", 5, true);
  const b3 = await publishedChange(origin, { title: "b3", kind: "code" });
  const proofless = await landingMinutesAgo(origin, "proofless", 4, true);
  const timedOut = await landingMinutesAgo(origin, "timed-out", 3);
  const cancelled = await landingMinutesAgo(origin, "cancelled", 2);
  const d6 = await publishedChange(origin, { title: "d6", kind: "code" });
  // Each stand-in build ran for 5 min, ending a minute before the landing
  // that rests on it was recorded; d6's failed a minute after it started,
  // half a minute after the cancelled landing was recorded.
  const before = (each: { readonly at: string }) =>
    passedFrom(timeAfter(each.at, -6 * minuteMs), 5 * minuteMs);
  const d6Run = trunkRun(d6, 66, {
    ...passedFrom(timeAfter(cancelled.at, minuteMs / 2), minuteMs),
    conclusion: "failure",
  });
  const runs = [
    trunkRun(b1, 61, before(expired)),
    trunkRun(b2, 62, before(unopenable)),
    trunkRun(b3, 63, before(proofless)),
    trunkRun(timedOut.revision, 64, {
      ...passedFrom(timedOut.at, minuteMs),
      conclusion: "timed_out",
    }),
    trunkRun(cancelled.revision, 65, {
      ...passedFrom(cancelled.at, minuteMs / 2),
      conclusion: "cancelled",
    }),
    d6Run,
  ];
  const landings = [expired, unopenable, proofless, timedOut, cancelled];
  recordedOnTrunk(
    origin,
    github,
    landings,
    () => runs,
    () => ({
      61: { kind: "expired", artifactId: 610 },
      62: { kind: "unopenable", artifactId: 620 },
      66: usableProofOf(d6Run),
    }),
  );
  const server = await startServer();
  await untilKept(path.join(origin.machine, "home"), landings);

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          gapNaming("expired", expired, b1, "equivalent", 61),
          gapNaming("unreadable", unopenable, b2, "equivalent", 62),
          gapNaming("no-proof", proofless, b3, "equivalent", 63),
          gapNaming("cancelled", timedOut, timedOut.revision, "exact", 64),
          gapNaming("failed", cancelled, d6, "later", 66),
        ],
      },
    });
  const reader = await restartAsLandedCiReader(server, origin, "boundary");
  try {
    const asked = github.calls.length;
    const scope = await collectedScopeHistory(
      reader.origin,
      "dashboard/tests",
      cancelled.revision,
      cancelled.at,
    );
    expect(scope.status).toBe(200);
    expect(scope.body.entries).toHaveLength(5);
    for (const [index, [revision, provenance, runId]] of [
      [b1, "equivalent", 61],
      [b2, "equivalent", 62],
      [b3, "equivalent", 63],
      [timedOut.revision, "exact", 64],
      [d6, "later", 66],
    ].entries()) {
      expect(scope.body.entries[index]).toMatchObject({
        kind: "gap",
        build: { revision, provenance, runId, runAttempt: 1 },
        readings: [],
      });
    }
    expect(github.calls.slice(asked)).toEqual([]);
  } finally {
    await reader.close();
  }
});

test("a build that completed before it started is a gap naming no CI wall time, never a zero, and a run link that is not a web address is left out of a point and a pending gap, keeping their run words", async ({
  origin,
  github,
  startServer,
}) => {
  const backwards = await landingMinutesAgo(origin, "backwards", 30);
  const linked = await landingMinutesAgo(origin, "linked", 20);
  const running = await landingMinutesAgo(origin, "running", 10);
  recordedOnTrunk(origin, github, [backwards, linked, running], () => [
    trunkRun(
      backwards.revision,
      64,
      passedBetween(backwards.at, timeAfter(backwards.at, -5 * minuteMs)),
    ),
    trunkRun(linked.revision, 65, {
      ...passedFrom(linked.at, 365_000),
      url: "javascript:alert(65)",
    }),
    trunkRun(running.revision, 66, {
      ...runningFrom(running.at),
      url: "javascript:alert(66)",
    }),
  ]);
  const server = await startServer({ observationClock: true });

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          gapNaming("not-recorded", backwards, backwards.revision, "exact", 64),
          {
            kind: "point",
            revision: linked.revision,
            runId: 65,
            runAttempt: 1,
            startedAt: linked.at,
            completedAt: timeAfter(linked.at, 365_000),
            landings: [{ ...answeredLanding(linked), provenance: "exact" }],
          },
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "build",
            ...answeredLanding(running),
            runId: 66,
            runAttempt: 1,
          },
        ],
      },
    });
});
