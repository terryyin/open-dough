import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import { historyAttemptWords } from "./ciHistoryWords.ts";

// " · Run 41 · attempt 1", linked to the run when it has a link; nothing
// when the CI read named no attempt.
export function HistoryRunAttempt({
  run,
}: {
  readonly run: BaseCiRunIdentity & { readonly runUrl?: string | undefined };
}) {
  const words = historyAttemptWords(run);
  if (words === undefined) return null;
  return (
    <>
      {" · "}
      {run.runUrl === undefined ? (
        words
      ) : (
        <a href={run.runUrl} target="_blank" rel="noreferrer">
          {words}
        </a>
      )}
    </>
  );
}
