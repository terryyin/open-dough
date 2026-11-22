// Custom-adapter facts for comparisons of a story published by an owning
// landing merge before its completion.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { Answers } from "../intentCiAdapterProofProject.ts";
import { proofSummaryForEntries } from "./ciProofArtifacts.ts";
import type { publishCodeLandedBeforeCompletion } from "./storyCiComparisonEarlierLanding.ts";

const proofOf = (
  repository: string,
  tested: ReturnType<typeof makeMe.aCiAdapterAttempt.please>,
  passed: number,
  durationMs: number,
) => ({
  summary: proofSummaryForEntries(
    {
      repository,
      attemptId: String(tested.attemptId),
      revision: tested.sha.toLowerCase(),
    },
    [
      makeMe.aCiProofEntry
        .at("tests")
        .counting(passed, "case")
        .timed(durationMs)
        .please(),
    ],
  ),
});

export function landedAdapterComparisonAnswers(
  repository: string,
  setup: Awaited<ReturnType<typeof publishCodeLandedBeforeCompletion>>,
) {
  const branch = setup.branchAncestor;
  const landed = setup.landingMerge;
  const startedAt = "2026-11-05T10:00:00Z";
  const baselineAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: setup.baseline,
      runId: "before|opaque",
      attemptId: "a-base+#",
      branch: "main",
      startedAt,
      completedAt: "2026-11-05T10:02:00Z",
    })
    .please();
  const olderBaselineAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: setup.baseline,
      runId: "older-baseline",
      attemptId: "older-baseline",
      branch: "main",
      startedAt,
      completedAt: "2026-11-05T10:01:00Z",
    })
    .please();
  // The exact SHA counts even though a different branch validated it.
  const branchAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: branch.toUpperCase(),
      runId: 402,
      attemptId: 2,
      branch: "ci/another-branch",
      startedAt,
      completedAt: "2026-11-05T10:03:20Z",
    })
    .please();
  const landedAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: landed,
      runId: "merged",
      attemptId: "a-landed",
      branch: "main",
      startedAt,
      completedAt: "2026-11-05T10:04:00Z",
    })
    .please();
  const answers = {
    discover: {
      main: [
        baselineAttempt,
        olderBaselineAttempt,
        landedAttempt,
        makeMe.aCiAdapterAttempt
          .passed({
            sha: setup.completion,
            runId: "completed",
            attemptId: "later",
            branch: "main",
            startedAt,
            completedAt: "2026-11-05T10:09:00Z",
          })
          .please(),
      ],
      [setup.branch]: [branchAttempt],
    },
    proof: { unavailable: "no summary retained for this attempt" },
    proofByAttemptId: {
      [baselineAttempt.attemptId]: proofOf(
        repository,
        baselineAttempt,
        5,
        3_000,
      ),
      [branchAttempt.attemptId]: proofOf(repository, branchAttempt, 8, 5_000),
      [landedAttempt.attemptId]: proofOf(repository, landedAttempt, 7, 4_000),
    },
    jobsByAttemptId: {
      [baselineAttempt.attemptId]: {
        jobs: [
          makeMe.aCiTimingJob
            .withTiming({ id: "tests", durationMs: 90_000 })
            .please(),
        ],
      },
      [olderBaselineAttempt.attemptId]: {
        jobs: [
          makeMe.aCiTimingJob
            .withTiming({ id: "tests", durationMs: 10_000 })
            .please(),
        ],
      },
      [branchAttempt.attemptId]: {
        jobs: [
          makeMe.aCiTimingJob
            .withTiming({ id: "build", durationMs: 30_000 })
            .please(),
          makeMe.aCiTimingJob
            .withTiming({ id: "test-a", durationMs: 40_000, needs: ["build"] })
            .please(),
          makeMe.aCiTimingJob
            .withTiming({ id: "test-b", durationMs: 60_000, needs: ["build"] })
            .please(),
        ],
      },
      [landedAttempt.attemptId]: {
        jobs: [
          makeMe.aCiTimingJob
            .withTiming({ id: "tests", durationMs: 75_000 })
            .please(),
        ],
      },
    },
  } satisfies Answers;
  return {
    answers,
    branch,
    landed,
    baselineAttempt,
    branchAttempt,
    landedAttempt,
  };
}
