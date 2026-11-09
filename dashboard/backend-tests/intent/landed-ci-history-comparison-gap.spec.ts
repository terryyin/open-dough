// The existing live comparison's final gap omits the history-only named build.
import { asComparisonSlot } from "../../server/intentCiComparisonSlots.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";

test.use({ serverMode: "boundary" });

test("the CI timing comparison answers a Landed gap without the build the history names for it or why its CI proof could not be used", async () => {
  const explanation =
    "The CI build at the landed story revision was cancelled. The nearest later trunk build has a CI proof summary that could not be read.";
  const asked: string[] = [];
  const lookup = {
    listRunsAt: (sha: string) => {
      asked.push(sha);
      return Promise.resolve([]);
    },
    subjectOf: () => Promise.resolve("subject"),
    timeWithoutRunnerWaitsOf: () => Promise.resolve({ reason: "not read" }),
  };

  expect(
    await asComparisonSlot(
      {
        kind: "none",
        explanation,
        cancelled: true,
        unusableProof: "unreadable",
        proofUnanswered: true,
        unusableBuild: {
          revision: "d6".repeat(20),
          selection: "later",
          runId: 66,
          runAttempt: 1,
        },
      },
      lookup,
    ),
  ).toEqual({ kind: "none", explanation });
  expect(asked).toEqual([]);
});
