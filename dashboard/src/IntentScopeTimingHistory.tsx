// Dated execution time through the project or Done endpoint, from local history.
// Its local read and retry leave the story comparison and other Proof intact.

import { useId } from "react";
import { shortSha } from "./baseCiWording.ts";
import { buildDateWords, measuredBuildsWords } from "./ciHistoryWords.ts";
import type { CiScopeHistory } from "./ciScopeHistory.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { IntentScopeTimingHistoryEvidence } from "./IntentScopeTimingHistoryEvidence.tsx";
import { IntentScopeTimingHistoryUnits } from "./IntentScopeTimingHistoryUnits.tsx";
import { useIntentCiScopeHistory } from "./useIntentCiScopeHistory.ts";
import {
  scopeHistoryContextOf,
  scopeHistoryEndpointWords,
  scopeHistorySelectionWords,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import "./intent-ci-history.css";

function CollectedHistory({
  history,
  context,
}: {
  readonly history: CiScopeHistory;
  readonly context: ScopeHistoryContext;
}) {
  const endpoint = scopeHistoryEndpointWords(context).toLowerCase();
  const points = history.entries.filter((entry) =>
    entry.readings.some((reading) => reading.kind === "point"),
  );
  const measuredBuilds = new Set(points.map((entry) => entry.key)).size;
  const dated = [...points].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  );
  const first = dated[0];
  const last = dated.at(-1);
  const unavailable =
    history.availability === "outside-retention"
      ? `The ${endpoint} is outside the retained history.`
      : history.availability === "empty"
        ? "No dashboard-recorded landing history has been collected."
        : history.availability === "uncollected"
          ? `The ${endpoint} has no matching collected observation; earlier retained evidence is shown.`
          : history.availability === "order-unavailable"
            ? `Some retained landing positions could not be verified from local Git evidence. Only the ${scopeHistorySelectionWords(context).toLowerCase()} observation and independently verified preceding history are shown.`
            : undefined;
  return (
    <>
      {unavailable !== undefined && (
        <p className="intent-ci-history-note">{unavailable}</p>
      )}
      <p className="intent-ci-history-extent">
        {measuredBuildsWords(measuredBuilds)}
        {first !== undefined && last !== undefined && (
          <>
            {" "}
            · <time dateTime={first.date}>{buildDateWords(first.date)}</time>–
            <time dateTime={last.date}>{buildDateWords(last.date)}</time>
          </>
        )}
      </p>
      {points.length === 0 && (
        <p className="intent-ci-history-note">
          No complete test execution times are available for this scope.
        </p>
      )}
      <IntentScopeTimingHistoryUnits history={history} context={context} />
      {history.entries.length > 0 && (
        <details className="intent-ci-history-evidence" open>
          <summary>Builds and evidence</summary>
          <ul aria-label="Test execution history evidence">
            {history.entries.map((entry) => (
              <IntentScopeTimingHistoryEvidence
                key={entry.key}
                entry={entry}
                context={context}
              />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export function IntentScopeTimingHistory({ path }: { readonly path: string }) {
  const evidence = useIntentCiEvidence();
  const context = scopeHistoryContextOf(evidence);
  const { shown, failed, retry } = useIntentCiScopeHistory(
    context?.source,
    path,
    context?.endpoint,
  );
  const heading = useId();
  if (context === undefined) return null;
  return (
    <section
      className="intent-ci-history intent-scope-timing-history"
      aria-labelledby={heading}
    >
      <h4 id={heading}>Test execution time history</h4>
      {context.endpoint !== undefined && (
        <p className="intent-ci-history-note">
          {scopeHistoryEndpointWords(context)}{" "}
          {context.kind === "project" && (
            <>
              <code>{context.branch}</code>{" "}
            </>
          )}
          <code>{shortSha(context.endpoint.revision)}</code>.
          {context.kind === "project" && (
            <>
              {" "}
              Trunk observed{" "}
              <time dateTime={context.endpoint.at}>{context.endpoint.at}</time>.
            </>
          )}{" "}
          Observed scope at each build; cumulative test execution time, distinct
          from CI wall time.
        </p>
      )}
      {shown === undefined ? (
        failed === undefined && (
          <p className="intent-ci-history-note">
            {context.endpoint === undefined
              ? (context.reason ??
                "Reading the selected story’s published landing…")
              : "Reading collected test execution times…"}
          </p>
        )
      ) : (
        <CollectedHistory history={shown} context={context} />
      )}
      {failed !== undefined && (
        <p className="intent-ci-history-note" role="alert">
          {failed}{" "}
          <button type="button" onClick={retry}>
            Retry history
          </button>
        </p>
      )}
    </section>
  );
}
