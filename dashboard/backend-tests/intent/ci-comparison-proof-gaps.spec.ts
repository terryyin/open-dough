// Bounded proof walks through the real comparison read.
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

test("a cancelled Baseline keeps its requested status beside the older usable build", async () => {
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
        .with({
          headSha: start,
          databaseId: 2,
          attempt: 1,
          conclusion: "cancelled",
        })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: baseline, runId: 1, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    baseline: {
      kind: "build",
      revision: baseline,
      selection: "ancestor",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "cancelled",
        explanation: "Cancelled at bbbbbbb.",
      },
    },
  });
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([1]);
});

test("a branch proof walk passes unusable proof and an unbuilt tip to its nearest usable story-side build", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(completion)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "story-branch", storyStart: start, liveTip: completion })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: landing, databaseId: 3, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
      3: makeMe.aCiProof.unavailable("mismatched").please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    branch: {
      kind: "build",
      revision: branch,
      selection: "ancestor",
      laterWithoutResult: 2,
    },
  });
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([1, 3, 2]);
});

test("an all-proofless branch names its nearest timed build and never borrows the usable start build", async () => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing)
    .withRevision(completion)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "story-branch", storyStart: start, liveTip: completion })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: start, databaseId: 1, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: landing, databaseId: 3, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof.unavailable("expired").please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    baseline: { kind: "build", revision: start },
    branch: {
      kind: "build",
      revision: landing,
      runId: 3,
      selection: "ancestor",
      laterWithoutResult: 1,
    },
  });
  // The start's proof belongs to Baseline alone; result proof stops before it.
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([1, 3, 2]);
});

for (const position of [30, 31]) {
  test(`Baseline ${position === 30 ? "includes" : "excludes"} a usable build at position ${position} in its fixed history bound`, async () => {
    const before = [...Array.from({ length: 31 }).keys()].map((index) =>
      (index + 1).toString(16).padStart(40, "0"),
    );
    const initial = before[0],
      storyStart = before[30],
      selected = before[31 - position];
    if (!initial || !storyStart || !selected)
      throw new Error("Expected 31 named revisions");
    let repository = makeMe.aRepository.withRevision(initial);
    for (const revision of before.slice(1))
      repository = repository.withRevision(revision);
    repository = repository.withRevision(branch);
    const evidence = storyCiComparisonEvidence({
      history: repository.please(),
      taken: makeMe.aTakenStoryEndpoint
        .with({ mode: "story-branch", storyStart, liveTip: branch })
        .please(),
      runs: [
        makeMe.aRevisionCiRun
          .with({ headSha: selected, databaseId: 1, attempt: 1 })
          .please(),
      ],
      proofs: {
        1: makeMe.aCiProof
          .summaryFor({ revision: selected, runId: 1, runAttempt: 1 })
          .please(),
      },
    });
    const result = await answer(evidence);
    expect(result).toMatchObject({
      baseline:
        position === 30
          ? {
              kind: "build",
              revision: selected,
              selection: "ancestor",
              laterWithoutResult: 29,
            }
          : {
              kind: "none",
              explanation: `No build at ${storyStart.slice(0, 7)}: the workflow at that revision could not be read.`,
            },
    });
    // Status classification may inspect an ancestor as a diff basis; the
    // endpoint's proof search must still exclude the build beyond its bound.
    expect(evidence.reads.proofs.map((read) => read.runId)).toEqual(
      position === 30 ? [1] : [],
    );
  });
}

test("a confirmed skipped landing stops at its proofless equivalent instead of borrowing older usable proof", async () => {
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
    },
  });
  expect(await answer(evidence)).toMatchObject({
    landed: {
      kind: "none",
      explanation:
        "The equivalent build at ccccccc published no CI proof summary.",
      requestedStatus: {
        kind: "skipped",
        explanation:
          "Skipped at ddddddd because CI ignores every change since its nearest built ancestor ccccccc.",
      },
    },
  });
  // Baseline, Branch's bounded proof walk, then only the equivalent's proof.
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([1, 2, 2]);
});
