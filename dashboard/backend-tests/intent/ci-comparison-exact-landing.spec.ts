// Exact-revision landing rules through the real comparison read.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  start,
  branch,
  landing,
  later,
  workflow,
  answer,
} from "../support/comparisonRead.ts";

test("a timed-out landing stays exact even when older and later usable builds exist", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion: landing,
        landing: { merge: landing, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: landing,
          databaseId: 3,
          attempt: 1,
          conclusion: "timed_out",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 4, attempt: 1 })
        .please(),
    ],
    proofs: {
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
      4: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 4, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    branch: { kind: "build", revision: branch },
    landed: {
      kind: "none",
      explanation: "The CI build at the landing merge timed out.",
    },
  });
  expect(evidence.reads.revisions).not.toContain(later);
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([2]);
});

test("an unexplained code landing uses neither ancestor proof nor a later trunk build", async () => {
  const history = makeMe.aRepository
    .withRevision(start, { files: { ".github/workflows/ci.yml": workflow } })
    .withRevision(branch, { files: { "code.ts": "before" } })
    .withRevision(landing, { files: { "code.ts": "after" } })
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion: landing,
        landing: { merge: landing, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 4, attempt: 1 })
        .please(),
    ],
    proofs: {
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
      4: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 4, runAttempt: 1 })
        .please(),
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "none",
      explanation: "No build at ddddddd: changes CI does not ignore.",
      requestedStatus: {
        kind: "no-build",
        explanation: "No build at ddddddd: changes CI does not ignore.",
      },
    },
  });
  // The shared finality judge may establish that CI passed the unbuilt landing.
  expect(evidence.reads.revisions).toContain(later);
  if (result.kind !== "comparison") throw new Error("Expected comparison");
  expect(result.landed).not.toHaveProperty("revision");
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([2]);
  expect(evidence.reads.jobs).not.toContain("4/1");
});

test("a cancelled latest attempt keeps its own earlier completed attempt instead of later trunk proof", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion: landing,
        landing: { merge: landing, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({
          headSha: landing,
          databaseId: 3,
          attempt: 2,
          conclusion: "cancelled",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: landing, databaseId: 3, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 4, attempt: 1 })
        .please(),
    ],
    jobs: {
      "3/1": [
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 90_000 })
          .please(),
      ],
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "build",
      revision: landing,
      runId: 3,
      runAttempt: 1,
      selection: "exact",
      timeWithoutRunnerWaits: { milliseconds: 90_000 },
    },
  });
  if (result.kind !== "comparison") throw new Error("Expected comparison");
  expect(result.landed).not.toHaveProperty("requestedStatus");
  expect(evidence.reads.revisions).not.toContain(later);
  expect(evidence.reads.jobs).toEqual(["3/1"]);
});
