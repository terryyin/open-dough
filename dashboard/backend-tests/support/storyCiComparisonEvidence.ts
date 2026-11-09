// External evidence for the real comparison read. Domain arrangement belongs
// to MakeMe; this harness only answers history/provider/artifact operations.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { repositoryHistoryReads } from "../../../tests/support/repositoryHistoryReads.mjs";
import type { RepositoryDescription } from "../../../tests/support/repositoryTestData.mjs";
import type { CiProof, CiProofRun } from "../../src/ciProof.ts";
import type { ListedRun } from "../../server/baseCiNearest.ts";
import type { ComparisonBuildSource } from "../../server/comparisonBuildSource.ts";
import {
  timeWithoutAdapterRunnerWaits,
  type CiTimingJob,
} from "../../server/ciTimeWithoutRunnerWaits.ts";
import type { StoryCiComparisonSource } from "../../server/storyCiComparisonSource.ts";
import type { PublishedStoryEndpointFacts } from "../../server/storyPublishedEndpoints.ts";
import type { TakenStoryEndpointFacts } from "../../server/takenStoryEndpoints.ts";

export function storyCiComparisonEvidence({
  history,
  done,
  taken,
  runs,
  proofs = {},
  jobs = {},
  preferCompletedAncestor,
}: {
  readonly history: RepositoryDescription;
  readonly done?: PublishedStoryEndpointFacts;
  readonly taken?: TakenStoryEndpointFacts;
  readonly runs: readonly ListedRun[];
  readonly proofs?: Readonly<Record<number, CiProof>>;
  readonly jobs?: Readonly<Record<string, readonly CiTimingJob[]>>;
  readonly preferCompletedAncestor?: true;
}) {
  const repository = repositoryHistoryReads(history);
  const reads = {
    revisions: [] as string[],
    proofs: [] as CiProofRun[],
    jobs: [] as string[],
    verified: [] as string[],
    branches: [] as (string | undefined)[],
  };
  const builds: ComparisonBuildSource = {
    history: repository.history,
    workflow: "ci.yml",
    lookup: {
      listRunsAt: (revision) => {
        reads.revisions.push(revision);
        return Promise.resolve(runs.filter((run) => run.headSha === revision));
      },
      subjectOf: repository.subjectOf,
      ...(preferCompletedAncestor === undefined
        ? {}
        : { preferCompletedAncestor }),
      timeWithoutRunnerWaitsOf(build) {
        const key =
          build.adapterAttempt === undefined
            ? `${String(build.runId)}/${String(build.runAttempt)}`
            : `${String(build.adapterAttempt.runId)}/${String(build.adapterAttempt.attemptId)}`;
        reads.jobs.push(key);
        return Promise.resolve(timeWithoutAdapterRunnerWaits(jobs[key] ?? []));
      },
    },
    proofOf(run) {
      reads.proofs.push(run);
      return Promise.resolve(
        proofs[run.runId] ?? makeMe.aCiProof.unavailable("none").please(),
      );
    },
  };
  const source: StoryCiComparisonSource = {
    publishedEndpoints: () =>
      Promise.resolve(
        done === undefined
          ? { kind: "absent" }
          : { kind: "facts", facts: done },
      ),
    takenEndpoints: () =>
      Promise.resolve(
        taken === undefined
          ? { kind: "absent" }
          : { kind: "facts", facts: taken },
      ),
    buildsFor: (branch) => {
      reads.branches.push(branch);
      return Promise.resolve({ builds });
    },
    verifyRevision: async (revision) => {
      reads.verified.push(revision);
      await repository.verifyRevision(revision);
    },
    trunkHead: history.revisions.at(-1)?.name ?? "",
  };
  return { source, builds, reads };
}
