// Words of Project Intent's CI wall time history (`./IntentCiHistory.tsx`):
// how many measured builds it shows, a build's date as the reader's clock
// has it, a point's CI wall time in whole seconds, as the story CI comparison
// words a build's (`./storyCiComparisonWording.ts`), how the build measures
// its landing, in the comparison's own words for the landed revision's own
// build, and the run attempt it was measured from, named as Proof names one
// (`./CiEvidenceLabels.tsx`).

import { adapterAttemptWords, runAttemptWords } from "./CiEvidenceLabels.tsx";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import type { LandedCiPoint, MeasuredPoint } from "./landedCiHistory.ts";

const buildDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// "1 measured build", "4 measured builds".
export function measuredBuildsWords(count: number): string {
  return `${String(count)} measured build${count === 1 ? "" : "s"}`;
}

// The day a build started on the reader's clock: "Nov 5".
export function buildDateWords(at: string): string {
  return buildDate.format(new Date(at));
}

// A point's CI wall time: "6 min 5 s".
export function pointWallTimeWords(point: MeasuredPoint): string {
  return wholeSecondWords(point.wallTimeMs);
}

// How each kind of point's build measures its landing.
const provenanceWordsOf: Readonly<Record<LandedCiPoint["provenance"], string>> =
  {
    exact: "exact revision",
  };

// How the point's build measures its landing.
export function provenanceWords(point: LandedCiPoint): string {
  return provenanceWordsOf[point.provenance];
}

// "Run 41 · attempt 1", or a CI adapter's "Attempt 9f1c"; undefined when the
// build's CI read named neither.
export function measuredAttemptWords(point: LandedCiPoint): string | undefined {
  const { runId, runAttempt, adapterAttempt } = point;
  if (adapterAttempt !== undefined)
    return adapterAttemptWords(adapterAttempt.attemptId);
  if (runId !== undefined && runAttempt !== undefined)
    return runAttemptWords(runId, runAttempt);
  return undefined;
}
