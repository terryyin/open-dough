// Real comparison rules consume external facts; retained journeys own transport/UI wiring.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  baseline,
  start,
  branch,
  landing,
  completion,
  workflow,
  answer,
} from "../support/comparisonRead.ts";

test("a result never borrows the start build when the story has no result build", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(completion)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    baseline: { kind: "build", revision: start },
    landed: {
      kind: "none",
      explanation:
        "No build at eeeeeee: the workflow at that revision could not be read.",
    },
  });
});

test("Baseline passes a nearer proofless build and names the older usable ancestor", async () => {
  const history = makeMe.aRepository
    .withRevision(baseline, { files: { ".github/workflows/ci.yml": workflow } })
    .withRevision(start)
    .withRevision(branch)
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
        .with({ headSha: baseline, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 3, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: baseline, runId: 1, runAttempt: 1 })
        .please(),
      3: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 3, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    phase: "taken",
    baseline: {
      kind: "build",
      revision: baseline,
      runId: 1,
      selection: "ancestor",
      laterWithoutResult: 1,
    },
    branch: { kind: "build", revision: branch },
    landed: {
      kind: "not-landed",
      explanation: "The story has not landed yet.",
    },
  });
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([2, 1, 3]);
});

test("a confirmed skipped landing uses only its nearest equivalent build", async () => {
  const history = makeMe.aRepository
    .withRevision(start, { files: { ".github/workflows/ci.yml": workflow } })
    .withRevision(branch, { files: { "code.ts": "change" } })
    .withRevision(landing, { files: { "docs/notes.md": "ignored" } })
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
    landed: {
      kind: "build",
      revision: branch,
      runId: 2,
      selection: "equivalent",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "skipped",
        explanation:
          "Skipped at ddddddd because CI ignores every change since its nearest built ancestor ccccccc.",
      },
    },
  });
});

test("provider-reported skipped status preserves its own provenance beside Baseline", async () => {
  const history = makeMe.aRepository
    .withRevision(baseline)
    .withRevision(start)
    .withRevision(branch)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "story-branch", storyStart: start, liveTip: branch })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: baseline, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: start, conclusion: "skipped" })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 3, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: baseline, runId: 1, runAttempt: 1 })
        .please(),
      3: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 3, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    baseline: {
      revision: baseline,
      requestedStatus: {
        kind: "skipped",
        explanation: `Skipped at ${start.slice(0, 7)} (CI reported the run as skipped).`,
      },
    },
  });
});

test("without any ancestor build each requested endpoint names why a skip cannot be confirmed", async () => {
  const evidence = storyCiComparisonEvidence({
    history: makeMe.aRepository
      .withRevision(start)
      .withRevision(branch)
      .please(),
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion: branch })
      .please(),
    runs: [],
  });
  expect(await answer(evidence)).toMatchObject({
    baseline: {
      kind: "none",
      explanation:
        "No build at bbbbbbb: no ancestor build was found to compare against.",
    },
    landed: {
      kind: "none",
      explanation:
        "No build at ccccccc: no ancestor build was found to compare against.",
    },
  });
});
