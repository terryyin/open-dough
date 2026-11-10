// The CI proof of one GitHub Actions run attempt (`./intentCiProofRead.ts`),
// read through the shared CI proof read
// (`../../src/skills/dough-test-optimization/scripts/ci-proof-read.mjs`):
// the run's `ci-proof-summary-attempt-<n>` artifact, listed by that name,
// downloaded as its zip and its one `ci-proof-summary.json` extracted, then
// validated with the collector's own contract, read in its current version
// (a version 1 summary's results as legacy evidence) and used only when it
// names the asked repository, run, attempt and revision (ADR 0008: missing,
// outdated or conflicting evidence is never a result). Every request goes
// through the CI evidence requests (`ci-github-actions.mjs`). This module
// says why a read shows no summary. A summary is immutable per run attempt,
// so a valid one is remembered by repository, run and attempt for this
// process's lifetime and never asked of GitHub again; every other answer is
// asked again on the next read. A read GitHub left unanswered -- a wait it
// directed, a request that failed, or an artifact listing that is not one --
// is told apart from GitHub's own answer that the run has no usable summary
// (`isUnansweredProof`), since only a later read may still answer it.
import {
  readGitHubActionsSummary,
  SUMMARY_FILE_NAME,
  type GitHubActionsSummaryRead,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-read.mjs";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
  readGitHubActions,
  askGitHubArchive,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import {
  ciProofTooLarge,
  type CiProof,
  type CiProofRun,
} from "../src/ciProof.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

const unavailable = (
  reason: Extract<CiProof, { kind: "unavailable" }>["reason"],
  detail?: string,
): CiProof => ({
  kind: "unavailable",
  reason,
  ...(detail === undefined ? {} : { detail }),
});

// What a developer can do when the local GitHub request owner passes an
// archive on as text: it ends once nothing on this machine uses it.
export const olderRequestOwnerDetail =
  "This machine's local GitHub request owner was started by an earlier Open Dough and passes the summary on as text. Restart the Open Dough dashboards and CI observers on this machine; the next read starts a current one";

// The unreadable answers of this process's reads that GitHub left
// unanswered, as each was answered.
const unanswered = new WeakSet<CiProof>();

const unansweredAs = (proof: CiProof): CiProof => {
  unanswered.add(proof);
  return proof;
};

// Whether GitHub left the read that answered `proof` unanswered: a wait it
// directed, a request that failed, or an artifact listing that is not one.
// GitHub's own answers -- no summary, an expired one, or an archive that
// cannot be opened or is not this run's usable summary -- are not: a run
// attempt's artifact does not change. Only an answer `readCiProofArtifact`
// gave is told, not a copy of it.
export function isUnansweredProof(proof: CiProof): boolean {
  return unanswered.has(proof);
}

// GitHub refused or could not answer, a directed wait is GitHub's too, or
// the local GitHub request owner could not pass the archive on.
export function unreadableBy(error: unknown): CiProof {
  if (error instanceof GitHubAcquisitionHeld)
    return unansweredAs(
      unavailable(
        "unreadable",
        `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
      ),
    );
  if (error instanceof GitHubAcquisitionFailed) {
    const { failure } = error as { readonly failure?: { kind?: unknown } };
    return unansweredAs(
      unavailable(
        "unreadable",
        failure?.kind === "archive-as-text"
          ? olderRequestOwnerDetail
          : error.message,
      ),
    );
  }
  throw error;
}

// The proof `read` answers for `run`'s attempt: its summary, or why there is
// none to show.
function proofOf(read: GitHubActionsSummaryRead, run: CiProofRun): CiProof {
  if ("summary" in read)
    return { kind: "summary", summary: read.summary } as CiProof;
  const name = summaryArtifactName(run.runAttempt);
  switch (read.why) {
    case "no-artifact":
      return unavailable("none");
    case "expired":
      return unavailable("expired");
    case "several-artifacts":
      return unavailable("invalid", `The run has more than one ${name}`);
    case "unreadable-listing":
      return unansweredAs(
        unavailable("unreadable", "GitHub's artifact listing is unreadable"),
      );
    case "too-large":
      return ciProofTooLarge(read.limitBytes, read.sizeBytes);
    case "unopenable-archive":
      return unavailable(
        "unreadable",
        `The ${name} artifact could not be opened: ${read.problem}`,
      );
    case "not-json":
      return unavailable("invalid", `${SUMMARY_FILE_NAME} is not JSON`);
    case "invalid":
      return unavailable(
        "invalid",
        `${SUMMARY_FILE_NAME}: ${read.problems.join("; ")}`,
      );
    case "mismatched":
      return unavailable(
        "mismatched",
        `The summary names ${read.names} ${String(read.value)}`,
      );
  }
}

type ArtifactReads = {
  readonly listing: typeof readGitHubActions;
  readonly archive: (args: string[], signal: AbortSignal) => Promise<Buffer>;
};

const rememberedKey = (repository: string, run: CiProofRun) =>
  `${repository.toLowerCase()}#${String(run.runId)}#${String(run.runAttempt)}`;

// The proof of `run` in `repository`: its summary, or why there is none to
// show.
export function ciProofArtifactReader(
  reads: ArtifactReads = {
    listing: readGitHubActions,
    archive: askGitHubArchive,
  },
) {
  const remembered = rememberedByKey<Record<string, unknown>>();
  return async (
    repository: string,
    run: CiProofRun,
    signal: AbortSignal,
  ): Promise<CiProof> => {
    const key = rememberedKey(repository, run);
    const kept = remembered.get(key);
    if (kept !== undefined)
      return { kind: "summary", summary: kept } as CiProof;
    let read: GitHubActionsSummaryRead;
    try {
      read = await readGitHubActionsSummary(repository, run, signal, {
        readGitHubActions: reads.listing,
        askGitHubArchive: reads.archive,
      });
    } catch (error) {
      return unreadableBy(error);
    }
    if ("summary" in read) remembered.set(key, read.summary);
    return proofOf(read, run);
  };
}

export const readCiProofArtifact = ciProofArtifactReader();
