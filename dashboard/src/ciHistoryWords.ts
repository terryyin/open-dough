// Words of Project Intent's CI wall time history (`./IntentCiHistory.tsx`):
// how many measured builds it shows, a build's or landing's date as the
// reader's clock has it, a point's CI wall time in whole seconds, as the story
// CI comparison words a build's (`./storyCiComparisonWording.ts`), how a
// build stands for the landings it names -- the landed revision's own build
// and a later trunk build in the comparison's words, a confirmed skip's
// equivalent build in the story's "reused equivalent", where the comparison
// says "equivalent build", with the build's revision -- each landing named
// by its landed revision and the story it landed for, why a gap has no CI
// wall time, as not yet or as never, and the run attempt a point was
// measured from or a gap names, as Proof names one (`./CiEvidenceLabels.tsx`).
// Revisions are kept apart in the words so the page can set them as code;
// the chart's hover gives the same words as plain text.

import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import { shortSha } from "./baseCiWording.ts";
import { adapterAttemptWords, runAttemptWords } from "./CiEvidenceLabels.tsx";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import {
  provenances,
  type FinalGapReason,
  type LandedCiGap,
  type LandedCiPoint,
  type MeasuredLanding,
  type MeasuredPoint,
  type PendingWait,
  type Provenance,
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

// Words that name revisions: each revision apart, for the page to set as
// code.
export type HistoryWords = readonly (string | { readonly revision: string })[];

// The words as plain text, each revision by its short form.
export function plainWords(words: HistoryWords): string {
  return words
    .map((part) => (typeof part === "string" ? part : shortSha(part.revision)))
    .join("");
}

// A landing by its landed revision and the story it landed for, when it
// names one: "a1b2c3d (SEED-285#see-landed-ci-wall-time-history)".
export function landingWords(
  landing: Pick<MeasuredLanding, "revision" | "identity">,
): HistoryWords {
  return landing.identity === undefined
    ? [{ revision: landing.revision }]
    : [{ revision: landing.revision }, ` (${landing.identity})`];
}

const conjunction = new Intl.ListFormat("en", { type: "conjunction" });

// "a", "a and b", "a, b, and c".
function listWords(items: readonly HistoryWords[]): HistoryWords {
  return conjunction
    .formatToParts([...items.keys()].map(String))
    .flatMap((part) =>
      part.type === "element"
        ? (items[Number(part.value)] ?? [])
        : [part.value],
    );
}

// How each kind of build stands for its landings.
const provenanceWordsOf: Readonly<Record<Provenance, string>> = {
  exact: "exact revision",
  equivalent: "reused equivalent",
  later: "later trunk build",
};

// How a build stands for `landings`: "exact revision a1b2c3d (SEED-9#e)" for
// the landed revisions' own; "reused equivalent a1b2c3d for b2c3d4e
// (SEED-9#r1)" or "later trunk build d6e7f8a for d4e5f6a (SEED-9#f)" with
// the build's revision otherwise.
export function standsForWords(
  provenance: Provenance,
  buildRevision: string,
  landings: readonly Pick<MeasuredLanding, "revision" | "identity">[],
): HistoryWords {
  const named = listWords(landings.map(landingWords));
  return provenance === "exact"
    ? [`${provenanceWordsOf.exact} `, ...named]
    : [
        `${provenanceWordsOf[provenance]} `,
        { revision: buildRevision },
        " for ",
        ...named,
      ];
}

// Everything a point stands for, by how: the landed revisions' own build
// first, then a reused equivalent, then a later trunk build, joined by " · ".
export function pointLandingsWords(point: LandedCiPoint): HistoryWords {
  return provenances
    .flatMap((provenance) => {
      const landings = point.landings.filter(
        (landing) => landing.provenance === provenance,
      );
      return landings.length === 0
        ? []
        : [standsForWords(provenance, point.revision, landings)];
    })
    .flatMap((words, index) => (index === 0 ? words : [" · ", ...words]));
}

// What a pending gap waits for, said as not measured yet: a pending landing
// has no CI wall time until collection finds it final.
const pendingWords: Readonly<Record<PendingWait, string>> = {
  run: "no CI run yet",
  build: "CI queued or running",
  "later-build": "waiting for a later trunk build",
  proof: "CI proof not read yet",
  read: "CI not read yet",
};

// Why a final gap will never have a CI wall time.
const finalWords: Readonly<Record<FinalGapReason, string>> = {
  failed: "Failed",
  cancelled: "Cancelled",
  "no-build": "No build",
  "no-equivalent": "Equivalent timing unavailable",
  "no-proof": "No CI proof summary",
  expired: "CI proof expired",
  unreadable: "CI proof unreadable",
  "not-recorded": "CI wall time not recorded",
};

// Why a gap has no CI wall time: "Pending · CI queued or running" while it
// may still be measured; "Failed", "No build" and the like once it never
// will be.
export function gapReasonWords(gap: LandedCiGap): string {
  return gap.reason === "pending"
    ? `Pending · ${pendingWords[gap.waitsFor]}`
    : finalWords[gap.reason];
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
