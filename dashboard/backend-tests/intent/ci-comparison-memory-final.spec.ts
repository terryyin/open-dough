// Finality is observed through repeated real reads, without any clock or TTL.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiTimingJob } from "../../server/ciTimeWithoutRunnerWaits.ts";
import { start, branch, later } from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  expect,
  test,
  observedComparisonSource,
} from "../support/comparisonMemory.ts";

test("a completed build's timing reason stays final even when jobs later become available", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .please();
  const jobs: Record<string, readonly CiTimingJob[]> = {};
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
    jobs,
  });
  const observed = observedComparisonSource(evidence.source);
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    landed: {
      kind: "build",
      revision: branch,
      timeWithoutRunnerWaits: { reason: "The CI adapter reported no jobs." },
    },
  });
  expect(observed.reads).toEqual({
    endpoints: 1,
    taken: 0,
    context: 1,
    verify: 1,
    runs: 2,
    proofs: 2,
    jobs: 2,
  });
  jobs["2/1"] = [
    makeMe.aCiTimingJob
      .withTiming({ id: "test", durationMs: 120_000, needs: [] })
      .please(),
  ];
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(observed.reads).toEqual({
    endpoints: 1,
    taken: 0,
    context: 1,
    verify: 1,
    runs: 2,
    proofs: 2,
    jobs: 2,
  });
});

test("a final no-build gap remains remembered when a later read could find a build", async ({
  comparisonRead,
}) => {
  const history = makeMe.aRepository
    .withRevision(start)
    .withRevision(branch)
    .withRevision(later)
    .please();
  const done = makeMe.aPublishedStoryEndpoint
    .with({ mode: "trunk", storyStart: start, completion: branch })
    .please();
  // CI has built past the missing push, independently establishing finality.
  // That later revision cannot become a completion ancestor or Landed source.
  const missing = storyCiComparisonEvidence({
    history,
    done,
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: later, databaseId: 3, attempt: 1 })
        .please(),
    ],
  });
  const observed = observedComparisonSource(missing.source);
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    phase: "done",
    baseline: { kind: "none" },
    branch: { kind: "not-applicable" },
    landed: { kind: "none" },
  });
  if (final.kind !== "comparison") throw new Error("Expected a comparison");
  expect(final.landed).not.toHaveProperty("revision");
  expect(JSON.stringify(final.landed)).toContain("No build");
  expect(JSON.stringify(final.landed)).not.toContain(later.slice(0, 7));
  const acquired = { ...observed.reads };
  expect(acquired.endpoints).toBe(1);
  expect(acquired.runs).toBeGreaterThan(0);

  const changed = storyCiComparisonEvidence({
    history,
    done,
    runs: [
      makeMe.aRevisionCiRun
        .with({ headSha: branch, databaseId: 2, attempt: 1 })
        .please(),
    ],
    proofs: {
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
    },
  });
  observed.use(changed.source);
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(observed.reads).toEqual(acquired);
  expect(changed.reads.revisions).toEqual([]);
});
