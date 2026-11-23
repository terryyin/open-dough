import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciComparisonAnswers } from "../../server/intentCiComparisonAnswers.ts";
import { ciComparisonReader } from "../../server/intentCiComparisonRead.ts";
import { selectedCiComparisonAnswerSchema } from "../../src/selectedCiComparison.ts";
import {
  baseline,
  branch,
  comparisonProject,
  later,
  start,
} from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";

test("a selected Taken range asks the claimed branch for its CI builds", async () => {
  const storyBranch = "codex/taken";
  const evidence = storyCiComparisonEvidence({
    history: makeMe.aRepository
      .withRevision(baseline)
      .withRevision(start)
      .withRevision(branch)
      .withRevision(later)
      .please(),
    taken: makeMe.aTakenStoryEndpoint
      .with({
        mode: "story-branch",
        storyStart: baseline,
        liveTip: later,
        branch: storyBranch,
      })
      .please(),
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: baseline, databaseId: 81 })
        .please(),
      makeMe.aRevisionCiRun
        .with({
          headSha: branch,
          adapterAttempt: { runId: "taken/build", attemptId: "retry/3" },
          branch: storyBranch,
        })
        .please(),
      makeMe.aRevisionCiRun.with({ headSha: later, databaseId: 83 }).please(),
    ],
  });
  const reader = ciComparisonReader(ciComparisonAnswers());
  const range = { start, end: branch };
  const outcome = await reader(
    comparisonProject,
    { kind: "intent-ci-comparison", identity: "SEED-1#story", range },
    new AbortController().signal,
    evidence.source,
  );
  if (outcome.kind !== "answered") throw new Error("No selected CI answer");
  expect(selectedCiComparisonAnswerSchema.parse(outcome.answer)).toMatchObject({
    kind: "selection",
    phase: "taken",
    range,
    baseline: { kind: "build", revision: baseline, selection: "ancestor" },
    selection: {
      kind: "build",
      revision: branch,
      runBranch: storyBranch,
      adapterAttempt: { runId: "taken/build", attemptId: "retry/3" },
    },
  });
  expect(evidence.reads.branches).toEqual([storyBranch]);
});
