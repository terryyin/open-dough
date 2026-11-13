// Membership, dates, values and exclusion reasons have one presentation for
// both measures, after the selection rule they follow. Their owners supply the
// distinct retained build provenance.
import type { ReactNode } from "react";
import { buildDateWords } from "./ciHistoryWords.ts";
import { executionTimeWords, wholeSecondWords } from "./ciProofTimeWords.ts";
import type { PriorBuildEvidence } from "./ciPriorBuildReference.ts";

export function PriorBuildReferenceEvidenceList({
  evidence,
  precise = false,
  details,
  selectedLabel = "Selected",
  reasonWords = (reason: string) => reason,
  medianMs,
}: {
  readonly evidence: readonly PriorBuildEvidence[];
  readonly medianMs: number | undefined;
  readonly precise?: boolean;
  readonly details: (sample: PriorBuildEvidence) => ReactNode;
  readonly selectedLabel?: string;
  readonly reasonWords?: (reason: string) => string;
}) {
  const durationWords = precise ? executionTimeWords : wholeSecondWords;
  return (
    <>
      <p>
        Median{" "}
        {medianMs === undefined ? "unavailable" : durationWords(medianMs)};
        exclude values strictly more than 15% above that median, once. Complete
        fast values and measured zeros stay eligible.
      </p>
      <p>
        These initial calibration choices are a reference for normal timing, not
        a statistical confidence interval or slowdown judgment. The retained
        window holds 20 measured builds total; excluded samples are not
        replaced.
      </p>
      <div
        role="group"
        aria-label="Prior-build reference evidence"
        className="intent-ci-reference-evidence"
      >
        {evidence.map((sample) => (
          <p key={sample.key}>
            {sample.status === "included"
              ? "✓ Included"
              : sample.status === "selected"
                ? `◆ ${selectedLabel}`
                : "× Excluded"}
            {" · "}
            <time dateTime={sample.date}>{buildDateWords(sample.date)}</time>
            {sample.ms === undefined ? "" : ` · ${durationWords(sample.ms)}`}
            {sample.reason === undefined
              ? ""
              : ` · ${reasonWords(sample.reason)}`}
            {details(sample)}
          </p>
        ))}
      </div>
    </>
  );
}
