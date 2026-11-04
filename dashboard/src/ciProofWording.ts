// Wording of one run attempt's CI proof in Intent's CI status tab
// (`./IntentCiProof.tsx`): each entry's counts with their unit, how many of
// its declared parts are present, each missing or ambiguous part as a gap,
// and why no proof can be shown. A gap's counts are never part of the
// entry's counts (the collector leaves them out), so the words say how many
// parts were counted. Nothing relies on colour.

import type { CiProofEntry, CiProofUnavailableReason } from "./ciProof.ts";

function joinedAnd(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1) ?? ""}`;
}

// "19 passed and 1 failed tests": every nonzero outcome, then the unit.
export function entryCountsLine(entry: CiProofEntry): string {
  if (entry.unit === null) return "nothing counted";
  const counted = (
    [
      ["passed", entry.passed],
      ["failed", entry.failed],
      ["other", entry.other],
    ] as const
  )
    .filter(([, value]) => value > 0)
    .map(([outcome, value]) => `${String(value)} ${outcome}`);
  return counted.length === 0
    ? `no ${entry.unit}`
    : `${joinedAnd(counted)} ${entry.unit}`;
}

// "2 of 2 parts present".
export function entryPartsLine(entry: CiProofEntry): string {
  const present = entry.parts.filter((part) => part.status === "present");
  const of = entry.parts.length;
  return `${String(present.length)} of ${String(of)} ${of === 1 ? "part" : "parts"} present`;
}

// "part 4 of 12 missing", one for each part not counted.
export function entryGapLines(entry: CiProofEntry): string[] {
  const of = entry.parts.length;
  return entry.parts
    .filter((part) => part.status !== "present")
    .map((part) => `part ${String(part.part)} of ${String(of)} ${part.status}`);
}

const unavailableLines: Readonly<Record<CiProofUnavailableReason, string>> = {
  none: "This run published no CI proof summary.",
  expired: "This run's CI proof summary has expired.",
  refused: "GitHub did not give this run's CI proof summary.",
  mismatched: "This run's CI proof summary is for another run.",
  invalid: "This run's CI proof summary could not be read as one.",
  "ci-adapter":
    "This project's CI is read through a ciAdapter, which publishes no CI proof summary.",
};

export function unavailableLine(
  reason: CiProofUnavailableReason,
  detail: string | undefined,
): string {
  const line = unavailableLines[reason];
  if (detail === undefined) return line;
  return `${line} ${detail}${detail.endsWith(".") ? "" : "."}`;
}

export const noRunLine =
  "The shown result names no GitHub Actions run, so it has no CI proof to show.";
