// Why no CI proof can be shown for an attempt, in Intent's CI status
// homepage (`./IntentCiProof.tsx`) and a selected entry's or folder's
// Summary (`./IntentScopeProof.tsx`), through `./useIntentCiShownProof.ts`:
// no attempt shown, an ambiguous adapter attempt, and each reason a summary
// is unavailable, with what the reason observed when it says more. Story
// Branch Landed's equivalent-build and later-trunk-build gaps use the same
// reasons with their own framing (`equivalentBuildUnavailableLine`,
// `laterBuildUnavailableLine`).

import { shortSha } from "./baseCiWording.ts";
import type {
  CiProofUnavailable,
  CiProofUnavailableReason,
} from "./ciProof.ts";

// A proof size or limit as KiB or MiB to one decimal (trailing `.0` dropped).
export function proofSizeWords(bytes: number): string {
  const miB = bytes / (1024 * 1024);
  if (miB >= 1) {
    const text = miB.toFixed(1).replace(/\.0$/, "");
    return `${text} MiB`;
  }
  const text = (bytes / 1024).toFixed(1).replace(/\.0$/, "");
  return `${text} KiB`;
}

function tooLargeLine(
  subject: string,
  limitBytes: number,
  sizeBytes: number | undefined,
): string {
  const limit = proofSizeWords(limitBytes);
  return sizeBytes === undefined
    ? `${subject} is larger than the ${limit} proof limit.`
    : `${subject} is ${proofSizeWords(sizeBytes)}, larger than the ${limit} proof limit.`;
}

function tooLargeBuildLine(
  build: string,
  limitBytes: number,
  sizeBytes: number | undefined,
): string {
  const limit = proofSizeWords(limitBytes);
  return sizeBytes === undefined
    ? `${build} has a CI proof larger than the ${limit} proof limit.`
    : `${build} has a CI proof that is ${proofSizeWords(sizeBytes)}, larger than the ${limit} proof limit.`;
}

const unavailableLines: Readonly<Record<CiProofUnavailableReason, string>> = {
  none: "This run published no CI proof summary.",
  expired: "This run's CI proof summary has expired.",
  unreadable: "This run's CI proof summary could not be read.",
  invalid: "This run's CI proof summary is not a valid summary.",
  mismatched:
    "This run's CI proof summary is for another run, attempt or revision.",
  // Size facts come from `limitBytes` / `sizeBytes`; this stub keeps the
  // reason table complete for typecheck.
  "too-large": "This run's CI proof summary is larger than the proof limit.",
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
  "too-large": (build) =>
    `${build} has a CI proof larger than the proof limit.`,
};

function absenceOf(
  absence: CiProofUnavailable | CiProofUnavailableReason,
  detail?: string,
): CiProofUnavailable {
  return typeof absence === "string"
    ? {
        kind: "unavailable",
        reason: absence,
        ...(detail === undefined ? {} : { detail }),
      }
    : absence;
}

// Sized `too-large` lines; undefined when the absence is another reason or
// lacks the shared limit (table stubs cover that incomplete case).
function sizedTooLargeLine(
  proof: CiProofUnavailable,
  words: (limitBytes: number, sizeBytes: number | undefined) => string,
): string | undefined {
  if (proof.reason !== "too-large" || proof.limitBytes === undefined)
    return undefined;
  return words(proof.limitBytes, proof.sizeBytes);
}

// Landed confirmed-skip path: why the equivalent build's proof cannot be used.
export function equivalentBuildUnavailableLine(
  revision: string,
  absence: CiProofUnavailable | CiProofUnavailableReason,
): string {
  const proof = absenceOf(absence);
  const build = `The equivalent build at ${shortSha(revision)}`;
  return (
    sizedTooLargeLine(proof, (limitBytes, sizeBytes) =>
      tooLargeBuildLine(build, limitBytes, sizeBytes),
    ) ?? buildUnavailableLines[proof.reason](build)
  );
}

// Landed cancelled-landing path: why the nearest later trunk build's proof
// cannot be used (`build` names its revision and run).
export function laterBuildUnavailableLine(
  build: string,
  absence: CiProofUnavailable | CiProofUnavailableReason,
): string {
  const proof = absenceOf(absence);
  const named = `The nearest later trunk build at ${build}`;
  return (
    sizedTooLargeLine(proof, (limitBytes, sizeBytes) =>
      tooLargeBuildLine(named, limitBytes, sizeBytes),
    ) ?? buildUnavailableLines[proof.reason](named)
  );
}

// The one line under Proof saying why no proof can be shown, with what the
// reason observed when it says more.
export function unavailableLine(
  absence: CiProofUnavailableReason | CiProofUnavailable,
  detail?: string,
): string {
  const proof = absenceOf(absence, detail);
  const sized = sizedTooLargeLine(proof, (limitBytes, sizeBytes) =>
    tooLargeLine("This run's CI proof summary", limitBytes, sizeBytes),
  );
  if (sized !== undefined) return sized;
  const line = unavailableLines[proof.reason];
  return proof.detail === undefined
    ? line
    : `${line} ${sentence(proof.detail)}`;
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
  "too-large": "This attempt's CI proof is larger than the proof limit",
};

// The one line under Proof saying why a ciAdapter attempt shows no proof,
// with what the adapter or the summary said: the adapter's own reason is
// shown as it gave it.
export function adapterUnavailableLine(
  absence: CiProofUnavailableReason | CiProofUnavailable,
  detail?: string,
): string {
  const proof = absenceOf(absence, detail);
  return (
    sizedTooLargeLine(proof, (limitBytes, sizeBytes) =>
      tooLargeLine("This attempt's CI proof", limitBytes, sizeBytes),
    ) ?? withDetail(adapterUnavailableLines[proof.reason], proof.detail)
  );
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
