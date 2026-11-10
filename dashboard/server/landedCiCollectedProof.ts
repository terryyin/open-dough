// Acquire the proof named by one retained measured attempt through the
// same validated readers as live Intent.
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  isAdapterProofAttempt,
  type CiProof,
  type CiProofSubject,
  type CiProofUnavailable,
} from "../src/ciProof.ts";
import {
  keptResolution,
  type KeptBuild,
  type LandedResolution,
} from "./landedCiObservation.ts";
import { readIntentCiProof } from "./intentCiProofRead.ts";
import { projectFolder } from "./projectFolders.ts";
import { isUnansweredProof } from "./ciProofArtifact.ts";

export type CollectedProof = {
  readonly proof: CiProof;
  readonly pending: boolean;
};

// Settled missing summaries (`none`) and other final unavailable reasons are
// not collected again. Only an unreadable gap may still be.
function collectableUnavailable(
  proof: CiProof,
): proof is CiProofUnavailable & { readonly reason: "unreadable" } {
  return proof.kind === "unavailable" && proof.reason === "unreadable";
}

// Old unavailable records are classified on their next read. A summary is
// immutable. Acquisition marks pending only for unanswered GitHub reads
// (`isUnansweredProof`) or adapter command failures; settled missing stays
// final once written.
export function needsCollectedProof(build: KeptBuild): boolean {
  if (build.state !== "pass" || build.proof?.kind === "summary") return false;
  return (
    build.proof === undefined ||
    (build.proofPending !== false && collectableUnavailable(build.proof))
  );
}

// Proof to retain with a newly resolved measured build, so collection can
// keep the observation and its first proof ask together. Undefined when the
// resolution is not a pass that still needs proof.
export async function proofRetainedWith(
  source: PublishedSource,
  resolution: LandedResolution,
  signal: AbortSignal,
): Promise<CollectedProof | undefined> {
  if (resolution.kind !== "build") return undefined;
  const { build } = keptResolution(resolution);
  if (build === undefined || !needsCollectedProof(build[1])) return undefined;
  return collectedProofOf(source, build[1], signal);
}

// Judge the original read before JSON persistence loses native unanswered
// identity. Adapter unreadable answers are recoverable command acquisition.
export async function collectedProofOf(
  source: PublishedSource,
  build: KeptBuild,
  signal: AbortSignal,
): Promise<CollectedProof> {
  const subject = collectedProofSubjectOf(source, build);
  if ("kind" in subject) return { proof: subject, pending: false };
  const proof = await readIntentCiProof(
    source,
    subject,
    signal,
    (asked) => projectFolder(asked).path,
  );
  const pending =
    collectableUnavailable(proof) &&
    (isAdapterProofAttempt(subject) || isUnansweredProof(proof));
  return { proof, pending };
}

// One retained build names its own attempt; a missing or ambiguous identity
// remains an explicit proof gap rather than borrowing another attempt.
function collectedProofSubjectOf(
  source: PublishedSource,
  build: KeptBuild,
): CiProofSubject | CiProofUnavailable {
  if (build.adapterAttempt !== undefined) {
    if (build.adapterAttempt.ambiguous === true)
      return {
        kind: "unavailable",
        reason: "mismatched",
        detail:
          "Another discovered attempt shares this attempt identity at its revision.",
      };
    return {
      runId: String(build.adapterAttempt.runId),
      attemptId: String(build.adapterAttempt.attemptId),
      branch: build.runBranch ?? source.ref,
      revision: build.revision,
    };
  } else {
    if (build.runId === undefined || build.runAttempt === undefined)
      return {
        kind: "unavailable",
        reason: "none",
        detail: "The measured build did not name a proof attempt.",
      };
    return {
      runId: build.runId,
      runAttempt: build.runAttempt,
      revision: build.revision,
    };
  }
}
