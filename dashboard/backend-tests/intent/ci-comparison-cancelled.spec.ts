// Cancelled landing selection and its fixed bound through the real comparison read.
import { makeMe } from "../../../tests/support/makeMe.mjs";
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

test("a cancelled merge passes cancelled, unbuilt and unusable-proof revisions to the nearest usable later build", async () => {
  const unbuilt = "1".repeat(40),
    proofless = "2".repeat(40),
    invalid = "3".repeat(40),
    selected = "4".repeat(40);
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(landing, { parents: [start, branch] })
    .withRevision(completion)
    .withRevision(unbuilt)
    .withRevision(proofless)
    .withRevision(invalid)
    .withRevision(selected)
    .withRevision(later)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: start,
        completion,
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
          conclusion: "cancelled",
        })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: proofless, databaseId: 5, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: invalid, databaseId: 6, attempt: 1 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: selected, databaseId: 7, attempt: 2 })
        .please(),
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 8, attempt: 1 })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
      6: makeMe.aCiProof.unavailable("invalid").please(),
      7: makeMe.aCiProof
        .summaryFor({ revision: selected, runId: 7, runAttempt: 2 })
        .please(),
      8: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 8, runAttempt: 1 })
        .please(),
    },
  });

  expect(await answer(evidence)).toMatchObject({
    baseline: { kind: "build", revision: start },
    branch: { kind: "build", revision: branch },
    landed: {
      kind: "build",
      revision: selected,
      runId: 7,
      runAttempt: 2,
      selection: "later",
      laterWithoutResult: 5,
      requestedStatus: {
        kind: "cancelled",
        explanation: "Cancelled at ddddddd.",
      },
    },
  });
  expect(
    evidence.reads.revisions.filter((revision) =>
      [completion, unbuilt, proofless, invalid, selected, later].includes(
        revision,
      ),
    ),
  ).toEqual([completion, unbuilt, proofless, invalid, selected]);
  expect(evidence.reads.proofs).toEqual([
    { revision: start, runId: 1, runAttempt: 1 },
    { revision: branch, runId: 2, runAttempt: 1 },
    { revision: proofless, runId: 5, runAttempt: 1 },
    { revision: invalid, runId: 6, runAttempt: 1 },
    { revision: selected, runId: 7, runAttempt: 2 },
  ]);
});

test("a cancelled fast-forward tip may use a failed later build with usable proof", async () => {
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
      makeMe.aRevisionCiRun
        .with({
          headSha: later,
          databaseId: 3,
          attempt: 1,
          conclusion: "failure",
        })
        .please(),
    ],
    proofs: {
      3: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 3, runAttempt: 1 })
        .please(),
    },
  });
  expect(await answer(evidence)).toMatchObject({
    landed: {
      kind: "build",
      state: "failed",
      revision: later,
      runId: 3,
      selection: "later",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "cancelled",
        explanation: "Cancelled at ccccccc.",
      },
    },
  });
});

for (const position of [30, 31]) {
  test(`a cancelled landing ${position === 30 ? "includes usable proof at" : "stops before usable proof beyond"} the fixed 30-revision bound`, async () => {
    const after = [...Array.from({ length: 31 }).keys()].map((index) =>
      (index + 1).toString(16).padStart(40, "0"),
    );
    let repository = makeMe.aRepository
      .withRevision(start)
      .withRevision(branch)
      .withRevision(landing);
    for (const revision of after)
      repository = repository.withRevision(revision);
    const selected = after[position - 1];
    if (selected === undefined) throw new Error("Missing bounded revision");
    const evidence = storyCiComparisonEvidence({
      history: repository.please(),
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
          .with({ headSha: selected, databaseId: 4, attempt: 1 })
          .please(),
      ],
      proofs: {
        4: makeMe.aCiProof
          .summaryFor({ revision: selected, runId: 4, runAttempt: 1 })
          .please(),
      },
    });
    const result = await answer(evidence);
    expect(result).toMatchObject({
      landed:
        position === 30
          ? {
              kind: "build",
              revision: selected,
              selection: "later",
              laterWithoutResult: 30,
            }
          : {
              kind: "none",
              explanation:
                "The CI build at the landing merge was cancelled. No later trunk build finished within 30 later trunk revisions.",
            },
    });
    expect(
      evidence.reads.revisions.filter((revision) => after.includes(revision)),
    ).toEqual(after.slice(0, 30));
    expect(evidence.reads.proofs.map((read) => read.runId)).toEqual(
      position === 30 ? [4] : [],
    );
    expect(isFinalCiComparisonAnswer(result)).toBe(true);
  });
}
