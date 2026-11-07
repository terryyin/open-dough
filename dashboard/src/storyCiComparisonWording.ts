// Wording of a story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): each endpoint's build identity and selection
// rule, CI wall time, and time without runner waits in whole seconds.
// The signed difference compares observations from two builds.

import {
  wallTimeMs,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import {
  notLandedYetExplanation,
  type RequestedRevisionCiStatus,
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";

export function requestedStatusWords(
  status: RequestedRevisionCiStatus,
): string {
  return status.explanation;
}

// Prefix before the selected build's identity or short SHA when the requested
// revision is not that build (trailing space when present).
export function requestedStatusPrefix(
  slot: Pick<StoryCiComparisonSlot, "requestedStatus">,
): string {
  return slot.requestedStatus === undefined
    ? ""
    : `${requestedStatusWords(slot.requestedStatus)} `;
}

// Gap slots prefer the requested revision's status wording when present;
// otherwise the slot's own explanation (N/A, unread, or missing build).
// When both differ, keep the status and the slot's extra reason (for example
// a skipped landing whose equivalent build published no proof).
export function requestedStatusOrExplanation(
  slot: Extract<
    StoryCiComparisonSlot,
    { kind: "none" | "unavailable" | "not-applicable" | "not-landed" }
  >,
): string {
  if (slot.requestedStatus === undefined) return slot.explanation;
  const status = requestedStatusWords(slot.requestedStatus);
  if (slot.explanation === status) return status;
  return `${status} ${slot.explanation}`;
}

export function selectionWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
  provisional = false,
): string {
  const base =
    slot.selection === "exact"
      ? slot.kind === "running"
        ? "exact revision (still running)"
        : "exact revision"
      : slot.selection === "equivalent"
        ? "equivalent build"
        : (() => {
            const count = slot.laterWithoutResult;
            return `ancestor: ${String(count)} later revision${count === 1 ? "" : "s"} without a build`;
          })();
  const selection =
    slot.kind === "build" && slot.laterRunning === true
      ? `ancestor · a later attempt is still running`
      : base;
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

export function wallTimeDifferenceWords(
  baseline: StoryCiComparisonSlot,
  after: StoryCiComparisonSlot,
): string | undefined {
  if (baseline.kind !== "build" || after.kind !== "build") return undefined;
  const before = wallTimeMs(baseline.startedAt, baseline.completedAt);
  const later = wallTimeMs(after.startedAt, after.completedAt);
  if (before === undefined || later === undefined) return undefined;
  return wholeSecondDifferenceWords(later - before);
}

export function timeWithoutRunnerWaitsWords(
  slot: StoryCiComparisonSlot,
  baseline?: StoryCiComparisonSlot,
): string {
  if (slot.kind === "running") return "Unavailable while the build is running.";
  if (slot.kind !== "build") return "—";
  const timing = slot.timeWithoutRunnerWaits;
  if ("reason" in timing) return `Unavailable. ${timing.reason}`;

  const time = wholeSecondWords(timing.milliseconds);
  const before =
    baseline?.kind === "build" ? baseline.timeWithoutRunnerWaits : undefined;
  if (before === undefined || "reason" in before) return time;
  return `${time} ${wholeSecondDifferenceWords(timing.milliseconds - before.milliseconds)}`;
}

export const observedNotAttributed =
  "observed builds; differences are not attributed to the story";
