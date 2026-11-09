// The bound of this machine's landed CI history
// (../../server/landedCiHistoryStore.ts) under collection
// (../../server/landedCiCollection.ts), with no page open, a real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`: a pass
// walks a project's landings newest first until it holds 20 measured builds,
// resolving only landings not yet final, and the history keeps only that
// window -- its landings' own references, though no launch record names them
// any more, and their builds -- dropping older measured landings, an older
// gap and a stale pending landing, which no pass asks CI about again
// (SEED-285#see-landed-ci-wall-time-history example 8). Which entries
// Project Intent shows from a fuller history is in
// ../../tests/intent/intent-ci-wall-time-history-window.spec.ts.

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import {
  keepLandedCiHistory,
  keptLandedCiHistory,
  landedCiHistory,
  minutesAgo,
  storyLandingRecord,
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

// The revisions whose runs collection listed.
const listedRevisions = (calls: readonly GhCall[]) =>
  new Set(
    calls.flatMap(({ request }) =>
      request.kind === "actions-runs" && request.headSha !== ""
        ? [request.headSha]
        : [],
    ),
  );

test("once a pass holds 20 measured builds, the history keeps only that window's landings and builds, dropping older ones and a stale pending landing, and resolves only landings not yet final", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  // Kept from earlier passes, oldest first: a pending landing a pass never
  // reached again, a landing CI never built, then 20 measured landings, one
  // a day, whose launch records have all expired.
  const day = 24 * 60 * 60_000;
  const start = Date.parse("2026-09-01T12:00:00Z");
  const at = (ms: number) => new Date(ms).toISOString();
  const receipt = (n: number) =>
    `ffffffff-0000-4000-8000-${String(n).padStart(12, "0")}`;
  let kept = makeMe.aLandedCiHistory
    .pendingLanding({
      receipt: receipt(0),
      revision: "f0".repeat(20),
      receivedAt: at(start - 2 * day),
      waitsFor: "build",
    })
    .unmeasuredLanding({
      receipt: receipt(1),
      revision: "f1".repeat(20),
      receivedAt: at(start - day),
      reason: "no-build",
    });
  const measured = [...Array(20).keys()].map((n) => ({
    receipt: receipt(10 + n),
    revision: (0x10 + n).toString(16).repeat(20),
    receivedAt: at(start + n * day),
    runId: 300 + n,
    startedAt: at(start + n * day),
    completedAt: at(start + n * day + 6 * 60_000),
  }));
  for (const landing of measured) kept = kept.measuredLanding(landing);
  keepLandedCiHistory(home, kept.please());
  // Two new landings, recorded in the last minutes, both built.
  const first = await publishedLanding(origin, {
    title: "first",
    receipt: receipt(100),
    at: minutesAgo(2),
  });
  const second = await publishedLanding(origin, {
    title: "second",
    receipt: receipt(101),
    at: minutesAgo(1),
  });
  serveTrunkRuns(github, origin, () => [
    trunkRun(
      first.revision,
      401,
      passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
    ),
    trunkRun(
      second.revision,
      402,
      passedBetween("2026-11-05T11:00:00Z", "2026-11-05T11:07:10Z"),
    ),
  ]);
  keepLaunchRecords(home, [
    storyLandingRecord(first, "execution"),
    storyLandingRecord(second, "execution"),
  ]);
  const server = await startServer();

  // The window: the two new landings and the 18 newest kept ones.
  const window = measured.slice(2);
  await expect
    .poll(() => Object.keys(keptLandedCiHistory(home).landings).sort())
    .toEqual(
      [
        first.receipt,
        second.receipt,
        ...window.map((each) => each.receipt),
      ].sort(),
    );
  expect(Object.keys(keptLandedCiHistory(home).builds).sort()).toEqual(
    [
      "run/401/1",
      "run/402/1",
      ...window.map((each) => `run/${String(each.runId)}/1`),
    ].sort(),
  );
  const answer = await landedCiHistory(server);
  expect(answer).toMatchObject({ status: 200 });
  const { entries } = answer.body as {
    readonly entries: readonly {
      readonly kind: string;
      readonly revision: string;
    }[];
  };
  expect(entries.map(({ kind, revision }) => [kind, revision])).toEqual([
    ...window.map(({ revision }) => ["point", revision]),
    ["point", first.revision],
    ["point", second.revision],
  ]);
  // Only the new landings' runs were asked for.
  expect(listedRevisions(github.calls)).toEqual(
    new Set([first.revision, second.revision]),
  );
});
