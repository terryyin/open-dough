// Why no CI proof can be shown for an attempt, in Intent's CI status
// homepage (`./IntentCiProof.tsx`) and a selected entry's or folder's
// Summary (`./IntentScopeProof.tsx`), through `./useIntentCiShownProof.ts`:
// no attempt shown, an ambiguous adapter attempt, and each reason a summary
// is unavailable, with what the reason observed when it says more. Story
// Branch Landed's equivalent-build and later-trunk-build gaps use the same
// reasons with their own framing (`equivalentBuildUnavailableLine`,
// `laterBuildUnavailableLine`).

import { shortSha } from "./baseCiWording.ts";
import type { CiProofUnavailableReason } from "./ciProof.ts";

const unavailableLines: Readonly<Record<CiProofUnavailableReason, string>> = {
  none: "This run published no CI proof summary.",
  expired: "This run's CI proof summary has expired.",
  unreadable: "This run's CI proof summary could not be read.",
  invalid: "This run's CI proof summary is not a valid summary.",
  mismatched:
    "This run's CI proof summary is for another run, attempt or revision.",
};

// Why a named build's proof cannot be used, after the build is named.
const buildUnavailableLines: Readonly<
  Record<CiProofUnavailableReason, (build: string) => string>
> = {
  none: (build) => `${build} published no CI proof summary.`,
  expired: (build) => `${build} has an expired CI proof summary.`,
  unreadable: (build) =>
    `${build} has a CI proof summary that could not be read.`,
  invalid: (build) => `${build} has a CI proof summary that is not valid.`,
  mismatched: (build) =>
    `${build} has a CI proof summary for another run, attempt or revision.`,
};

// Landed confirmed-skip path: why the equivalent build's proof cannot be used.
export function equivalentBuildUnavailableLine(
  revision: string,
  reason: CiProofUnavailableReason,
): string {
  return buildUnavailableLines[reason](
    `The equivalent build at ${shortSha(revision)}`,
  );
}

// Landed cancelled-landing path: why the nearest later trunk build's proof
// cannot be used (`build` names its revision and run).
export function laterBuildUnavailableLine(
  build: string,
  reason: CiProofUnavailableReason,
): string {
  return buildUnavailableLines[reason](
    `The nearest later trunk build at ${build}`,
  );
}

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
