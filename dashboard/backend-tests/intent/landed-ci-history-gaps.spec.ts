// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// of landings no build measures, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking at a test's pace: a confirmed skip whose
// equivalent build's CI proof expired is a final gap with that reason; one
// whose equivalent build's CI proof cannot be read is pending, as CI not read
// yet, until an hour after it was recorded on the server's observation clock,
// and then a final unreadable gap; a build whose attempt completed before it
// started names no CI wall time, so it is a gap and never a zero; and a run
// link that is not a web address is left out of a point and a pending gap
// alike, keeping their run words (SEED-285#see-landed-ci-wall-time-history).
// A landing CI never built is a No build gap in
// ./landed-ci-history-pending.spec.ts; the gaps the Landed rule makes of
// skipped, cancelled and failed builds in Project Intent are in
// ../../tests/intent/intent-ci-wall-time-history-provenance.spec.ts.

import path from "node:path";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import type { FakeGitHub } from "../../tests/support/fakeGitHub.ts";
import {
  answeredLanding,
  landedCiHistory,
  minutesAgo,
  storyLandingRecord,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedBetween,
  publishCiWorkflow,
  publishedChange,
  publishedLanding,
  serveTrunkRuns,
  trunkRun,
  type TrunkProofs,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import type { StartOrigin } from "../../tests/support/startOrigin.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// A landing recorded `minutes` ago, published on the origin's trunk.
const landing = (
  origin: StartOrigin,
  title: string,
  minutes: number,
  planningOnly = false,
) =>
  publishedLanding(origin, {
    title,
    receipt: `dddddddd-0000-4000-8000-00000000000${String(minutes)}`,
    at: minutesAgo(minutes),
    planningOnly,
  });

// A trunk build of its own, which no recorded landing names.
const built = (origin: StartOrigin, title: string) =>
  publishedChange(origin, { title, kind: "code" });

// Trunk's `runs` and their CI proof served, and `landings` recorded, before
// a collecting server starts.
function recorded(
  origin: StartOrigin,
  github: FakeGitHub,
  landings: readonly Parameters<typeof storyLandingRecord>[0][],
  runs: readonly CiRunAnswer[],
  proofs: TrunkProofs = {},
): void {
  serveTrunkRuns(github, origin, () => runs, { proofs: () => proofs });
  keepLaunchRecords(
    path.join(origin.machine, "home"),
    landings.map((each) => storyLandingRecord(each, "execution")),
  );
}

test("a skip whose equivalent build's CI proof expired is a final gap for that, and one whose proof cannot be read is CI not read yet until an hour after it was recorded, then a final unreadable gap", async ({
  origin,
  github,
  startServer,
}) => {
  await publishCiWorkflow(origin);
  // Oldest first: a skip resting on b0, whose CI proof cannot be read, and
  // one resting on b1, whose CI proof expired.
  const b0 = await built(origin, "b0");
  const unreadable = await landing(origin, "unreadable", 2, true);
  const b1 = await built(origin, "b1");
  const expired = await landing(origin, "expired", 1, true);
  recorded(
    origin,
    github,
    [unreadable, expired],
    [
      trunkRun(
        b0,
        60,
        passedBetween("2026-11-05T09:00:00Z", "2026-11-05T09:05:00Z"),
      ),
      trunkRun(
        b1,
        61,
        passedBetween("2026-11-05T09:30:00Z", "2026-11-05T09:35:00Z"),
      ),
    ],
    { 60: { kind: "unreadable" }, 61: { kind: "expired", artifactId: 610 } },
  );
  const server = await startServer({ observationClock: true });
  const answered = (unreadableGap: object) => ({
    status: 200,
    body: {
      entries: [
        { kind: "gap", ...answeredLanding(unreadable), ...unreadableGap },
        { kind: "gap", reason: "expired", ...answeredLanding(expired) },
      ],
    },
  });

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual(answered({ reason: "pending", waitsFor: "read" }));

  // An hour after it was recorded, its proof still cannot be read.
  server.advanceObservationClock(60 * 60_000);
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual(answered({ reason: "unreadable" }));
});

test("a build that completed before it started is a gap naming no CI wall time, never a zero, and a run link that is not a web address is left out of a point and a pending gap, keeping their run words", async ({
  origin,
  github,
  startServer,
}) => {
  const backwards = await landing(origin, "backwards", 3);
  const linked = await landing(origin, "linked", 2);
  const running = await landing(origin, "running", 1);
  recorded(
    origin,
    github,
    [backwards, linked, running],
    [
      trunkRun(
        backwards.revision,
        64,
        passedBetween("2026-11-05T10:10:00Z", "2026-11-05T10:05:00Z"),
      ),
      trunkRun(linked.revision, 65, {
        ...passedBetween("2026-11-05T10:20:00Z", "2026-11-05T10:26:05Z"),
        url: "javascript:alert(65)",
      }),
      trunkRun(running.revision, 66, {
        status: "in_progress",
        createdAt: "2026-11-05T10:30:00Z",
        url: "javascript:alert(66)",
      }),
    ],
  );
  const server = await startServer({ observationClock: true });

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "point",
            revision: linked.revision,
            runId: 65,
            runAttempt: 1,
            startedAt: "2026-11-05T10:20:00Z",
            completedAt: "2026-11-05T10:26:05Z",
            landings: [{ ...answeredLanding(linked), provenance: "exact" }],
          },
          {
            kind: "gap",
            reason: "not-recorded",
            ...answeredLanding(backwards),
            build: {
              revision: backwards.revision,
              provenance: "exact",
              runUrl: "https://ci.invalid/runs/64",
              runId: 64,
              runAttempt: 1,
            },
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
