// Canonical completed story, explicitly named attempts, and their prepared proof.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { StoryCiComparisonSlot } from "../../src/storyCiComparison.ts";

export const comparisonIdentity = "SEED-A#a";
export const comparisonCheckedAt = "2026-11-09T00:00:00.000Z";
export const comparisonRevisions = [
  "a".repeat(40),
  "b".repeat(40),
  "c".repeat(40),
] as const;

export function preparedComparison() {
  const source = makeMe.aPublishedSource
    .with({ id: "example", label: "Example", repository: "example/project" })
    .please();
  const work = makeMe.aPublishedWork
    .with({
      source,
      revision: comparisonRevisions[2],
      retrievedAt: new Date(comparisonCheckedAt),
      direction: "",
      taken: [],
      backlog: [],
      done: {
        status: "catalogued",
        revision: comparisonRevisions[2],
        records: [
          {
            identity: comparisonIdentity,
            completedAt: comparisonCheckedAt,
            fileName: "SEED-A_a.json",
            blob: "d".repeat(40),
          },
        ],
        unreadable: [],
      },
    })
    .please();
  const slots = comparisonRevisions.map(
    (revision, index): Extract<StoryCiComparisonSlot, { kind: "build" }> => ({
      kind: "build",
      revision,
      subject: ["before", "branch", "landed"][index] ?? "build",
      state: "pass",
      selection: "exact",
      laterWithoutResult: 0,
      runId: index + 1,
      runAttempt: 1,
      startedAt: "2026-11-09T00:00:00Z",
      completedAt: "2026-11-09T00:04:00Z",
      timeWithoutRunnerWaits: { milliseconds: 120_000 },
    }),
  );
  const [baseline, branch, landed] = slots;
  if (!baseline || !branch || !landed) {
    throw new Error("The three endpoint attempts are required");
  }
  const answer = makeMe.aStoryCiComparison
    .with({
      kind: "comparison",
      phase: "done",
      mode: "story-branch",
      identity: comparisonIdentity,
      storyStart: comparisonRevisions[0],
      completion: comparisonRevisions[2],
      checkedAt: comparisonCheckedAt,
      baseline,
      branch,
      landed,
    })
    .please();
  const proof = (runId: number) => {
    const revision = comparisonRevisions[runId - 1];
    if (revision === undefined) {
      throw new Error("An unarranged proof was requested");
    }
    return {
      runId,
      runAttempt: 1,
      revision,
      checkedAt: comparisonCheckedAt,
      proof: makeMe.aCiProof
        .summaryFor({ runId, runAttempt: 1, revision }, [
          makeMe.aCiProofEntry
            .at("dashboard/tests")
            .counting(runId + 1)
            .timed(runId * 1_000)
            .please(),
        ])
        .please(),
    };
  };
  return { source, work, identity: comparisonIdentity, answer, proof };
}
