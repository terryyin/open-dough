// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// across the dashboard's own lifecycle, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking its pending landings again at a test's pace:
// landings recorded before collection started are collected by its first
// pass; a landing still running when the dashboard stops is measured once
// when it starts again, from the history's own reference once its launch
// record has expired; a second collecting process adds no second observation
// or point; and a development server reads the same history and asks CI
// nothing (SEED-285#see-landed-ci-wall-time-history examples 2 and 3). A
// landing whose CI is not final is in ./landed-ci-history-pending.spec.ts; the
// first collection and the history read's shape are in
// ./landed-ci-history-collection.spec.ts.

import path from "node:path";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import {
  startFakeGitHub,
  type FakeGitHub,
} from "../../tests/support/fakeGitHub.ts";
import { isActionsRequest } from "../../tests/support/ghActionsRequest.ts";
import {
  keptLandedCiHistory,
  landedCiHistory,
  landedRecord,
  minutesAgo,
  observedKinds,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedBetween,
  publishedLanding,
  serveTrunkRuns,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// Marked Done longer ago than a Done record is kept (30 days).
const expiredDoneAt = () => minutesAgo(31 * 24 * 60);

// The GitHubs a test starts beside its own, all closed after it.
const githubs: FakeGitHub[] = [];

test.afterEach(async () => {
  await Promise.all(githubs.splice(0).map((github) => github.close()));
});

test("landings recorded before collection starts are collected by its first pass; one still running stays a pending gap through a restart and is measured once by two collecting processes, from the history's own reference after its Done record expired; a development server reads the same history and asks CI nothing", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  // Four landings on trunk, oldest first: `expired` recorded and marked Done
  // long ago, the others within the last hour; `unbuilt` is never built
  // itself, and the next one is.
  const expired = await publishedLanding(origin, {
    title: "expired",
    receipt: "aaaaaaaa-0000-4000-8000-000000000001",
    at: minutesAgo(32 * 24 * 60),
  });
  const unbuilt = await publishedLanding(origin, {
    title: "unbuilt",
    receipt: "aaaaaaaa-0000-4000-8000-000000000002",
    at: minutesAgo(30),
  });
  const measured = await publishedLanding(origin, {
    title: "measured",
    receipt: "aaaaaaaa-0000-4000-8000-000000000003",
    at: minutesAgo(20),
  });
  const running = await publishedLanding(origin, {
    title: "running",
    receipt: "aaaaaaaa-0000-4000-8000-000000000004",
    at: minutesAgo(10),
  });
  // `measured` built in 6 min 5 s; `running` still running.
  let runs: readonly CiRunAnswer[] = [
    trunkRun(
      expired.revision,
      40,
      passedBetween("2026-11-05T09:00:00Z", "2026-11-05T09:05:00Z"),
    ),
    trunkRun(
      measured.revision,
      41,
      passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
    ),
    trunkRun(running.revision, 43, {
      status: "in_progress",
      createdAt: "2026-11-05T10:30:00Z",
    }),
  ];
  serveTrunkRuns(github, origin, () => runs);
  // Recorded before any server here started; `expired`'s Done record has
  // expired, so it is outside the retained history.
  keepLaunchRecords(home, [
    landedRecord(expired, minutesAgo(31 * 24 * 60 + 30)),
    landedRecord(unbuilt),
    landedRecord(measured),
    landedRecord(running),
  ]);
  const measuredPoint = {
    kind: "point",
    revision: measured.revision,
    runUrl: "https://ci.invalid/runs/41",
    runId: 41,
    runAttempt: 1,
    startedAt: "2026-11-05T10:00:00Z",
    completedAt: "2026-11-05T10:06:05Z",
    landings: [
      {
        revision: measured.revision,
        receivedAt: measured.at,
        provenance: "exact",
      },
    ],
  };
  // CI built past `unbuilt` without building it: a final No build gap.
  const unbuiltGap = {
    kind: "gap",
    reason: "no-build",
    revision: unbuilt.revision,
    receivedAt: unbuilt.at,
  };
  const pendingHistory = {
    status: 200,
    body: {
      entries: [
        measuredPoint,
        unbuiltGap,
        {
          kind: "gap",
          reason: "pending",
          waitsFor: "build",
          revision: running.revision,
          receivedAt: running.at,
          runUrl: "https://ci.invalid/runs/43",
          runId: 43,
          runAttempt: 1,
        },
      ],
    },
  };

  await test.step("the first pass collects the landings already recorded: a point, a pending gap at the end, and the unbuilt landing, recorded half an hour ago, a final gap because CI built past it", async () => {
    const first = await startServer();
    await expect
      .poll(() => observedKinds(keptLandedCiHistory(home)))
      .toEqual({
        [unbuilt.receipt]: "gap",
        [measured.receipt]: "build",
        [running.receipt]: "pending",
      });
    expect(await landedCiHistory(first)).toEqual(pendingHistory);
    // The dashboard stops while `running` is still running.
    await first.close();
  });

  // Meanwhile every Done record expires and the run completes in 7 min 10 s.
  keepLaunchRecords(
    home,
    [expired, unbuilt, measured, running].map((each) =>
      landedRecord(each, expiredDoneAt()),
    ),
  );
  runs = [
    ...runs.slice(0, 2),
    trunkRun(
      running.revision,
      43,
      passedBetween("2026-11-05T10:30:00Z", "2026-11-05T10:37:10Z"),
    ),
  ];
  // A development server on the machine, asking a GitHub of its own.
  const developmentGitHub = await startFakeGitHub();
  githubs.push(developmentGitHub);
  serveTrunkRuns(developmentGitHub, origin, () => runs);
  const development = await startServer({
    github: developmentGitHub,
    environment: "development",
  });

  await test.step("a development server reads the same history, still pending", async () => {
    expect(await landedCiHistory(development)).toEqual(pendingHistory);
  });

  await test.step("two collecting processes start after CI completes: the pending landing is measured once, from the history's own reference", async () => {
    const [restarted, second] = await Promise.all([
      startServer(),
      startServer(),
    ]);
    const measuredHistory = {
      status: 200,
      body: {
        entries: [
          measuredPoint,
          {
            kind: "point",
            revision: running.revision,
            runUrl: "https://ci.invalid/runs/43",
            runId: 43,
            runAttempt: 1,
            startedAt: "2026-11-05T10:30:00Z",
            completedAt: "2026-11-05T10:37:10Z",
            landings: [
              {
                revision: running.revision,
                receivedAt: running.at,
                provenance: "exact",
              },
            ],
          },
          unbuiltGap,
        ],
      },
    };
    await expect
      .poll(() => landedCiHistory(restarted))
      .toEqual(measuredHistory);
    expect(await landedCiHistory(second)).toEqual(measuredHistory);
    const kept = keptLandedCiHistory(home);
    expect(observedKinds(kept)).toEqual({
      [unbuilt.receipt]: "gap",
      [measured.receipt]: "build",
      [running.receipt]: "build",
    });
    expect(Object.keys(kept.builds).sort()).toEqual(["run/41/1", "run/43/1"]);

    // The development server, started before them, reads what they
    // collected and has asked CI nothing, before or after.
    expect(await landedCiHistory(development)).toEqual(measuredHistory);
    expect(
      developmentGitHub.calls.filter(({ request }) =>
        isActionsRequest(request),
      ),
    ).toEqual([]);
  });
});
