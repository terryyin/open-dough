// Accepted equivalent wall time remains separate from proof-dependent figures.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { historyWallTimeMs } from "../../src/landedCiHistory.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  start,
  branch,
  landing,
  workflow,
  answer,
} from "../support/comparisonRead.ts";

test("a confirmed skipped landing reuses only its timed proofless equivalent wall time", async () => {
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
        .with({
          headSha: branch,
          databaseId: 2,
          attempt: 1,
          status: "completed",
          conclusion: "success",
          createdAt: "2026-11-05T13:30:00Z",
          startedAt: "2026-11-05T13:30:00Z",
          completedAt: "2026-11-05T13:35:00Z",
        })
        .please(),
    ],
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof.unavailable("none").please(),
    },
  });
  const result = await answer(evidence);
  expect(result).toMatchObject({
    landed: {
      kind: "build",
      revision: branch,
      runId: 2,
      runAttempt: 1,
      state: "pass",
      selection: "equivalent",
      startedAt: "2026-11-05T13:30:00Z",
      completedAt: "2026-11-05T13:35:00Z",
      requestedStatus: {
        kind: "skipped",
        explanation:
          "Skipped at ddddddd because CI ignores every change since its nearest built ancestor ccccccc.",
      },
    },
  });
  if (result.kind !== "comparison" || result.landed.kind !== "build")
    throw new Error("Expected the timed equivalent build");
  expect(
    historyWallTimeMs(result.landed.startedAt, result.landed.completedAt),
  ).toBe(300_000);
  // Baseline, Branch's bounded proof walk, then only the equivalent's proof.
  expect(evidence.reads.proofs.map((read) => read.runId)).toEqual([1, 2, 2]);
});
