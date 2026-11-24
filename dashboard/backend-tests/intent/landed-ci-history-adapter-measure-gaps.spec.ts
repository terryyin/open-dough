// A landed CI collection pass (../../server/landedCiPass.ts) asks a retained
// adapter attempt for its job graph: an answer with no graph is a final
// measure gap naming the build, and a failed jobs read stays a pending gap
// that the next pass asks again (SEED-364#chart-ci-time-without-runner-waits).
// The adapter lookup's own reason words are in
// ../../../Distribution/tests/support/dashboard-ci-adapter-revision-lookup.test.mjs.
import { expect, test } from "vitest";
import { unansweredTimeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaitsAnswer.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import {
  keepWallTimeBuilds,
  landedCiPassInputs,
  machineHome,
  measuredHistoryEntries,
} from "../support/landedCiPassInputs.ts";

test("an adapter answer with no job graph is a final gap naming the build; a failed jobs read stays pending and is asked again", async () => {
  const [expired, failed] = ["1".repeat(40), "2".repeat(40)] as const;
  const adapterAttempt = (attemptId: string) => ({ runId: "run", attemptId });
  const home = machineHome();
  const records = await keepWallTimeBuilds(
    home,
    (
      [
        [expired, "expired:1"],
        [failed, "failed:1"],
      ] as const
    ).map(([revision, attemptId]) => ({
      revision,
      adapterAttempt: adapterAttempt(attemptId),
      runBranch: "main",
      runUrl: "https://ci.invalid/builds/run",
      startedAt: "2026-11-05T10:01:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    })),
  );
  const asked: (string | number | undefined)[] = [];
  const pass = landedCiPassInputs(
    [expired, failed],
    {
      runs: () => [],
      records: () => records,
      measureOf: ({ adapterAttempt: asking }) => {
        asked.push(asking?.attemptId);
        return asking?.attemptId === "failed:1"
          ? unansweredTimeWithoutRunnerWaits(
              "The CI adapter answered no job graph: jobs boom.",
            )
          : {
              reason: "The CI adapter gave no job graph: Job history expired!",
            };
      },
    },
    home,
  );

  await pass.collect();
  await pass.collect();

  expect(asked.toSorted()).toEqual(["expired:1", "failed:1", "failed:1"]);
  expect(await measuredHistoryEntries(home)).toMatchObject([
    {
      kind: "gap",
      reason: historyMeasure.value,
      revision: expired,
      explanation: "The CI adapter gave no job graph: Job history expired!",
      build: {
        revision: expired,
        provenance: "exact",
        adapterAttempt: adapterAttempt("expired:1"),
      },
    },
    {
      kind: "gap",
      reason: "pending",
      waitsFor: historyMeasure.value,
      revision: failed,
    },
  ]);
});
