import { readCommandJobs } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempt.mjs";
import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import { shortSha } from "../src/baseCiWording.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  discoverAdapterAttempts,
  type AdapterRun,
} from "./baseCiAdapterAttempts.ts";
import { newestRunFor } from "./baseCiNearest.ts";
import { revisionSubject } from "./baseCiRevisionGit.ts";
import { isBuildConclusion } from "./baseCiRevisionAttempt.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import { ciAdapterFailureOf } from "./ciAdapterFailure.ts";
import {
  ciAdapterTimeoutMs,
  comparisonDeadlineExpired,
} from "./ciAdapterTimeout.ts";
import { timeWithoutAdapterRunnerWaits } from "./ciTimeWithoutRunnerWaits.ts";
import type { GitCall } from "./gitRunner.ts";

export async function adapterRevisionLookup(
  source: PublishedSource,
  storyBranch: string | undefined,
  root: string,
  command: readonly string[],
  call: GitCall,
  signal: AbortSignal,
): Promise<RevisionCiLookup> {
  const branch =
    storyBranch !== undefined && isSafeBranchName(storyBranch)
      ? storyBranch
      : source.ref;
  const runs = await discoverAdapterAttempts(
    source,
    branch,
    root,
    command,
    signal,
    { comparison: true },
  );
  const runsByRevision = new Map<string, AdapterRun[]>();
  for (const run of runs) {
    if (run.headSha === undefined) continue;
    const headSha = run.headSha.toLowerCase();
    const normalized = { ...run, headSha };
    const atRevision = runsByRevision.get(headSha);
    if (atRevision === undefined) runsByRevision.set(headSha, [normalized]);
    else atRevision.push(normalized);
  }
  return {
    attemptOf({ revision, adapterAttempt }) {
      if (adapterAttempt === undefined || adapterAttempt.ambiguous === true)
        return Promise.resolve(undefined);
      return Promise.resolve(
        runsByRevision
          .get(revision)
          ?.find(
            (run) =>
              run.adapterAttempt?.ambiguous !== true &&
              String(run.adapterAttempt?.runId) ===
                String(adapterAttempt.runId) &&
              String(run.adapterAttempt?.attemptId) ===
                String(adapterAttempt.attemptId),
          ),
      );
    },
    listRunsAt(sha) {
      const atRevision = runsByRevision.get(sha) ?? [];
      const latest = newestRunFor(atRevision, sha);
      if (latest === undefined) return Promise.resolve([]);
      if (latest.conclusion !== "cancelled") return Promise.resolve([latest]);
      // Incomplete attempts have no verdict. Only a completed attempt of
      // this same check and context can supply the revision's result.
      const earlier = atRevision.filter(
        (run) =>
          run.check === latest.check &&
          run.context === latest.context &&
          isBuildConclusion(run.conclusion),
      );
      return Promise.resolve([newestRunFor(earlier, sha) ?? latest]);
    },
    preferCompletedAncestor: true,
    subjectOf: (sha) => revisionSubject(sha, call),
    async timeWithoutRunnerWaitsOf({ adapterAttempt, revision, runBranch }) {
      if (adapterAttempt === undefined || runBranch === undefined)
        return { reason: "The CI adapter did not identify the attempt." };
      const attemptId = String(adapterAttempt.attemptId);
      if (adapterAttempt.ambiguous === true)
        return {
          reason: `The CI adapter listed another discovered attempt as attempt ${attemptId} at ${shortSha(revision)}.`,
        };
      const timeoutMs = ciAdapterTimeoutMs();
      let answer: Awaited<ReturnType<typeof readCommandJobs>>;
      try {
        answer = await readCommandJobs(
          command,
          { repo: source.repository, branch: runBranch },
          { runId: String(adapterAttempt.runId), attemptId, sha: revision },
          { signal, cwd: root, timeoutMs },
        );
      } catch (error) {
        if (comparisonDeadlineExpired(signal))
          return {
            reason:
              "The CI adapter did not answer the job graph read before the comparison deadline.",
          };
        signal.throwIfAborted();
        return {
          reason: `The CI adapter answered no job graph: ${ciAdapterFailureOf(error, timeoutMs)}.`,
        };
      }
      return answer.jobs === undefined
        ? { reason: `The CI adapter gave no job graph: ${answer.unavailable}` }
        : timeWithoutAdapterRunnerWaits(answer.jobs);
    },
  };
}
