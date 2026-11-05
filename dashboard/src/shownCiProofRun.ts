// The attempt whose CI proof Intent's homepage shows for a judgment: a
// running result's completed ancestor, otherwise the judged result;
// undefined when it names neither a GitHub Actions run nor a ciAdapter
// attempt. Carries that attempt's optional wall-time bounds.
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import { attemptTimesOf } from "./baseCiConfirmation.ts";
import type { CiProofSubject } from "./ciProof.ts";

export type ShownCiProofRun = CiProofSubject & {
  readonly runUrl: string | undefined;
  readonly ambiguous?: true;
  readonly startedAt?: string;
  readonly completedAt?: string;
};

export function shownRunOf(judgment: Judgment): ShownCiProofRun | undefined {
  const shown =
    judgment.state === "running" ? judgment.completedAncestor : judgment;
  if (shown === undefined) return undefined;
  const { adapterAttempt } = shown;
  if (adapterAttempt !== undefined)
    return shown.runBranch === undefined
      ? undefined
      : {
          runId: String(adapterAttempt.runId),
          attemptId: String(adapterAttempt.attemptId),
          branch: shown.runBranch,
          revision: shown.revision,
          runUrl: shown.runUrl,
          ...(adapterAttempt.ambiguous === true
            ? { ambiguous: true as const }
            : {}),
          ...attemptTimesOf(shown),
        };
  if (shown.runId === undefined || shown.runAttempt === undefined)
    return undefined;
  return {
    runId: shown.runId,
    runAttempt: shown.runAttempt,
    revision: shown.revision,
    runUrl: shown.runUrl,
    ...attemptTimesOf(shown),
  };
}
