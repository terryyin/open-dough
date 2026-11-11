// Missing timing and opaque adapter identity through the real comparison read.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { start, branch, answer } from "../support/comparisonRead.ts";

test("a completed endpoint keeps missing wall times distinct from an unavailable job-chain estimate", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion: branch })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({
          headSha: branch,
          databaseId: 2,
          attempt: 1,
          createdAt: "",
          startedAt: "",
          completedAt: "",
        })
        .please(),
    ],
    proofs: {
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
    },
    jobs: {
      "2/1": [
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 60_000, needs: ["missing"] })
          .please(),
      ],
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "build",
      revision: branch,
      runId: 2,
      runAttempt: 1,
      selection: "exact",
      timeWithoutRunnerWaits: {
        reason: "The CI adapter's job “test” needs unknown job “missing”.",
      },
    },
  });
  if (result.kind !== "comparison") throw new Error("Expected comparison");
  expect(result.landed).not.toHaveProperty("startedAt");
  expect(result.landed).not.toHaveProperty("completedAt");
  expect(evidence.reads.proofs).toEqual([
    { revision: branch, runId: 2, runAttempt: 1 },
  ]);
  expect(evidence.reads.jobs).toEqual(["2/1"]);
});

test("an adapter endpoint without artifact identity keeps its own opaque attempt and missing timing reasons", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const adapter = makeMe.aCiAdapterAttempt
    .with({
      sha: branch,
      runId: "landing/opaque",
      attemptId: "retry:2",
      outcome: "success",
      branch: "story",
    })
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion: branch,
        landing: { merge: branch, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({
          headSha: adapter.sha,
          adapterAttempt: {
            runId: adapter.runId,
            attemptId: adapter.attemptId,
          },
          ...(adapter.branch !== undefined ? { branch: adapter.branch } : {}),
          // Discovery omitted wall-time bounds; empty strings clear revision
          // timing defaults the way attemptTimesOf treats missing bounds.
          createdAt: "",
          startedAt: "",
          completedAt: "",
        })
        .please(),
    ],
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    branch: {
      kind: "build",
      revision: branch,
      adapterAttempt: { runId: "landing/opaque", attemptId: "retry:2" },
      timeWithoutRunnerWaits: { reason: "The CI adapter reported no jobs." },
    },
    landed: {
      kind: "build",
      revision: branch,
      adapterAttempt: { runId: "landing/opaque", attemptId: "retry:2" },
      timeWithoutRunnerWaits: { reason: "The CI adapter reported no jobs." },
    },
  });
  if (result.kind !== "comparison") throw new Error("Expected comparison");
  expect(result.landed).not.toHaveProperty("runId");
  expect(result.landed).not.toHaveProperty("startedAt");
  expect(result.landed).not.toHaveProperty("completedAt");
  expect(evidence.reads.proofs).toEqual([]);
  expect(evidence.reads.jobs).toEqual([
    "landing/opaque/retry:2",
    "landing/opaque/retry:2",
  ]);
});
