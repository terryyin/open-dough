// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// across the dashboard's own lifecycle, with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`, each
// collecting server checking its pending landings again at a test's pace:
// landings recorded before collection started are collected by its first
// pass; a landing still running when the dashboard stops is measured once
// when it starts again, from the history's own reference once its launch
// record has expired; a second collecting process adds no second observation
// or point; and a development server reads the same history and asks CI
// nothing (SEED-285#see-landed-ci-wall-time-history examples 2 and 3). Each
// build runs from when its landing was recorded, so the history answers its
// points and the gap between them in trunk order. A landing whose CI is not
// final is in ./landed-ci-history-pending.spec.ts; the first collection and
// the history read's shape are in ./landed-ci-history-collection.spec.ts.

import path from "node:path";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import { retainedHistory } from "../../tests/support/collectedScopeHistory.ts";
import { expectCollectedScopePoints } from "../../tests/support/collectedScopeReadProofs.ts";
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
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  exactHistoryPoint,
  noBuildHistoryGap,
  pendingBuildHistoryGap,
  publicHistoryAnswer,
} from "../../tests/support/landedCiHistoryAnswers.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { serveCollectedTrunkRuns } from "../../tests/support/landedCiScopeProofs.ts";
import {
  passedFrom,
  publishedLanding,
  runningFrom,
  serveTrunkRuns,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { collectedScopeFileSummary } from "../../tests/support/scopeHistoryProofs.ts";

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
  const measured = await publishedLanding(origin, {
    title: "measured",
    receipt: "aaaaaaaa-0000-4000-8000-000000000002",
    at: minutesAgo(30),
  });
  const unbuilt = await publishedLanding(origin, {
    title: "unbuilt",
    receipt: "aaaaaaaa-0000-4000-8000-000000000003",
    at: minutesAgo(20),
  });
  const running = await publishedLanding(origin, {
    title: "running",
    receipt: "aaaaaaaa-0000-4000-8000-000000000004",
    at: minutesAgo(10),
  });
  // Each build from when its landing was recorded: `measured` built in
  // 6 min 5 s; `running` still running. Recovered run 43 carries explicit
  // case/file timings through the shared CLI summary producer.
  let runs: readonly CiRunAnswer[] = [
    trunkRun(expired.revision, 40, passedFrom(expired.at, 5 * 60_000)),
    trunkRun(measured.revision, 41, passedFrom(measured.at, 365_000)),
    trunkRun(running.revision, 43, runningFrom(running.at)),
  ];
  const recoveredSummary = collectedScopeFileSummary(
    {
      repository: "terryyin/open-dough",
      runId: 43,
      attempt: 1,
      revision: running.revision,
    },
    [
      ["folder/a.spec.ts", 200, 20],
      ["folder/zero.spec.ts", 0, 0],
      ["root.spec.ts", 300, 30],
    ],
  );
  serveCollectedTrunkRuns(
    github,
    origin,
    () => runs,
    () => ({
      43: { kind: "collected", artifactId: 430, text: recoveredSummary },
    }),
  );
  // Recorded before any server here started; `expired`'s Done record has
  // expired, so it is outside the retained history.
  keepLaunchRecords(home, [
    landedRecord(expired, minutesAgo(31 * 24 * 60 + 30)),
    landedRecord(unbuilt),
    landedRecord(measured),
    landedRecord(running),
  ]);
  const measuredPoint = exactHistoryPoint(measured, {
    runId: 41,
    durationMs: 365_000,
  });
  // CI built past `unbuilt` without building it: a final No build gap.
  const unbuiltGap = noBuildHistoryGap(unbuilt);
  const pendingHistory = publicHistoryAnswer([
    measuredPoint,
    unbuiltGap,
    pendingBuildHistoryGap(running, 43),
  ]);

  await test.step("the first pass collects the landings already recorded: a point, then the unbuilt landing, a final gap because CI built past it, and a pending gap at the end", async () => {
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
    trunkRun(running.revision, 43, passedFrom(running.at, 430_000)),
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

  await test.step("two collecting processes start after CI completes: the pending landing is measured once, from the history's own reference, after the gap that falls between the two points", async () => {
    const [restarted, second] = await Promise.all([
      startServer(),
      startServer(),
    ]);
    const measuredHistory = publicHistoryAnswer([
      measuredPoint,
      unbuiltGap,
      exactHistoryPoint(running, { runId: 43, durationMs: 430_000 }),
    ]);
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
    await expect
      .poll(() => retainedHistory(home)?.builds["run/43/1"]?.proof)
      .toEqual({
        kind: "summary",
        summary: JSON.parse(recoveredSummary) as unknown,
      });

    // Equal scoped responses include the older build's proof gap too.
    await expect
      .poll(() => retainedHistory(home)?.builds["run/41/1"]?.proof)
      .toEqual({ kind: "unavailable", reason: "none" });
    const recoveredScopes = [
      ["dashboard/tests", 500, 50],
      ["dashboard/tests/folder", 200, 20],
      ["dashboard/tests/folder/zero.spec.ts", 0, 0],
    ] as const;
    const recoveredScope = {
      key: "run/43/1",
      revision: running.revision,
      through: running.at,
      scopes: recoveredScopes,
    };
    await expectCollectedScopePoints(
      [restarted.origin, second.origin],
      recoveredScope,
    );

    // The development server, started before them, reads what they
    // collected and has asked CI nothing, before or after.
    expect(await landedCiHistory(development)).toEqual(measuredHistory);
    expect(
      developmentGitHub.calls.filter(({ request }) =>
        isActionsRequest(request),
      ),
    ).toEqual([]);

    await second.close();
    const reader = await restartAsLandedCiReader(restarted, origin, "boundary");
    try {
      const asked = github.calls.length;
      await expectCollectedScopePoints(
        [reader.origin, reader.origin],
        recoveredScope,
      );
      expect(github.calls).toHaveLength(asked);
    } finally {
      await reader.close();
    }
  });
});
