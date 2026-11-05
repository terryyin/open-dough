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
  unreadable: "This run's CI proof summary could not be read.",
  invalid: "This run's CI proof summary is not a valid summary.",
  mismatched:
    "This run's CI proof summary is for another run, attempt or revision.",
};

// The one line under Proof saying why no proof can be shown, with what the
// reason observed when it says more.
export function unavailableLine(
  reason: CiProofUnavailableReason,
  detail: string | undefined,
): string {
  const line = unavailableLines[reason];
  return detail === undefined ? line : `${line} ${sentence(detail)}`;
}

// `text` ending with one full stop.
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

const adapterUnavailableLines: Readonly<
  Record<CiProofUnavailableReason, string>
> = {
  none: "This attempt's CI adapter gave no CI proof summary",
  expired: "This attempt's CI proof summary has expired",
  unreadable: "This attempt's CI adapter answered no proof read",
  invalid: "This attempt's CI proof summary is not a valid summary",
  mismatched:
    "This attempt's CI proof summary is for another repository, attempt or revision",
};

// The one line under Proof saying why a ciAdapter attempt shows no proof,
// with what the adapter or the summary said: the adapter's own reason is
// shown as it gave it.
export function adapterUnavailableLine(
  reason: CiProofUnavailableReason,
  detail: string | undefined,
): string {
  return withDetail(adapterUnavailableLines[reason], detail);
}

// The dashboard's own read failed before any adapter answer reached the tab.
export function adapterReadFailedLine(detail: string | undefined): string {
  return withDetail("This attempt's CI proof could not be read", detail);
}

function withDetail(line: string, detail: string | undefined): string {
  return detail === undefined ? `${line}.` : `${line}: ${sentence(detail)}`;
}

// Another discovered attempt names the shown attempt's attemptId at its
// revision, so no adapter is asked which one a summary is of.
export function ambiguousAttemptLine(
  attemptId: string,
  revision: string,
): string {
  return `This attempt is ambiguous at its revision: another discovered attempt is also attempt ${attemptId} at ${revision}.`;
}

export const noRunLine =
  "No completed GitHub Actions run is shown, so there is no CI proof to show.";

// A ciAdapter project's tab shows no completed attempt.
export const noAttemptLine =
  "No completed CI attempt is shown, so there is no CI proof to show.";
