// Compact metrics and inspectable membership beside the unchanged observed
// history. The linked raw evidence remains readable with no reference.
import { shortSha } from "./baseCiWording.ts";
import {
  buildDateWords,
  landingWords,
  plainWords,
  pointLandingsWords,
  standsForWords,
} from "./ciHistoryWords.ts";
import {
  wholeSecondWords,
  wholeSecondDifferenceWords,
  relativePercentWords,
  executionTimeWords,
} from "./ciProofTimeWords.ts";
import type { PriorBuildReference } from "./ciPriorBuildReference.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { buildKeyOf } from "./landedCiBuildKey.ts";
import type { MeasuredEntry } from "./landedCiHistory.ts";
import { PriorBuildReferenceEvidenceList } from "./PriorBuildReferenceEvidenceList.tsx";

export function IntentCiPriorBuildReference({
  reference,
  precise = false,
  unavailableReason,
}: {
  readonly reference: PriorBuildReference;
  readonly precise?: boolean;
  readonly unavailableReason?: string | undefined;
}) {
  const { averageMs, selected, difference, from, to } = reference;
  const durationWords = precise ? executionTimeWords : wholeSecondWords;
  return (
    <div className="intent-ci-prior-reference">
      <p>
        <strong>Prior-build average</strong>
        {" · "}
        {averageMs === undefined
          ? (unavailableReason ??
            "Insufficient comparable history: at least 5 prior builds are required after filtering")
          : durationWords(averageMs)}
      </p>
      <p>
        Selected landing <code>{shortSha(reference.endpoint)}</code>
        {" · "}
        {selected?.ms === undefined
          ? (selected?.reason ?? "Selected measurement unavailable")
          : durationWords(selected.ms)}
      </p>
      <p>
        {difference === undefined
          ? `Difference unavailable: ${
              averageMs === undefined
                ? (unavailableReason ?? "insufficient comparable history")
                : (selected?.reason ?? "selected measurement unavailable")
            }`
          : `${precise ? difference.text : difference.changeMs % 1000 === 0 ? wholeSecondDifferenceWords(difference.changeMs) : difference.text} (${
              difference.relative === undefined
                ? "percentage unavailable: average is zero"
                : relativePercentWords(difference.relative)
            })`}
      </p>
      <p>
        {reference.sampleCount} prior builds used
        {from === undefined
          ? ""
          : ` · ${buildDateWords(from)}${to === undefined || buildDateWords(to) === buildDateWords(from) ? "" : `–${buildDateWords(to)}`}`}
      </p>
      <p>
        Median{" "}
        {reference.medianMs === undefined
          ? "unavailable"
          : durationWords(reference.medianMs)}
        ; exclude values strictly more than 15% above that median, once.
        Complete fast values and measured zeros stay eligible.
      </p>
      <p>
        These initial calibration choices are a reference for normal timing, not
        a statistical confidence interval or slowdown judgment. The retained
        window holds 20 measured builds total; excluded samples are not
        replaced.
      </p>
    </div>
  );
}

export function PriorBuildReferenceEvidence({
  reference,
  entries,
}: {
  readonly reference: PriorBuildReference;
  readonly entries: readonly MeasuredEntry[];
}) {
  return (
    <PriorBuildReferenceEvidenceList
      evidence={reference.evidence}
      details={(sample) => {
        const entry = entries.find((entry) =>
          entry.kind === "point"
            ? buildKeyOf(entry) === sample.key
            : sample.key === `landing/${entry.revision}` ||
              (entry.reason !== "pending" &&
                entry.build !== undefined &&
                buildKeyOf(entry.build) === sample.key),
        );
        const build =
          entry?.kind === "point"
            ? entry
            : entry?.reason === "pending"
              ? entry
              : entry?.build;
        const provenance =
          entry === undefined
            ? ""
            : entry.kind === "point"
              ? plainWords(pointLandingsWords(entry))
              : entry.reason !== "pending" && entry.build !== undefined
                ? plainWords(
                    standsForWords(
                      entry.build.provenance,
                      entry.build.revision,
                      [entry],
                    ),
                  )
                : `landed revision ${plainWords(landingWords(entry))}`;
        return (
          <>
            {` · ${provenance}`}
            {build !== undefined && <HistoryRunAttempt run={build} />}
          </>
        );
      }}
    />
  );
}
