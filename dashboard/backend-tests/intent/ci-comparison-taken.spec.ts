// Real comparison rules consume external facts; retained journeys own transport/UI wiring.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { start, branch, later, answer } from "../support/comparisonRead.ts";

test("Taken Trunk shows a provisional completed result and keeps Landed unavailable", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "trunk", storyStart: start, liveTip: branch })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    phase: "taken",
    mode: "trunk",
    branch: {
      kind: "not-applicable",
      explanation:
        "Branch comparison is not applicable for a Trunk Mode story.",
    },
    landed: {
      kind: "not-landed",
      explanation: "The story has not landed yet.",
    },
    provisional: { kind: "build", revision: branch },
  });
});

test("an adapter result keeps opaque attempt identity and reads that selected attempt's graph", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const adapter = makeMe.aCiAdapterAttempt
    .passed({
      sha: branch,
      runId: "build/opaque",
      attemptId: "retry:2",
      branch: "story",
      startedAt: "2026-11-09T00:00:00Z",
      completedAt: "2026-11-09T00:05:00Z",
    })
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        liveTip: branch,
        branch: "story",
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: adapter.sha,
          adapterAttempt: {
            runId: adapter.runId,
            attemptId: adapter.attemptId,
          },
          branch: adapter.branch,
          startedAt: adapter.startedAt,
          completedAt: adapter.completedAt,
        })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
    },
    jobs: {
      "build/opaque/retry:2": [
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 90_000, needs: [] })
          .please(),
      ],
    },
    preferCompletedAncestor: true,
  });
  expect(await answer(evidence)).toMatchObject({
    phase: "taken",
    branch: {
      kind: "build",
      revision: branch,
      adapterAttempt: { runId: "build/opaque", attemptId: "retry:2" },
      runBranch: "story",
      startedAt: "2026-11-09T00:00:00Z",
      completedAt: "2026-11-09T00:05:00Z",
      timeWithoutRunnerWaits: { milliseconds: 90_000 },
    },
  });
  expect(evidence.reads.jobs).toEqual(["1/1", "build/opaque/retry:2"]);
  expect(evidence.reads.branches).toEqual(["story"]);
});

test("a running adapter tip shows its completed story-side ancestor as provisional", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "trunk", storyStart: start, liveTip: later })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: branch,
          adapterAttempt: { runId: "branch", attemptId: "passed" },
          branch: "main",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: later,
          status: "in_progress",
          conclusion: null,
          adapterAttempt: { runId: "tip", attemptId: "running" },
          branch: "main",
        })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
    },
    preferCompletedAncestor: true,
  });
  expect(await answer(evidence)).toMatchObject({
    phase: "taken",
    provisional: {
      kind: "build",
      revision: branch,
      selection: "ancestor",
      laterWithoutResult: 1,
      laterRunning: true,
      adapterAttempt: { runId: "branch", attemptId: "passed" },
    },
  });
  expect(evidence.reads.jobs).toEqual(["1/1", "branch/passed"]);
});
