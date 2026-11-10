import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import { observedAttemptUrl } from "./ciRunAttemptUrl.ts";
import { historyAttemptWords } from "./ciHistoryWords.ts";

// " · Run 41 · attempt 1", linked to the run when it has a link; nothing
// when the CI read named no attempt.
export function HistoryRunAttempt({
  run,
}: {
  readonly run: BaseCiRunIdentity & { readonly runUrl?: string | undefined };
}) {
  const words = historyAttemptWords(run);
  const runUrl = observedAttemptUrl(run);
  if (words === undefined) return null;
  return (
    <>
      {" · "}
      {runUrl === undefined ? (
        words
      ) : (
        <a href={runUrl} target="_blank" rel="noreferrer">
          {words}
        </a>
      )}
    </>
  );
}
