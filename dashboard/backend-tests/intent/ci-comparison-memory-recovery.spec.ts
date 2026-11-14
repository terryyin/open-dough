// Transient acquisition failures are retried in the same real read process.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { start, branch } from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  expect,
  test,
  observedComparisonSource,
} from "../support/comparisonMemory.ts";

test("an unavailable whole comparison recovers, then final Done reads acquire nothing", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion: branch })
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
  const observed = observedComparisonSource({
    ...evidence.source,
    publishedEndpoints: () =>
      Promise.resolve({
        kind: "unavailable",
        explanation: "Claim history is unavailable",
      }),
  });
  expect(await comparisonRead(observed.source)).toMatchObject({
    kind: "unavailable",
    explanation: "Claim history is unavailable",
  });
  expect(observed.reads).toEqual({
    endpoints: 1,
    taken: 0,
    context: 0,
    verify: 0,
    runs: 0,
    proofs: 0,
    jobs: 0,
  });

  observed.use(evidence.source);
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    kind: "comparison",
    phase: "done",
    baseline: { kind: "build", revision: start },
    landed: { kind: "build", revision: branch },
  });
  expect(observed.reads).toEqual({
    endpoints: 2,
    taken: 0,
    context: 1,
    verify: 1,
    runs: 2,
    proofs: 2,
    jobs: 2,
  });
  const acquired = { ...observed.reads };
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(observed.reads).toEqual(acquired);
});

test("an unavailable Baseline is listed again, then a recovered answer is remembered", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const evidence = storyCiComparisonEvidence({
    history,
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: start, completion: branch })
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
  let readable = false;
  const observed = observedComparisonSource({
    ...evidence.source,
    buildsFor: () =>
      Promise.resolve({
        builds: {
          ...evidence.builds,
          lookup: {
            ...evidence.builds.lookup,
            listRunsAt(revision) {
              if (!readable && revision === start)
                return Promise.reject(
                  new Error(`GitHub is unreachable: head_sha=${start}`),
                );
              return evidence.builds.lookup.listRunsAt(revision);
            },
          },
        },
      }),
  });
  expect(await comparisonRead(observed.source)).toMatchObject({
    baseline: {
      kind: "unavailable",
      explanation: `GitHub is unreachable: head_sha=${start}`,
    },
    landed: { kind: "build", revision: branch },
  });
  expect(observed.reads).toEqual({
    endpoints: 1,
    taken: 0,
    context: 1,
    verify: 1,
    runs: 2,
    proofs: 1,
    jobs: 1,
  });

  readable = true;
  const recovered = await comparisonRead(observed.source);
  expect(recovered).toMatchObject({
    baseline: { kind: "build", revision: start },
    landed: { kind: "build", revision: branch },
  });
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
  expect(await comparisonRead(observed.source)).toBe(recovered);
  expect(observed.reads).toEqual(acquired);
});
