// Retained final `No CI proof summary` gaps for confirmed skips recover under
// timed wall-time reuse without proof (../../server/landedCiCollection.ts,
// ../../server/landedCiHistoryStore.ts): seed a final equivalent no-proof gap,
// run the next collection pass → the landing joins the timed equivalent
// point; other final gap reasons stay final; a dashboard that only reads the
// history without re-resolution leaves the seeded gap
// (SEED-288#reuse-adapter-equivalent-timing example 5).

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  answeredLanding,
  keepLandedCiHistory,
  landedCiHistory,
  minutesAgo,
  storyLandingRecord,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  answeredRun,
  passedFrom,
  publishCiWorkflow,
  publishedChange,
  publishedLanding,
  serveTrunkRuns,
  timeAfter,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

test.use({ serverMode: "boundary" });

const minuteMs = 60_000;

test("a retained final no-proof equivalent skip recovers on the next collection pass; other finals stay; reading without collection leaves the seeded gap", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  await publishCiWorkflow(origin);
  const equivalent = await publishedChange(origin, {
    title: "equivalent",
    kind: "code",
  });
  const skip = await publishedLanding(origin, {
    title: "skip",
    receipt: "bbbbbbbb-0000-4000-8000-000000000001",
    at: minutesAgo(4),
    planningOnly: true,
  });
  const expiredEquivalent = await publishedChange(origin, {
    title: "expired-eq",
    kind: "code",
  });
  const expiredSkip = await publishedLanding(origin, {
    title: "expired-skip",
    receipt: "bbbbbbbb-0000-4000-8000-000000000002",
    at: minutesAgo(2),
    planningOnly: true,
  });
  const equivalentRun = trunkRun(
    equivalent,
    81,
    passedFrom(timeAfter(skip.at, -6 * minuteMs), 5 * minuteMs),
  );
  const expiredRun = trunkRun(
    expiredEquivalent,
    82,
    passedFrom(timeAfter(expiredSkip.at, -6 * minuteMs), 5 * minuteMs),
  );
  keepLandedCiHistory(
    home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([
        equivalent,
        skip.revision,
        expiredEquivalent,
        expiredSkip.revision,
      ])
      .unmeasuredLanding({
        receipt: skip.receipt,
        revision: skip.revision,
        receivedAt: skip.at,
        identity: `SEED-9#${skip.title}`,
        reason: "no-proof",
        build: {
          revision: equivalent,
          provenance: "equivalent",
          runId: 81,
        },
      })
      .unmeasuredLanding({
        receipt: expiredSkip.receipt,
        revision: expiredSkip.revision,
        receivedAt: expiredSkip.at,
        identity: `SEED-9#${expiredSkip.title}`,
        reason: "expired",
        build: {
          revision: expiredEquivalent,
          provenance: "equivalent",
          runId: 82,
        },
      })
      .please(),
  );
  serveTrunkRuns(github, origin, () => [equivalentRun, expiredRun], {
    proofs: () => ({
      81: { kind: "none" },
      82: { kind: "expired", artifactId: 820 },
    }),
  });
  keepLaunchRecords(home, [
    storyLandingRecord(skip, "refinement"),
    storyLandingRecord(expiredSkip, "refinement"),
  ]);

  await test.step("restart alone without collection leaves the seeded no-proof gap", async () => {
    const reader = await startDashboardServer({
      mode: "boundary",
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      extraEnv: { DOUGH_TEST_LANDED_CI_COLLECTION: "off" },
    });
    try {
      expect(await landedCiHistory(reader)).toEqual({
        status: 200,
        body: expect.objectContaining({
          entries: [
            {
              kind: "gap",
              reason: "no-proof",
              ...answeredLanding(skip),
              build: {
                revision: equivalent,
                provenance: "equivalent",
                ...answeredRun(81),
              },
            },
            {
              kind: "gap",
              reason: "expired",
              ...answeredLanding(expiredSkip),
              build: {
                revision: expiredEquivalent,
                provenance: "equivalent",
                ...answeredRun(82),
              },
            },
          ],
        }),
      });
    } finally {
      await reader.close();
    }
  });

  const server = await startServer();
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: expect.objectContaining({
        entries: [
          {
            kind: "point",
            revision: equivalent,
            ...answeredRun(81),
            startedAt: equivalentRun.startedAt,
            completedAt: equivalentRun.completedAt,
            landings: [{ ...answeredLanding(skip), provenance: "equivalent" }],
          },
          {
            kind: "gap",
            reason: "expired",
            ...answeredLanding(expiredSkip),
            build: {
              revision: expiredEquivalent,
              provenance: "equivalent",
              ...answeredRun(82),
            },
          },
        ],
      }),
    });
});
