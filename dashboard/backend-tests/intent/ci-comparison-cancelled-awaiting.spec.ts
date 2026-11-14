// Refreshable cancelled landings through the real comparison read.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { isFinalCiComparisonAnswer } from "../../server/intentCiComparisonAnswers.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  start,
  branch,
  landing,
  completion,
  later,
  answer,
} from "../support/comparisonRead.ts";

test("a running later build stops before farther usable proof and keeps the answer refreshable", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(completion)
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
          attempt: 1,
          conclusion: "cancelled",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: completion,
          databaseId: 4,
          attempt: 1,
          status: "in_progress",
          conclusion: null,
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 5, attempt: 1 })
        .please(),
    ],
    proofs: {
      5: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 5, runAttempt: 1 })
        .please(),
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "none",
      awaitingLaterBuild: true,
      explanation:
        "The CI build at the landing merge was cancelled. A later trunk build at eeeeeee (run 4 #1) is still running, so no later trunk build has finished yet.",
    },
  });
  expect(isFinalCiComparisonAnswer(result)).toBe(false);
  expect(evidence.reads.revisions).not.toContain(later);
  expect(evidence.reads.proofs).toEqual([]);
});

test("the nearest unusable proof remains the explanation before a stopped running build", async () => {
  const running = "1".repeat(40);
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(completion)
    .withRevision(running)
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
          attempt: 1,
          conclusion: "cancelled",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: completion, databaseId: 4, attempt: 2 })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: running,
          databaseId: 5,
          attempt: 1,
          status: "in_progress",
          conclusion: null,
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 6, attempt: 1 })
        .please(),
    ],
    proofs: {
      4: makeMe.aCiProof.unavailable("expired").please(),
      6: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 6, runAttempt: 1 })
        .please(),
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "none",
      awaitingLaterBuild: true,
      explanation:
        "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 4 #2) has an expired CI proof summary. A later trunk build at 1111111 (run 5 #1) is still running.",
    },
  });
  expect(isFinalCiComparisonAnswer(result)).toBe(false);
  expect(evidence.reads.revisions).not.toContain(later);
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([4]);
});

test("a cancelled tip at the read head says no later build has finished and stays refreshable", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
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
          headSha: branch,
          databaseId: 2,
          attempt: 1,
          conclusion: "cancelled",
        })
        .please(),
    ],
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "none",
      awaitingLaterBuild: true,
      explanation:
        "The CI build at the landed story revision was cancelled. No later trunk build has finished yet.",
    },
  });
  expect(isFinalCiComparisonAnswer(result)).toBe(false);
});

test("an ended search names the nearest unusable proof rather than a farther failure or no finished build", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(completion)
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
          attempt: 1,
          conclusion: "cancelled",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: completion, databaseId: 4, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 5, attempt: 1 })
        .please(),
    ],
    proofs: { 5: makeMe.aCiProof.unavailable("unreadable").please() },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "none",
      awaitingLaterBuild: true,
      explanation:
        "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 4 #1) published no CI proof summary.",
    },
  });
  expect(isFinalCiComparisonAnswer(result)).toBe(false);
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([4, 5]);
});
