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
} from "./ciProofTimeWords.ts";
import type { PriorBuildReference } from "./ciPriorBuildReference.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { buildKeyOf } from "./landedCiBuildKey.ts";
import type { MeasuredEntry } from "./landedCiHistory.ts";

export function IntentCiPriorBuildReference({
  reference,
}: {
  readonly reference: PriorBuildReference;
}) {
  const { averageMs, selected, difference, from, to } = reference;
  return (
    <div className="intent-ci-prior-reference">
      <p>
        <strong>Prior-build average</strong>
        {" · "}
        {averageMs === undefined
          ? "Insufficient comparable history: at least 5 prior builds are required after filtering"
          : wholeSecondWords(averageMs)}
      </p>
      <p>
        Selected landing <code>{shortSha(reference.endpoint)}</code>
        {" · "}
        {selected?.ms === undefined
          ? (selected?.reason ?? "Selected measurement unavailable")
          : wholeSecondWords(selected.ms)}
      </p>
      <p>
        {difference === undefined
          ? `Difference unavailable: ${
              averageMs === undefined
                ? "insufficient comparable history"
                : (selected?.reason ?? "selected measurement unavailable")
            }`
          : `${difference.changeMs % 1000 === 0 ? wholeSecondDifferenceWords(difference.changeMs) : difference.text} (${
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
          : wholeSecondWords(reference.medianMs)}
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
    <div
      role="group"
      aria-label="Prior-build reference evidence"
      className="intent-ci-reference-evidence"
    >
      {reference.evidence.map((sample) => {
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
        const label =
          sample.status === "included"
            ? "✓ Included"
            : sample.status === "selected"
              ? "◆ Selected"
              : "× Excluded";
        return (
          <p key={sample.key}>
            {label}
            {" · "}
            <time dateTime={sample.date}>{buildDateWords(sample.date)}</time>
            {sample.ms === undefined ? "" : ` · ${wholeSecondWords(sample.ms)}`}
            {sample.reason === undefined ? "" : ` · ${sample.reason}`}
            {` · ${provenance}`}
            {build !== undefined && <HistoryRunAttempt run={build} />}
          </p>
        );
      })}
    </div>
  );
}
