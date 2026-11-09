// The cancelled landing's explicitly refreshable gap must not become final.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { start, branch, later } from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  expect,
  test,
  observedComparisonSource,
} from "../support/comparisonMemory.ts";

test("an awaiting-later gap reads a newly published trunk head and then remembers its usable build", async ({
  comparisonRead,
}) => {
  const done = makeMe.aPublishedStoryEndpoint
    .with({
      mode: "story-branch",
      storyStart: start,
      completion: branch,
      landing: { merge: branch, branchSide: branch },
    })
    .please();
  const runs = [
    makeMe.aRevisionCiRun
      .with({
        headSha: branch,
        databaseId: 2,
        attempt: 1,
        conclusion: "cancelled",
      })
      .please(),
    makeMe.aRevisionCiRun
      .with({ headSha: later, databaseId: 3, attempt: 1 })
      .please(),
  ];
  const before = storyCiComparisonEvidence({
    history: makeMe.aRepository
      .withRevision(start)
      .withRevision(branch)
      .please(),
    done,
    runs,
  });
  const observed = observedComparisonSource(before.source);
  expect(await comparisonRead(observed.source)).toMatchObject({
    landed: {
      kind: "none",
      awaitingLaterBuild: true,
      explanation:
        "The CI build at the landed story revision was cancelled. No later trunk build has finished yet.",
    },
  });
  const first = { ...observed.reads };
  const after = storyCiComparisonEvidence({
    history: makeMe.aRepository
      .withRevision(start)
      .withRevision(branch)
      .withRevision(later)
      .please(),
    done,
    runs,
    proofs: {
      3: makeMe.aCiProof
        .summaryFor({ revision: later, runId: 3, runAttempt: 1 })
        .please(),
    },
  });
  observed.use(after.source);
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    landed: {
      kind: "build",
      revision: later,
      selection: "later",
      laterWithoutResult: 1,
      runId: 3,
    },
  });
  expect(observed.reads.endpoints).toBe(2);
  expect(observed.reads.runs).toBeGreaterThan(first.runs);
  expect(after.reads.proofs.map((run) => run.runId)).toEqual([3]);
  const acquired = { ...observed.reads };
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(observed.reads).toEqual(acquired);
});
