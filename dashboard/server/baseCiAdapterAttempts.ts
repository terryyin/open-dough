// Adapter attempts for the dashboard's CI status and story comparison reads.
import { createCommandAcquisition } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { type ListedRun, unread } from "./baseCiNearest.ts";
import { ciAdapterTimeoutMs } from "./ciAdapterTimeout.ts";

// One ciAdapter attempt discover answered: its `runId` and `attemptId` as
// `databaseId` and `attempt`, and the check and context the adapter named.
// Judgment maps retained newest-per-check attempts; ambiguity counts over
// every answered attempt at the revision.
type DiscoveredAttempt = Omit<ListedRun, "databaseId" | "attempt"> & {
  readonly databaseId: string | number;
  readonly attempt: string | number;
  readonly check?: string;
  readonly context?: string;
};

export type AdapterRun = ListedRun &
  Pick<DiscoveredAttempt, "check" | "context">;

// The same attempt may be discovered for both the configured ref and a story
// branch; another attempt differs in run, attempt, check or context.
const attemptKey = (run: DiscoveredAttempt) =>
  JSON.stringify([run.databaseId, run.attempt, run.check, run.context]);
const atRevisionKey = (run: DiscoveredAttempt) =>
  JSON.stringify([String(run.attempt), run.headSha?.toLowerCase()]);

// A ciAdapter's attempts name no GitHub Actions run: their identity moves to
// `adapterAttempt`, so a numeric adapter identity is never read as a run,
// with whether another attempt discover answered (in `answered`, or
// `retained` when omitted) names the same `attemptId` (in its text form) at
// that revision — counted before newest-per-check retention.
function asAdapterAttempts(
  retained: readonly DiscoveredAttempt[],
  answered: readonly DiscoveredAttempt[],
): AdapterRun[] {
  const attempts = new Map<string, Set<string>>();
  for (const run of answered) {
    const key = atRevisionKey(run);
    attempts.set(key, (attempts.get(key) ?? new Set()).add(attemptKey(run)));
  }
  return retained.map((discovered) => {
    const { databaseId, attempt, ...run } = discovered;
    const shared = attempts.get(atRevisionKey(discovered))?.size ?? 0;
    return {
      ...run,
      adapterAttempt: {
        runId: databaseId,
        attemptId: attempt,
        ...(shared > 1 ? { ambiguous: true as const } : {}),
      },
    };
  });
}

// Ask both branches concurrently and stop the other request if either fails.
// Keep the target first so ties prefer the story branch's listing. Comparison
// can use any discovered attempt at an exact SHA, while CI status keeps the
// adapter's normal target filter. Proof uses the branch whose listing we read.
export async function discoverAdapterAttempts(
  source: PublishedSource,
  branch: string,
  root: string,
  command: readonly string[],
  signal: AbortSignal,
  { comparison = false } = {},
): Promise<AdapterRun[]> {
  const branches = branch === source.ref ? [branch] : [source.ref, branch];
  const ended = new AbortController();
  const asked = AbortSignal.any([signal, ended.signal]);
  const listed = await Promise.all(
    branches.map(async (listedBranch) => {
      const acquisition = createCommandAcquisition({
        command,
        repo: source.repository,
        branch: listedBranch,
        root,
        includeOtherBranches: comparison,
        timeoutMs: ciAdapterTimeoutMs(),
      });
      try {
        await acquisition.acquireRuns(asked);
      } catch (error) {
        ended.abort();
        throw error;
      }
      const fromListing = (run: DiscoveredAttempt) => ({
        ...run,
        branch: listedBranch,
      });
      const answered = (
        (await acquisition.discoverAnsweredAttempts()) as DiscoveredAttempt[]
      ).map(fromListing);
      const retained = comparison
        ? answered
        : (
            (await acquisition.discoverAncestorCandidates()) as DiscoveredAttempt[]
          ).map(fromListing);
      return { retained, answered };
    }),
  );
  return asAdapterAttempts(
    listed.flatMap(({ retained }) => retained),
    listed.flatMap(({ answered }) => answered),
  );
}

export function adapterDiscoveryUnread(error: unknown) {
  return unread(
    error instanceof Error
      ? error.message
      : "The command-adapter discover could not be read",
  );
}
