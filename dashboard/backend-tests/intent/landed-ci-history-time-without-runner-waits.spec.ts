// A landed CI collection pass (../../server/landedCiPass.ts) keeps CI time
// without runner waits with each retained passed build, asking its recorded
// attempt's jobs once (../../server/landedCiRetainedMeasure.ts); a history
// read naming the measure answers that time and one that does not keeps
// wall time (../../server/intentCiHistoryRead.ts)
// (SEED-364#chart-ci-time-without-runner-waits example 1).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RevisionCiBuild } from "../../server/baseCiRevisionNearest.ts";
import { timeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import {
  historyEntries,
  keepWallTimeBuilds,
  landedCiPassInputs,
  machineHome,
  measuredHistoryEntries,
} from "../support/landedCiPassInputs.ts";

const dependentJobsWorkflow = [
  "on: push",
  "jobs:",
  "  first:",
  "    name: First",
  "    runs-on: ubuntu-24.04",
  "  second:",
  "    name: Second",
  "    needs: first",
  "    runs-on: ubuntu-24.04",
].join("\n");

const after = (at: string, ms: number) =>
  new Date(Date.parse(at) + ms).toISOString();

// A 2 min job then a 3 min one, each after its runner wait.
const attempt = (start: string, firstWaitMs: number, secondWaitMs: number) => {
  const firstStart = after(start, firstWaitMs);
  const firstEnd = after(firstStart, 2 * 60_000);
  const secondStart = after(firstEnd, secondWaitMs);
  const secondEnd = after(secondStart, 3 * 60_000);
  return {
    start,
    end: secondEnd,
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
  };
};

test("a retained build's own attempt jobs give 5 min without two runner waits, asked once; the wall-time read keeps wall time", async () => {
  const [short, long] = ["1".repeat(40), "2".repeat(40)] as const;
  const attempts: Record<number, ReturnType<typeof attempt>> = {
    41: attempt("2026-11-05T10:00:00.000Z", 30_000, 60_000),
    42: attempt("2026-11-05T11:00:00.000Z", 2 * 60_000, 3 * 60_000),
  };
  const kept = (revision: string, runId: 41 | 42) => ({
    revision,
    runId,
    runAttempt: 1,
    startedAt: attempts[runId]?.start,
    completedAt: attempts[runId]?.end,
  });
  const home = machineHome();
  const records = await keepWallTimeBuilds(home, [
    kept(short, 41),
    kept(long, 42),
  ]);
  const asked: Pick<RevisionCiBuild, "revision" | "runId" | "runAttempt">[] =
    [];
  const pass = landedCiPassInputs(
    [short, long],
    {
      runs: () => [],
      records: () => records,
      measureOf: ({ revision, runId, runAttempt }) => {
        asked.push({ revision, runId, runAttempt });
        return timeWithoutRunnerWaits(
          dependentJobsWorkflow,
          attempts[runId ?? 0]?.jobs ?? [],
          false,
        );
      },
    },
    home,
  );

  await pass.collect();
  await pass.collect();

  // Each attempt once, newest first, across both passes.
  expect(asked).toEqual([
    { revision: long, runId: 42, runAttempt: 1 },
    { revision: short, runId: 41, runAttempt: 1 },
  ]);
  const timeOf = (entries: Awaited<ReturnType<typeof historyEntries>>) =>
    entries.map((entry) => (entry.kind === "point" ? entry.timeMs : entry));
  expect(timeOf(await measuredHistoryEntries(home))).toEqual([
    5 * 60_000,
    5 * 60_000,
  ]);
  // The wall-time read names no measure; its points keep their attempt's
  // bounds, 6.5 and 10 min apart.
  expect(
    (await historyEntries(home)).map((entry) =>
      entry.kind === "point"
        ? [entry.timeMs, entry.startedAt, entry.completedAt]
        : entry,
    ),
  ).toEqual(
    [attempts[41], attempts[42]].map((timed) => [
      undefined,
      timed?.start,
      timed?.end,
    ]),
  );
});
