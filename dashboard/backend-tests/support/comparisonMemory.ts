// Repeated real reads in one process, with isolated answer memory. The
// observed source counts only external operations; comparison rules stay real.
import { expect, test as base } from "../../tests/support/pageTest.ts";
import { clearCiComparisonAnswers } from "../../server/intentCiComparisonAnswers.ts";
import { performIntentCiComparisonRead } from "../../server/intentCiComparisonRead.ts";
import type { StoryCiComparisonSource } from "../../server/storyCiComparisonSource.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { comparisonProject } from "./comparisonRead.ts";

export { expect };
export const test = base.extend<{
  comparisonRead: (
    evidence: StoryCiComparisonSource,
  ) => Promise<StoryCiComparisonAnswer>;
}>({
  // eslint-disable-next-line no-empty-pattern
  comparisonRead: async ({}, use) => {
    clearCiComparisonAnswers();
    try {
      await use(async (evidence) => {
        const outcome = await performIntentCiComparisonRead(
          comparisonProject,
          { kind: "intent-ci-comparison", identity: "SEED-1#story" },
          new AbortController().signal,
          evidence,
        );
        expect(outcome.kind).toBe("answered");
        if (outcome.kind !== "answered") throw new Error("No comparison");
        return outcome.answer as StoryCiComparisonAnswer;
      });
    } finally {
      clearCiComparisonAnswers();
    }
  },
});

export function observedComparisonSource(initial: StoryCiComparisonSource) {
  let current = initial;
  const reads = {
    endpoints: 0,
    taken: 0,
    context: 0,
    verify: 0,
    runs: 0,
    proofs: 0,
    jobs: 0,
  };
  const localReads = { receipts: 0, observationClock: 0 };
  const source: StoryCiComparisonSource = {
    get project() {
      return current.project;
    },
    landingReceipts() {
      localReads.receipts += 1;
      return current.landingReceipts();
    },
    observationNow() {
      localReads.observationClock += 1;
      return current.observationNow();
    },
    publishedEndpoints(identity) {
      reads.endpoints += 1;
      return current.publishedEndpoints(identity);
    },
    takenEndpoints(identity) {
      reads.taken += 1;
      return current.takenEndpoints(identity);
    },
    async buildsFor(branch) {
      reads.context += 1;
      const context = await current.buildsFor(branch);
      if (!("builds" in context)) return context;
      const { builds } = context;
      return {
        builds: {
          ...builds,
          lookup: {
            ...builds.lookup,
            listRunsAt(revision) {
              reads.runs += 1;
              return builds.lookup.listRunsAt(revision);
            },
            timeWithoutRunnerWaitsOf(build) {
              reads.jobs += 1;
              return builds.lookup.timeWithoutRunnerWaitsOf(build);
            },
          },
          proofOf(run) {
            reads.proofs += 1;
            return builds.proofOf(run);
          },
        },
      };
    },
    verifyRevision(revision) {
      reads.verify += 1;
      return current.verifyRevision(revision);
    },
    get trunkHead() {
      return current.trunkHead;
    },
  };
  return {
    source,
    reads,
    localReads,
    use(next: StoryCiComparisonSource) {
      current = next;
    },
  };
}

export const comparisonAcquisitions = (
  observed: ReturnType<typeof observedComparisonSource>,
) => ({ reads: { ...observed.reads }, local: { ...observed.localReads } });
