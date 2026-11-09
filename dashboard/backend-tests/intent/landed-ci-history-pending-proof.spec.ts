// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// of a confirmed skip whose equivalent build's CI proof read GitHub does not
// answer, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking at a test's pace: the skip waits for that
// proof, as CI proof not read yet, for as long as GitHub does not answer,
// while collection goes on to the older landings past it, and is that
// build's reused equivalent point once GitHub answers, however long ago it
// was recorded, never a final unreadable gap: only GitHub's answer settles a
// CI proof (SEED-285#see-landed-ci-wall-time-history). Run times follow when
// their landings were recorded, so the history answers them in trunk order.
// Final gaps, an unopenable CI proof's among them, are in
// ./landed-ci-history-gaps.spec.ts; the other pending states in
// ./landed-ci-history-pending.spec.ts and
// ./landed-ci-history-pending-sources.spec.ts.

import path from "node:path";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import {
  answeredLanding,
  landedCiHistory,
  untilKept,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  answeredRun,
  landingMinutesAgo,
  passedFrom,
  publishCiWorkflow,
  publishedChange,
  recordedOnTrunk,
  runningFrom,
  timeAfter,
  trunkRun,
  usableProofOf,
  type TrunkProofs,
} from "../../tests/support/landedCiTrunk.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const minuteMs = 60_000;

test("a skip whose equivalent build's CI proof read GitHub does not answer waits as CI proof not read yet for as long as GitHub does not answer, while collection measures the older landings past it", async ({
  origin,
  github,
  startServer,
}) => {
  await publishCiWorkflow(origin);
  // Oldest first: a landing whose build runs, a build of its own, and the
  // newest landing, a skip resting on that build, whose CI proof read GitHub
  // does not answer.
  const older = await landingMinutesAgo(origin, "older", 10);
  const b = await publishedChange(origin, { title: "b", kind: "code" });
  const skip = await landingMinutesAgo(origin, "skip", 1, true);
  const bRun = trunkRun(
    b,
    71,
    passedFrom(timeAfter(older.at, minuteMs), minuteMs),
  );
  let runs: readonly CiRunAnswer[] = [
    trunkRun(older.revision, 70, runningFrom(older.at)),
    bRun,
  ];
  recordedOnTrunk(
    origin,
    github,
    [older, skip],
    () => runs,
    () => ({ 71: { kind: "unanswered" } }),
  );
  const server = await startServer({ observationClock: true });
  await untilKept(path.join(origin.machine, "home"), [older, skip]);
  const skipWaits = {
    kind: "gap",
    reason: "pending",
    waitsFor: "proof",
    ...answeredLanding(skip),
    ...answeredRun(71),
  };

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "build",
            ...answeredLanding(older),
            ...answeredRun(70),
          },
          skipWaits,
        ],
      },
    });

  // Hours later GitHub still does not answer the skip's proof read, and the
  // older landing's build has passed in 6 min 5 s.
  server.advanceObservationClock(3 * 60 * minuteMs);
  runs = [trunkRun(older.revision, 70, passedFrom(older.at, 365_000)), bRun];
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "point",
            revision: older.revision,
            ...answeredRun(70),
            startedAt: older.at,
            completedAt: timeAfter(older.at, 365_000),
            landings: [{ ...answeredLanding(older), provenance: "exact" }],
          },
          skipWaits,
        ],
      },
    });
});

test("a skip recorded two hours ago whose equivalent build's CI proof read GitHub does not answer at first is that build's reused equivalent point once GitHub answers, never a final unreadable gap", async ({
  origin,
  github,
  startServer,
}) => {
  await publishCiWorkflow(origin);
  const b = await publishedChange(origin, { title: "b", kind: "code" });
  const skip = await landingMinutesAgo(origin, "skip", 120, true);
  const bRun = trunkRun(
    b,
    72,
    passedFrom(timeAfter(skip.at, -10 * minuteMs), 5 * minuteMs),
  );
  let proofs: TrunkProofs = { 72: { kind: "unanswered" } };
  recordedOnTrunk(
    origin,
    github,
    [skip],
    () => [bRun],
    () => proofs,
  );
  const server = await startServer({ observationClock: true });

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "proof",
            ...answeredLanding(skip),
            ...answeredRun(72),
          },
        ],
      },
    });

  // GitHub answers the next read.
  proofs = { 72: usableProofOf(bRun) };
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "point",
            revision: b,
            ...answeredRun(72),
            startedAt: bRun.startedAt,
            completedAt: bRun.completedAt,
            landings: [{ ...answeredLanding(skip), provenance: "equivalent" }],
          },
        ],
      },
    });
});
