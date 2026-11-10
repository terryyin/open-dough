// Membership, dates, values and exclusion reasons have one presentation for
// both measures. Their owners supply the distinct retained build provenance.
import type { ReactNode } from "react";
import { buildDateWords } from "./ciHistoryWords.ts";
import { executionTimeWords, wholeSecondWords } from "./ciProofTimeWords.ts";
import type { PriorBuildEvidence } from "./ciPriorBuildReference.ts";

export function PriorBuildReferenceEvidenceList({
  evidence,
  precise = false,
  details,
}: {
  readonly evidence: readonly PriorBuildEvidence[];
  readonly precise?: boolean;
  readonly details: (sample: PriorBuildEvidence) => ReactNode;
}) {
  const durationWords = precise ? executionTimeWords : wholeSecondWords;
  return (
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
              ? "◆ Selected"
              : "× Excluded"}
          {" · "}
          <time dateTime={sample.date}>{buildDateWords(sample.date)}</time>
          {sample.ms === undefined ? "" : ` · ${durationWords(sample.ms)}`}
          {sample.reason === undefined ? "" : ` · ${sample.reason}`}
          {details(sample)}
        </p>
      ))}
    </div>
  );
}
