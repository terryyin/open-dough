// The compact prior-build readout every timing history shares: the selected
// timing or its status, the prior-build average and how many builds it used,
// then the signed elapsed and percentage change in the faster/slower cue
// colour, the sign carrying the direction in either appearance. Without a
// usable selected timing or average, no change is shown. The membership
// behind it stays readable where a view keeps its evidence list.
import { shortSha } from "./baseCiWording.ts";
import {
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
import { reasonStatus } from "./ciHistoryChart.ts";
import type {
  PriorBuildFigures,
  PriorBuildReference,
} from "./ciPriorBuildReference.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { evidenceOfEntry } from "./landedCiBuildKey.ts";
import type { MeasuredEntry } from "./landedCiHistory.ts";
import { PriorBuildReferenceEvidenceList } from "./PriorBuildReferenceEvidenceList.tsx";
import { relativeDirectionOf } from "./storyCiRelativeChange.ts";
import "./intent-ci-cues.css";
import "./intent-ci-history.css";

type Difference = NonNullable<PriorBuildFigures["difference"]>;

// "+17 s (+17%)", or with a zero average "+1.2 s (percentage unavailable:
// average is zero)".
function changeWords(difference: Difference, precise: boolean) {
  const elapsed =
    precise || difference.changeMs % 1000 !== 0
      ? difference.text
      : wholeSecondDifferenceWords(difference.changeMs);
  return `${elapsed} (${
    difference.relative === undefined
      ? "percentage unavailable: average is zero"
      : relativePercentWords(difference.relative)
  })`;
}

export function IntentCiPriorBuildReference({
  reference,
  precise = false,
  unavailableReason,
  endpointLabel = "Selected landing",
  selectedNote,
  reasonWords = (reason: string) => reason,
}: {
  readonly reference: PriorBuildFigures;
  readonly precise?: boolean;
  readonly unavailableReason?: string | undefined;
  readonly endpointLabel?: string;
  // How the selected measurement stands for the endpoint, when not its own.
  readonly selectedNote?: string | undefined;
  readonly reasonWords?: (reason: string) => string;
}) {
  const { averageMs, selected, difference, sampleCount } = reference;
  const durationWords = precise ? executionTimeWords : wholeSecondWords;
  const reason = selected?.reason;
  const selectedWords =
    selected?.ms !== undefined && reason === undefined
      ? durationWords(selected.ms)
      : reasonStatus(reason, reasonWords).words;
  const direction =
    difference === undefined
      ? undefined
      : relativeDirectionOf(difference.relative ?? difference.changeMs);
  return (
    <div className="intent-ci-prior-reference">
      <p>
        {endpointLabel} <code>{shortSha(reference.endpoint)}</code>
        {" · "}
        <strong>{selectedWords}</strong>
        {selectedNote === undefined ? "" : ` · ${selectedNote}`}
      </p>
      <p>
        Prior-build average{" · "}
        <strong>
          {averageMs === undefined
            ? unavailableReason === undefined
              ? "Insufficient history"
              : reasonWords(unavailableReason)
            : durationWords(averageMs)}
        </strong>
        {` · ${String(sampleCount)} prior build${sampleCount === 1 ? "" : "s"} used`}
      </p>
      {difference !== undefined && (
        <p className="intent-ci-prior-change" data-direction={direction}>
          vs. prior average{" · "}
          <strong>{changeWords(difference, precise)}</strong>
        </p>
      )}
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
      medianMs={reference.medianMs}
      details={(sample) => {
        const entry = entries.find(
          (entry) => evidenceOfEntry(entry, [sample]) !== undefined,
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
