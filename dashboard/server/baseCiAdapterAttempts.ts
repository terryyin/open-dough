// A ciAdapter's discovered attempts as the CI status judgment
// (`./baseCiJudgment.ts`) judges them: their identity kept apart from a
// GitHub Actions run's (`./baseCiNearest.ts`).
import type { ListedRun } from "./baseCiNearest.ts";

// One discovered ciAdapter attempt, as the acquisition retains it: its
// `runId` and `attemptId` as `databaseId` and `attempt`, and the check and
// context the adapter named.
export type DiscoveredAttempt = Omit<ListedRun, "databaseId" | "attempt"> & {
  readonly databaseId: string | number;
  readonly attempt: string | number;
  readonly check?: string;
  readonly context?: string;
};

// The same attempt may be discovered for both the configured ref and a story
// branch; another attempt differs in run, attempt, check or context.
const attemptKey = (run: DiscoveredAttempt) =>
  JSON.stringify([run.databaseId, run.attempt, run.check, run.context]);
const atRevisionKey = (run: DiscoveredAttempt) =>
  JSON.stringify([String(run.attempt), run.headSha?.toLowerCase()]);

// A ciAdapter's attempts name no GitHub Actions run: their identity moves to
// `adapterAttempt`, so a numeric adapter identity is never read as a run,
// with whether another discovered attempt names the same `attemptId` (in its
// text form) at that revision.
export function asAdapterAttempts(
  runs: readonly DiscoveredAttempt[],
): ListedRun[] {
  const attempts = new Map<string, Set<string>>();
  for (const run of runs) {
    const key = atRevisionKey(run);
    attempts.set(key, (attempts.get(key) ?? new Set()).add(attemptKey(run)));
  }
  return runs.map((discovered) => {
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
