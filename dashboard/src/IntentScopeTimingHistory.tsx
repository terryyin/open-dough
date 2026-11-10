// Dated execution time of the selected Done scope, from the collected history.
// Its local read and retry leave the story comparison and other Proof intact.

import { useId } from "react";
import { shortSha } from "./baseCiWording.ts";
import { buildDateWords, measuredBuildsWords } from "./ciHistoryWords.ts";
import type { CiScopeHistory } from "./ciScopeHistory.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { IntentScopeTimingHistoryEvidence } from "./IntentScopeTimingHistoryEvidence.tsx";
import { IntentScopeTimingHistoryUnits } from "./IntentScopeTimingHistoryUnits.tsx";
import { useIntentCiScopeHistory } from "./useIntentCiScopeHistory.ts";
import "./intent-ci-history.css";

function CollectedHistory({ history }: { readonly history: CiScopeHistory }) {
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
      ? "The selected landing is outside the retained history."
      : history.availability === "empty"
        ? "No dashboard-recorded landing history has been collected."
        : history.availability === "uncollected"
          ? "The selected landing has no matching collected observation; earlier retained evidence is shown."
          : history.availability === "order-unavailable"
            ? "Some retained landing positions could not be verified from local Git evidence. Only the selected observation and independently verified preceding history are shown."
            : undefined;
  return (
    <>
      <p className="intent-ci-history-note">
        Selected landing <code>{shortSha(history.selectedRevision)}</code>.
        Observed scope at each build; cumulative test execution time, distinct
        from CI wall time.
      </p>
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
      <IntentScopeTimingHistoryUnits history={history} />
      {history.entries.length > 0 && (
        <details className="intent-ci-history-evidence" open>
          <summary>Builds and evidence</summary>
          <ul aria-label="Test execution history evidence">
            {history.entries.map((entry) => (
              <IntentScopeTimingHistoryEvidence key={entry.key} entry={entry} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export function IntentScopeTimingHistory({ path }: { readonly path: string }) {
  const evidence = useIntentCiEvidence();
  const selected =
    evidence.kind === "comparison" && evidence.phase === "done"
      ? evidence
      : undefined;
  const { shown, failed, retry } = useIntentCiScopeHistory(
    selected?.source,
    path,
    selected?.doneEndpoint,
  );
  const heading = useId();
  if (selected === undefined) return null;
  return (
    <section
      className="intent-ci-history intent-scope-timing-history"
      aria-labelledby={heading}
    >
      <h4 id={heading}>Test execution time history</h4>
      {shown === undefined ? (
        failed === undefined && (
          <p className="intent-ci-history-note">
            {selected.doneEndpoint === undefined
              ? (selected.doneEndpointReason ??
                "Reading the selected story’s published landing…")
              : "Reading collected test execution times…"}
          </p>
        )
      ) : (
        <CollectedHistory history={shown} />
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
