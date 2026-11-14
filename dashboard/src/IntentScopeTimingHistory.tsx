// A scope's dated test execution time through the project or Done endpoint,
// from local history, read before the Summary's child table or the file's
// Proof (`./IntentScopeProof.tsx`, `./IntentFileProof.tsx`): a brief status,
// the compact prior-build readout and the shared chart of one measured unit
// (`./IntentScopeTimingHistoryUnits.tsx`), as the Done CI wall time history
// reads (`./IntentCiDoneWallTimeReference.tsx`), in the panel they share
// (`./IntentCiHistoryPanel.tsx`). Its local read keeps the last history of the
// same endpoint beside a failed refresh's alert and short retry, leaving the
// story comparison and other Proof intact.

import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { IntentCiHistoryPanel } from "./IntentCiHistoryPanel.tsx";
import { IntentScopeTimingHistoryUnits } from "./IntentScopeTimingHistoryUnits.tsx";
import { useIntentCiScopeHistory } from "./useIntentCiScopeHistory.ts";
import type { ScopeHistoryGlance } from "./ciScopeHistory.ts";
import {
  scopeHistoryAvailabilityWords,
  scopeHistoryContextOf,
  scopeHistoryReason,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import "./intent-ci-history.css";

// What the history measures, and for the project which trunk observation it
// runs through.
function MeasureNote({ context }: { readonly context: ScopeHistoryContext }) {
  return (
    <p className="intent-ci-history-note">
      {context.kind === "project" && context.endpoint !== undefined && (
        <>
          Trunk <code>{context.branch}</code> observed{" "}
          <time dateTime={context.endpoint.at}>{context.endpoint.at}</time>
          .{" "}
        </>
      )}
      Cumulative test execution time at each build, not CI wall time.
    </p>
  );
}

// The history's brief status: why it is not simply retained at the endpoint,
// or, with no declared unit to chart, why the endpoint's build has no timing.
function statusWords(
  history: ScopeHistoryGlance,
  context: ScopeHistoryContext,
) {
  const selected = history.entries.find((entry) => entry.selected);
  const unread =
    history.entries.every((entry) => entry.readings.length === 0) &&
    selected?.kind === "gap" &&
    selected.gap !== undefined
      ? scopeHistoryReason(context, selected.gap.reason)
      : undefined;
  return scopeHistoryAvailabilityWords(context, history.availability) ?? unread;
}

function waitingWords(context: ScopeHistoryContext) {
  return context.endpoint === undefined
    ? (context.reason ?? "Reading the selected story’s published landing…")
    : "Reading collected test execution times…";
}

export function IntentScopeTimingHistory({
  path,
  file = false,
}: {
  readonly path: string;
  // Whether the scope is one test file rather than an entry or folder.
  readonly file?: boolean;
}) {
  const evidence = useIntentCiEvidence();
  const context = scopeHistoryContextOf(evidence);
  const { shown, failed, retry, reading, previouslyRetrieved, answeredAt } =
    useIntentCiScopeHistory(
      context?.source,
      path,
      context?.endpoint,
      context?.kind === "project" ? context.checkedAgain : undefined,
    );
  if (context === undefined) return null;
  return (
    <IntentCiHistoryPanel
      title="Test execution time history"
      status={shown === undefined ? undefined : statusWords(shown, context)}
      failed={failed}
      retry={retry}
    >
      <MeasureNote context={context} />
      {shown === undefined ? (
        failed === undefined && (
          <p className="intent-ci-history-note">{waitingWords(context)}</p>
        )
      ) : (
        <IntentScopeTimingHistoryUnits
          history={shown}
          context={context}
          file={file}
        />
      )}
      {shown !== undefined && answeredAt !== undefined && (
        <p className="intent-ci-history-note">
          {previouslyRetrieved
            ? "Previously retrieved history"
            : "History read"}{" "}
          <time dateTime={answeredAt}>{answeredAt}</time>.
          {reading === true && " Checking collected evidence again…"}
        </p>
      )}
    </IntentCiHistoryPanel>
  );
}
