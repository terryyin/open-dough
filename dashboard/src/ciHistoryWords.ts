// Words of Project Intent's CI wall time history (`./IntentCiHistory.tsx`):
// how many measured builds it shows, a build's or landing's date as the
// reader's clock has it, a point's CI wall time in whole seconds, as the story
// CI comparison words a build's (`./storyCiComparisonWording.ts`), how the
// build measures its landing, in the comparison's own words for the landed
// revision's own build, why a gap is not measured yet, and the run attempt a
// point was measured from or a gap waits on, named as Proof names one
// (`./CiEvidenceLabels.tsx`).

import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import { adapterAttemptWords, runAttemptWords } from "./CiEvidenceLabels.tsx";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import type {
  LandedCiGap,
  LandedCiPoint,
  MeasuredPoint,
  PendingWait,
} from "./landedCiHistory.ts";

const buildDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// "1 measured build", "4 measured builds".
export function measuredBuildsWords(count: number): string {
  return `${String(count)} measured build${count === 1 ? "" : "s"}`;
}

// The day a build started, or a landing was recorded, on the reader's clock:
// "Nov 5".
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

// What a gap waits for, said as not measured yet: a pending landing has no
// CI wall time until collection finds it final.
const pendingWords: Readonly<Record<PendingWait, string>> = {
  run: "no CI run yet",
  build: "CI queued or running",
  "later-build": "waiting for a later trunk build",
  read: "CI not read yet",
};

// Why a gap has no CI wall time: "Pending · CI queued or running".
export function gapReasonWords(gap: LandedCiGap): string {
  return `Pending · ${pendingWords[gap.waitsFor]}`;
}

// "Run 41 · attempt 1", or a CI adapter's "Attempt 9f1c"; undefined when the
// build's CI read named neither.
export function historyAttemptWords(
  run: BaseCiRunIdentity,
): string | undefined {
  const { runId, runAttempt, adapterAttempt } = run;
  if (adapterAttempt !== undefined)
    return adapterAttemptWords(adapterAttempt.attemptId);
  if (runId !== undefined && runAttempt !== undefined)
    return runAttemptWords(runId, runAttempt);
  return undefined;
}
