// Acquire the proof named by one retained measured attempt through the
// same validated readers as live Intent.
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  isAdapterProofAttempt,
  type CiProof,
  type CiProofSubject,
  type CiProofUnavailable,
} from "../src/ciProof.ts";
import type { KeptBuild } from "./landedCiObservation.ts";
import { readIntentCiProof } from "./intentCiProofRead.ts";
import { projectFolder } from "./projectFolders.ts";
import { isUnansweredProof } from "./ciProofArtifact.ts";

// Old unavailable records are classified on their next read. A summary is
// immutable; unavailable reasons other than missing/unreadable are final.
export function needsCollectedProof(build: KeptBuild): boolean {
  if (build.state !== "pass" || build.proof?.kind === "summary") return false;
  return (
    build.proof === undefined ||
    (build.proofPending !== false &&
      (build.proof.reason === "none" || build.proof.reason === "unreadable"))
  );
}

// Judge the original read before JSON persistence loses native unanswered
// identity. Adapter unreadable answers are recoverable command acquisition.
export async function collectedProofOf(
  source: PublishedSource,
  build: KeptBuild,
  signal: AbortSignal,
): Promise<{ readonly proof: CiProof; readonly pending: boolean }> {
  const subject = collectedProofSubjectOf(source, build);
  if ("kind" in subject) return { proof: subject, pending: false };
  const proof = await readIntentCiProof(
    source,
    subject,
    signal,
    (asked) => projectFolder(asked).path,
  );
  const pending =
    proof.kind === "unavailable" &&
    (proof.reason === "none" ||
      (proof.reason === "unreadable" &&
        (isAdapterProofAttempt(subject) || isUnansweredProof(proof))));
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
