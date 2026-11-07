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
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";

export function selectionWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
  provisional = false,
): string {
  const base =
    slot.selection === "exact"
      ? slot.kind === "running"
        ? "exact revision (still running)"
        : "exact revision"
      : (() => {
          const count = slot.laterWithoutResult;
          return `ancestor: ${String(count)} later revision${count === 1 ? "" : "s"} without a build`;
        })();
  // Taken stories label the live tip provisional, not final.
  return provisional ? `provisional · ${base}` : base;
}

export const notLandedYetWords = notLandedYetExplanation;

export function wallTimeWords(slot: StoryCiComparisonSlot): string | undefined {
  if (slot.kind !== "build") return undefined;
  const ms = wallTimeMs(slot.startedAt, slot.completedAt);
  return ms === undefined ? undefined : wholeSecondWords(ms);
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
