// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// of a landing whose CI is not final, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking its pending landings again at a test's pace:
// the landing is a pending gap that waits -- before its run exists, while it
// is queued or running, while its CI cannot be read -- and becomes its exact
// point when CI completes, or a final No build gap once its run has not come
// for an hour; a repeated landing report adds no second observation or point
// (SEED-285#see-landed-ci-wall-time-history examples 2 and 3). The
// dashboard's own lifecycle is in ./landed-ci-history-lifecycle.spec.ts.

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import {
  keptLandedCiHistory,
  landedCiHistory,
  landedRecord,
  minutesAgo,
  observedKinds,
  recheckingLandedCi,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedBetween,
  publishedLanding,
  serveTrunkRuns,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// The history answering one landing as a pending gap, waiting as `waiting`
// says, with the run it waits on when there is one.
const onePendingGap = (
  landing: { readonly revision: string; readonly receivedAt: string },
  waiting: object,
) => ({
  status: 200,
  body: expect.objectContaining({
    entries: [{ kind: "gap", reason: "pending", ...landing, ...waiting }],
  }),
});

test("a landing whose push never gets a run, with no later trunk build either, waits as a pending gap for an hour after it was recorded and is then a final No build gap", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  // The trunk's head, for which GitHub creates no run.
  const quiet = await publishedLanding(origin, {
    title: "quiet",
    receipt: "aaaaaaaa-0000-4000-8000-000000000005",
    at: minutesAgo(1),
  });
  serveTrunkRuns(github, origin, () => []);
  keepLaunchRecords(home, [landedRecord(quiet)]);
  const server = await startServer({ observationClock: true });

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual(
      onePendingGap(
        { revision: quiet.revision, receivedAt: quiet.at },
        { waitsFor: "run" },
      ),
    );

  // An hour after it was recorded, its run has still not come: it is a
  // final No build gap.
  server.advanceObservationClock(60 * 60_000);
  await expect
    .poll(() => observedKinds(keptLandedCiHistory(home)))
    .toEqual({ [quiet.receipt]: "gap" });
  expect(await landedCiHistory(server)).toEqual({
    status: 200,
    body: expect.objectContaining({
      entries: [
        {
          kind: "gap",
          reason: "no-build",
          revision: quiet.revision,
          receivedAt: quiet.at,
        },
      ],
    }),
  });
});

test.describe("a server that collects", () => {
  test.use({ extraEnv: recheckingLandedCi });

  test("a landing whose CI could not be read is a pending gap until its CI can be read, then its exact point", async ({
    dashboard,
    origin,
    github,
  }) => {
    const { record, revision } = await resultToLand(dashboard, "landed.txt");
    // Its build took 6 min 5 s, but GitHub's Actions cannot be read yet.
    let readable = false;
    serveTrunkRuns(
      github,
      origin,
      () => [
        trunkRun(
          revision,
          61,
          passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
        ),
      ],
      { readable: () => readable },
    );
    const { receipt } = land(record, origin, dashboard.home).result.landing;

    await expect
      .poll(() => landedCiHistory(dashboard))
      .toEqual(
        onePendingGap(
          { revision, receivedAt: receipt.receivedAt },
          { waitsFor: "read" },
        ),
      );

    readable = true;
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toMatchObject({
        body: {
          entries: [
            {
              kind: "point",
              revision,
              runId: 61,
              startedAt: "2026-11-05T10:00:00Z",
              completedAt: "2026-11-05T10:06:05Z",
            },
          ],
        },
      });
  });

  test("a landing recorded before its trunk run exists is a pending gap that waits through a repeated report and its queued run, and becomes its exact point once that run completes, kept once", async ({
    dashboard,
    origin,
    github,
  }) => {
    const { record, revision } = await resultToLand(dashboard, "landed.txt");
    // GitHub has created no run for the landed revision yet.
    let runs: readonly CiRunAnswer[] = [];
    serveTrunkRuns(github, origin, () => runs);
    const { receipt } = land(record, origin, dashboard.home).result.landing;
    const pendingFor = (waiting: object) =>
      onePendingGap({ revision, receivedAt: receipt.receivedAt }, waiting);

    await expect
      .poll(() => landedCiHistory(dashboard))
      .toEqual(pendingFor({ waitsFor: "run" }));

    // The same landing reported again is the same landing.
    const reportAgain = async () => {
      const again = await postLanding(
        dashboard,
        makeMe.aLandingSubmission
          .forLaunch({ reference: receipt.reference })
          .inDelivery(receipt.delivery)
          .comparing({ base: receipt.base, revision })
          .please(),
        false,
      );
      expect(again.status).toBe(200);
      expect(JSON.parse(again.body)).toMatchObject({
        receipt: receipt.receipt,
      });
    };
    await reportAgain();
    expect(await landedCiHistory(dashboard)).toEqual(
      pendingFor({ waitsFor: "run" }),
    );

    // Its run is queued.
    const queued = trunkRun(revision, 52, {
      status: "queued",
      createdAt: "2026-11-05T10:00:00Z",
    });
    runs = [queued];
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toEqual(
        pendingFor({
          waitsFor: "build",
          runUrl: "https://ci.invalid/runs/52",
          runId: 52,
          runAttempt: 1,
        }),
      );

    // It completes in 6 min 5 s.
    runs = [
      makeMe.aCiRun
        .with({
          ...queued,
          status: "completed",
          conclusion: "success",
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:06:05Z",
        })
        .please(),
    ];
    const measured = {
      status: 200,
      body: expect.objectContaining({
        entries: [
          {
            kind: "point",
            revision,
            runUrl: "https://ci.invalid/runs/52",
            runId: 52,
            runAttempt: 1,
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:06:05Z",
            landings: [
              {
                revision,
                receivedAt: receipt.receivedAt,
                provenance: "exact",
              },
            ],
          },
        ],
      }),
    };
    await expect.poll(() => landedCiHistory(dashboard)).toEqual(measured);

    await reportAgain();
    expect(await landedCiHistory(dashboard)).toEqual(measured);
    const kept = keptLandedCiHistory(dashboard.home);
    expect(Object.keys(kept.landings)).toEqual([receipt.receipt]);
    expect(Object.keys(kept.builds)).toEqual(["run/52/1"]);
  });
});
