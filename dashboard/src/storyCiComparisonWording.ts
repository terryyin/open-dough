// Wording of a story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): each endpoint's Build source cue (exact /
// ancestor accessible words, or concise equivalent / later wording), each
// build's measured CI wall time and time without runner waits in whole
// seconds, one signed whole-second change for each of the active
// comparison's overall timings (without runner waits, and wall time) with
// its relative change (`./storyCiRelativeChange.ts`), and the
// active comparison name, framed as observations between single builds,
// never attributed to the story.
// Overall counts live in `./storyCiComparisonCountsWords.ts`.

import { wallTimeMs, wholeSecondWords } from "./ciProofTimeWords.ts";
import {
  overallDurationCueOf,
  type DurationCue,
} from "./ciScopeComparisonCues.ts";
import { timeChangeOf, type TimeChange } from "./storyCiRelativeChange.ts";
import {
  notLandedYetExplanation,
  type StoryCiComparisonAnswer,
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEndpointProofs,
} from "./storyCiComparisonEntries.ts";

function revisionCountWords(count: number, revision: string): string {
  return `${String(count)} ${revision}${count === 1 ? "" : "s"}`;
}

// How the endpoint's build was selected. A cancelled landing's later trunk
// build counts the later trunk revisions it includes; an ancestor counts the
// later revisions passed over.
function selectionRuleWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
): string {
  switch (slot.selection) {
    case "exact":
      return slot.kind === "running"
        ? "exact revision (still running)"
        : "exact revision";
    case "equivalent":
      return "equivalent build";
    case "later":
      return `later trunk build: includes ${revisionCountWords(slot.laterWithoutResult, "later trunk revision")}`;
    case "ancestor":
      return `ancestor: ${revisionCountWords(slot.laterWithoutResult, "later revision")} without a build`;
  }
}

export function selectionWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
  provisional = false,
): string {
  const selection =
    slot.kind === "build" && slot.laterRunning === true
      ? `ancestor · a later attempt is still running`
      : selectionRuleWords(slot);
  // Taken stories label the live tip provisional, not final.
  return provisional ? `provisional · ${selection}` : selection;
}

export const notLandedYetWords = notLandedYetExplanation;

export function wallTimeWords(slot: StoryCiComparisonSlot): string | undefined {
  if (slot.kind !== "build") return undefined;
  const ms = wallTimeMs(slot.startedAt, slot.completedAt);
  if (ms !== undefined) return wholeSecondWords(ms);
  return slot.adapterAttempt === undefined ? undefined : "Not recorded";
}

// The change from a measured BEFORE to a measured LATER; none when either is
// not measured.
function signedChangeOf(
  before: number | undefined,
  later: number | undefined,
): TimeChange | undefined {
  if (before === undefined || later === undefined) return undefined;
  return timeChangeOf(before, later);
}

function measuredWallTimeMs(slot: StoryCiComparisonSlot): number | undefined {
  return slot.kind === "build"
    ? wallTimeMs(slot.startedAt, slot.completedAt)
    : undefined;
}

// The active comparison's CI wall-time change between two completed builds.
export function wallTimeChangeOf(
  baseline: StoryCiComparisonSlot,
  after: StoryCiComparisonSlot,
): TimeChange | undefined {
  return signedChangeOf(
    measuredWallTimeMs(baseline),
    measuredWallTimeMs(after),
  );
}

// Endpoint cell: the build's measured time without runner waits, or why it
// has none. The change from Baseline is the summary's.
export function timeWithoutRunnerWaitsWords(
  slot: StoryCiComparisonSlot,
): string {
  if (slot.kind === "running") return "Unavailable while the build is running.";
  if (slot.kind !== "build") return "—";
  const timing = slot.timeWithoutRunnerWaits;
  if ("reason" in timing) return `Unavailable. ${timing.reason}`;
  return wholeSecondWords(timing.milliseconds);
}

function measuredWithoutRunnerWaitsMs(
  slot: StoryCiComparisonSlot,
): number | undefined {
  if (slot.kind !== "build") return undefined;
  const timing = slot.timeWithoutRunnerWaits;
  return "reason" in timing ? undefined : timing.milliseconds;
}

// The active comparison's change in CI time without runner waits.
export function timeWithoutRunnerWaitsChangeOf(
  baseline: StoryCiComparisonSlot,
  after: StoryCiComparisonSlot,
): TimeChange | undefined {
  return signedChangeOf(
    measuredWithoutRunnerWaitsMs(baseline),
    measuredWithoutRunnerWaitsMs(after),
  );
}

const observedNotAttributed =
  "observed builds; differences are not attributed to the story";

// The same framing as a sentence of its own.
export const observedNotAttributedInFull = `${observedNotAttributed.charAt(0).toUpperCase()}${observedNotAttributed.slice(1)}`;

export type ActiveComparedEndpoint = "Landed" | "Branch" | "Provisional";

export type ActiveComparison = {
  readonly endpoint: ActiveComparedEndpoint;
  readonly slot: StoryCiComparisonSlot;
  readonly proof: ComparisonEndpointProof;
  readonly title: string;
  readonly landedUnusedReason: string | undefined;
};

function landedUnusedReasonOf(
  landed: StoryCiComparisonSlot,
  proof: ComparisonEndpointProof,
): string {
  if (landed.kind === "build" || landed.kind === "running") {
    if (proof.kind === "unavailable") return proof.line;
    if (proof.kind === "no-build") return proof.explanation;
    if (proof.kind === "checking") return "Landed proof is still reading.";
    return "Landed has no CI proof summary.";
  }
  return landed.explanation;
}

// Active comparison: Baseline with Landed when Landed has a proof summary,
// otherwise Branch (or Provisional for Taken Trunk Mode), with why Landed
// is not used when it is skipped.
export function activeComparisonOf(
  answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>,
  proofs: ComparisonEndpointProofs,
): ActiveComparison {
  if (
    proofs.landed.kind === "summary" ||
    (proofs.landed.kind === "checking" &&
      (answer.landed.kind === "build" || answer.landed.kind === "running"))
  ) {
    return {
      endpoint: "Landed",
      slot: answer.landed,
      proof: proofs.landed,
      title: "Baseline compared with Landed",
      landedUnusedReason: undefined,
    };
  }
  const reason = landedUnusedReasonOf(answer.landed, proofs.landed);
  if (answer.provisional !== undefined) {
    return {
      endpoint: "Provisional",
      slot: answer.provisional,
      proof: proofs.branch,
      title: "Baseline compared with Provisional",
      landedUnusedReason: reason,
    };
  }
  return {
    endpoint: "Branch",
    slot: answer.branch,
    proof: proofs.branch,
    title: "Baseline compared with Branch",
    landedUnusedReason: reason,
  };
}

// Overall timing cue uses CI time without runner waits (wall time is context).
export function overallTimingCue(
  baseline: StoryCiComparisonSlot,
  after: StoryCiComparisonSlot,
): DurationCue {
  return overallDurationCueOf(
    measuredWithoutRunnerWaitsMs(baseline),
    measuredWithoutRunnerWaitsMs(after),
  );
}
