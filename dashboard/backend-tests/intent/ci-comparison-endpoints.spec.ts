// Real comparison rules consume external facts; retained journeys own transport/UI wiring.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  baseline,
  start,
  branch,
  landing,
  completion,
  later,
  workflow,
  answer,
} from "../support/comparisonRead.ts";

test("Done Story Branch uses its start ancestor, branch side and landing with the selected attempt's jobs", async () => {
  const history = makeMe.aRepository
    .withRevision(baseline, { files: { ".github/workflows/ci.yml": workflow } })
    .withRevision(start, { files: { "docs/plan.md": "ready" } })
    .withRevision(landing)
    .withRevision(completion)
    .withWorkspace("story", { from: start })
    .withUnpublishedRevision(branch, { message: "story change" })
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion,
        branch: "story",
        landing: { merge: landing, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: baseline, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 2 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: landing, databaseId: 3, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: completion, databaseId: 4, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: baseline, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 2 })
        .please(),
    },
    jobs: {
      "1/1": [
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 120_000, needs: [] })
          .please(),
      ],
      "2/2": [
        makeMe.aCiTimingJob
          .withTiming({ id: "build", durationMs: 30_000, needs: [] })
          .please(),
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 150_000, needs: ["build"] })
          .please(),
      ],
      "3/1": [
        makeMe.aCiTimingJob
          .withTiming({ id: "test", durationMs: 240_000, needs: [] })
          .please(),
      ],
    },
  });
  expect(await answer(evidence)).toMatchObject({
    kind: "comparison",
    phase: "done",
    mode: "story-branch",
    completion,
    storyStart: start,
    baseline: {
      kind: "build",
      revision: baseline,
      selection: "ancestor",
      laterWithoutResult: 1,
      runId: 1,
      runAttempt: 1,
      requestedStatus: {
        kind: "skipped",
        explanation:
          "Skipped at bbbbbbb because CI ignores every change since its nearest built ancestor aaaaaaa.",
      },
      timeWithoutRunnerWaits: { milliseconds: 120_000 },
    },
    branch: {
      kind: "build",
      revision: branch,
      subject: "story change",
      selection: "exact",
      runId: 2,
      runAttempt: 2,
      timeWithoutRunnerWaits: { milliseconds: 180_000 },
    },
    landed: {
      kind: "build",
      revision: landing,
      selection: "exact",
      runId: 3,
      timeWithoutRunnerWaits: { milliseconds: 240_000 },
    },
  });
  expect(evidence.reads.verified).toEqual([completion]);
  expect(evidence.reads.jobs).toEqual(["1/1", "2/2", "3/1"]);
  expect(evidence.reads.revisions).not.toContain(completion);
});

test("Done Trunk reads a completion ancestor within the story bound and has no Branch", async () => {
  const history = makeMe.aRepository
    .withRevision(start, { files: { ".github/workflows/ci.yml": workflow } })
    .withRevision(branch, { files: { "docs/story.md": "done" } })
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
    phase: "done",
    mode: "trunk",
    baseline: { kind: "build", revision: start },
    branch: {
      kind: "not-applicable",
      explanation:
        "Branch comparison is not applicable for a Trunk Mode story.",
    },
    landed: {
      kind: "build",
      revision: branch,
      selection: "ancestor",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "skipped",
        explanation:
          "Skipped at eeeeeee because CI ignores every change since its nearest built ancestor ccccccc.",
      },
    },
  });
});

test("a fast-forward landing uses its exact branch tip instead of a later trunk build", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion: later,
        landing: { merge: branch, branchSide: branch },
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 3, attempt: 1 })
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
    branch: { kind: "build", revision: branch, selection: "exact" },
    landed: { kind: "build", revision: branch, selection: "exact" },
  });
  expect(evidence.reads.revisions).not.toContain(later);
});
