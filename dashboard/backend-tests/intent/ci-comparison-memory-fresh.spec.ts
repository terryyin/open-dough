// Live Taken and running Done evidence cannot be frozen by answer memory.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { start, branch, later } from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  expect,
  test,
  observedComparisonSource,
} from "../support/comparisonMemory.ts";

test("Taken reads the live head afresh even after a completed result", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(later)
    .please();
  const runs = [
    makeMe.aRevisionCiRun
      .with({ headSha: branch, databaseId: 2, attempt: 1 })
      .please(),
    makeMe.aRevisionCiRun
      .with({ headSha: later, databaseId: 3, attempt: 1 })
      .please(),
  ];
  const proofs = {
    2: makeMe.aCiProof
      .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
      .please(),
    3: makeMe.aCiProof
      .summaryFor({ revision: later, runId: 3, runAttempt: 1 })
      .please(),
  };
  const before = storyCiComparisonEvidence({
    history,
    runs,
    proofs,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "trunk", storyStart: start, liveTip: branch })
      .please(),
  });
  const observed = observedComparisonSource(before.source);
  expect(await comparisonRead(observed.source)).toMatchObject({
    phase: "taken",
    provisional: { kind: "build", revision: branch },
  });
  const first = { ...observed.reads };
  const after = storyCiComparisonEvidence({
    history,
    runs,
    proofs,
    taken: makeMe.aTakenStoryEndpoint
      .with({ mode: "trunk", storyStart: start, liveTip: later })
      .please(),
  });
  observed.use(after.source);
  expect(await comparisonRead(observed.source)).toMatchObject({
    phase: "taken",
    provisional: { kind: "build", revision: later },
  });
  expect(observed.reads.endpoints).toBe(2);
  expect(observed.reads.taken).toBe(2);
  expect(observed.reads.runs).toBeGreaterThan(first.runs);
  expect(after.reads.proofs.map((run) => run.runId)).toEqual([3]);
  const second = { ...observed.reads };
  await comparisonRead(observed.source);
  expect(observed.reads.endpoints).toBe(3);
  expect(observed.reads.taken).toBe(3);
  expect(observed.reads.runs).toBeGreaterThan(second.runs);
});

test("a running Done endpoint is reacquired when it finishes, then the completed answer is kept", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const runs = [
    makeMe.aRevisionCiRun
      .with({ headSha: start, databaseId: 1, attempt: 1 })
      .please(),
    makeMe.aRevisionCiRun
      .with({
        headSha: branch,
        databaseId: 2,
        attempt: 1,
        status: "in_progress",
        conclusion: null,
      })
      .please(),
  ];
  const evidence = storyCiComparisonEvidence({
    history,
    runs,
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion: branch })
      .please(),
    proofs: {
      1: makeMe.aCiProof
        .summaryFor({ revision: start, runId: 1, runAttempt: 1 })
        .please(),
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
    },
  });
  const observed = observedComparisonSource(evidence.source);
  expect(await comparisonRead(observed.source)).toMatchObject({
    phase: "done",
    landed: { kind: "running", revision: branch },
  });
  expect(observed.reads.proofs).toBe(1);
  runs[1] = makeMe.aRevisionCiRun
    .with({ headSha: branch, databaseId: 2, attempt: 1 })
    .please();
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({ landed: { kind: "build", revision: branch } });
  expect(observed.reads).toEqual({
    endpoints: 2,
    taken: 0,
    context: 2,
    verify: 2,
    runs: 4,
    proofs: 3,
    jobs: 3,
  });
  const acquired = { ...observed.reads };
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(observed.reads).toEqual(acquired);
});
