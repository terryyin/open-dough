// Wording of a story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): each endpoint's build identity and selection
// rule, CI wall time in whole seconds, and signed differences framed as
// observations between single builds, never attributed to the story.

import {
  wallTimeMs,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";

export function selectionWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
): string {
  if (slot.selection === "exact") {
    return slot.kind === "running"
      ? "exact revision (still running)"
      : "exact revision";
  }
  const count = slot.laterWithoutResult;
  return `ancestor: ${String(count)} later revision${count === 1 ? "" : "s"} without a build`;
}

export function wallTimeWords(slot: StoryCiComparisonSlot): string | undefined {
  if (slot.kind !== "build") return undefined;
  const ms = wallTimeMs(slot.startedAt, slot.completedAt);
  return ms === undefined ? undefined : wholeSecondWords(ms);
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

export const observedNotAttributed =
  "observed builds; differences are not attributed to the story";
