// Landed CI history collection keeps CI time without runner waits with each
// retained passed build (../../server/landedCiCollectionLanding.ts), and a
// project history read that names the measure answers that time
// (../../server/intentCiHistoryRead.ts), asking CI nothing to read it
// (SEED-364#chart-ci-time-without-runner-waits example 1).

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import {
  measuredHistoryOf,
  landedCiHistorySchema,
} from "../../src/landedCiHistory.ts";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import {
  landedCiHistory,
  minutesAgo,
  restartAsLandedCiReader,
  storyLandingRecord,
} from "../../tests/support/landedCiHistory.ts";
import {
  passedBetween,
  serveTrunkRuns,
  timeAfter,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { listedAttemptJobPages } from "../../tests/support/storyCiComparisonRequests.ts";

test.use({ serverMode: "boundary" });

const dependentJobsWorkflow = [
  "name: CI",
  "",
  "on:",
  "  push:",
  "",
  "jobs:",
  "  first:",
  "    name: First",
  "    runs-on: ubuntu-24.04",
  "    steps:",
  "      - run: echo first",
  "  second:",
  "    name: Second",
  "    needs: first",
  "    runs-on: ubuntu-24.04",
  "    steps:",
  "      - run: echo second",
  "",
].join("\n");

const jobsAt = (
  firstWaitMs: number,
  secondWaitMs: number,
  runStart: string,
) => {
  const firstStart = timeAfter(runStart, firstWaitMs);
  const firstEnd = timeAfter(firstStart, 2 * 60_000);
  const secondStart = timeAfter(firstEnd, secondWaitMs);
  const secondEnd = timeAfter(secondStart, 3 * 60_000);
  return {
    jobs: [
      makeMe.aGitHubJob
        .withFacts({
          name: "First",
          started_at: firstStart,
          completed_at: firstEnd,
        })
        .please(),
      makeMe.aGitHubJob
        .withFacts({
          name: "Second",
          started_at: secondStart,
          completed_at: secondEnd,
        })
        .please(),
    ],
    wallCompletedAt: secondEnd,
  };
};

const jobsReads = (calls: readonly GhCall[]) => listedAttemptJobPages(calls);

test("keeps CI time without runner waits with a collected build once, answers 5 min for two waits when named, and leaves wall time for readers that do not name it", async ({
  origin,
  github,
  startServer,
}) => {
  await origin.publishRevision({
    message: "Land ci",
    files: { ".github/workflows/ci.yml": dependentJobsWorkflow },
  });
  const shortRevision = await origin.publishRevision({
    message: "Land short-waits",
    files: { "short.txt": "short\n" },
  });
  const longRevision = await origin.publishRevision({
    message: "Land long-waits",
    files: { "long.txt": "long\n" },
  });
  const shortLanding = {
    title: "short-waits",
    revision: shortRevision,
    receipt: "bbbbbbbb-0000-4000-8000-000000000001",
    at: minutesAgo(2),
  };
  const longLanding = {
    title: "long-waits",
    revision: longRevision,
    receipt: "bbbbbbbb-0000-4000-8000-000000000002",
    at: minutesAgo(1),
  };
  const shortStart = "2026-11-05T10:00:00Z";
  const longStart = "2026-11-05T11:00:00Z";
  const short = jobsAt(30_000, 60_000, shortStart);
  const long = jobsAt(2 * 60_000, 3 * 60_000, longStart);
  serveTrunkRuns(
    github,
    origin,
    () => [
      trunkRun(
        shortRevision,
        41,
        passedBetween(shortStart, short.wallCompletedAt),
      ),
      trunkRun(
        longRevision,
        42,
        passedBetween(longStart, long.wallCompletedAt),
      ),
    ],
    {
      jobs: () => ({
        "41/1": short.jobs,
        "42/1": long.jobs,
      }),
    },
  );
  keepLaunchRecords(path.join(origin.machine, "home"), [
    storyLandingRecord(shortLanding, "execution"),
    storyLandingRecord(longLanding, "execution"),
  ]);

  const dashboard = await startServer();
  await expect
    .poll(async () => {
      const answer = await landedCiHistory(
        dashboard,
        undefined,
        historyMeasure.value,
      );
      const measured = measuredHistoryOf(
        landedCiHistorySchema.parse(answer.body),
      );
      return measured?.entries.flatMap((entry) =>
        entry.kind === "point"
          ? [{ revision: entry.revision, wallTimeMs: entry.wallTimeMs }]
          : [],
      );
    })
    .toEqual([
      { revision: shortRevision, wallTimeMs: 5 * 60_000 },
      { revision: longRevision, wallTimeMs: 5 * 60_000 },
    ]);
  expect(jobsReads(github.calls).sort()).toEqual(["41/1/1", "42/1/1"]);

  const afterFirst = github.calls.length;
  await expect.poll(() => github.calls.length > afterFirst).toBe(true);
  expect(jobsReads(github.calls.slice(afterFirst))).toEqual([]);

  const wall = await landedCiHistory(dashboard);
  expect(
    measuredHistoryOf(landedCiHistorySchema.parse(wall.body))?.entries.filter(
      (entry) => entry.kind === "point",
    ),
  ).toEqual([
    expect.objectContaining({
      revision: shortRevision,
      wallTimeMs: 6.5 * 60_000,
    }),
    expect.objectContaining({
      revision: longRevision,
      wallTimeMs: 10 * 60_000,
    }),
  ]);
  for (const entry of landedCiHistorySchema.parse(wall.body).entries) {
    if (entry.kind === "point") expect(entry).not.toHaveProperty("timeMs");
  }

  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  try {
    const asked = github.calls.length;
    expect(
      await landedCiHistory(reader, undefined, historyMeasure.value),
    ).toMatchObject({
      status: 200,
      body: {
        entries: [
          expect.objectContaining({
            revision: shortRevision,
            timeMs: 5 * 60_000,
          }),
          expect.objectContaining({
            revision: longRevision,
            timeMs: 5 * 60_000,
          }),
        ],
      },
    });
    expect(github.calls.slice(asked)).toEqual([]);
    expect(jobsReads(github.calls).sort()).toEqual(["41/1/1", "42/1/1"]);
  } finally {
    await reader.close();
  }
});
