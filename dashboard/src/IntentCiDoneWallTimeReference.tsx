// A compact reference beside Baseline/Branch/Landed, using the published
// Done endpoint even when its selected measurement is equivalent or later.
import { shortSha } from "./baseCiWording.ts";
import { doneWallTimeAvailabilityWords } from "./ciDoneWallTimeHistory.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import {
  IntentCiPriorBuildReference,
  PriorBuildReferenceEvidence,
} from "./IntentCiPriorBuildReference.tsx";
import { useIntentCiDoneWallTimeHistory } from "./useIntentCiDoneWallTimeHistory.ts";
import "./intent-ci-history.css";

export function IntentCiDoneWallTimeReference() {
  const evidence = useIntentCiEvidence();
  const selected =
    evidence.kind === "comparison" && evidence.phase === "done"
      ? evidence
      : undefined;
  const { shown, failed, retry } = useIntentCiDoneWallTimeHistory(
    selected?.source,
    selected?.doneEndpoint,
    selected?.comparison.checkedAgain,
  );
  if (selected === undefined) return null;
  const unavailable =
    shown === undefined
      ? undefined
      : doneWallTimeAvailabilityWords(shown.availability);
  const later = shown?.entries.some(
    (entry) =>
      entry.kind === "point" &&
      entry.landings.some(
        (landing) =>
          landing.revision === selected.doneEndpoint?.revision &&
          landing.provenance === "later",
      ),
  );
  return (
    <section
      className="intent-ci-history"
      aria-label="Done CI wall time reference"
    >
      <p>
        <strong>CI wall time reference</strong>
      </p>
      <p>
        Current retained evidence for this published Done landing; retention can
        change its prior sample.
      </p>
      {unavailable !== undefined && <p>{unavailable}</p>}
      {later && (
        <p>
          Selected measurement uses a later trunk build and includes later
          changes.
        </p>
      )}
      {shown?.reference === undefined ? (
        <p>
          {selected.doneEndpoint === undefined
            ? selected.doneEndpointReason === undefined
              ? "Reading the selected story’s published landing…"
              : `${selected.doneEndpointReason} No prior-build reference can be established.`
            : `Reading collected CI wall time through ${shortSha(selected.doneEndpoint.revision)}…`}
        </p>
      ) : (
        <>
          <IntentCiPriorBuildReference reference={shown.reference} />
          <details open>
            <summary>Builds and reference evidence</summary>
            <PriorBuildReferenceEvidence
              reference={shown.reference}
              entries={shown.entries}
            />
          </details>
        </>
      )}
      {failed !== undefined && <p role="alert">{failed}</p>}
      {selected.doneEndpoint !== undefined && (
        <button type="button" onClick={retry}>
          {failed === undefined ? "Refresh history" : "Retry history"}
        </button>
      )}
    </section>
  );
}
