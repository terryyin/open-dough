// Acquire the proof named by one retained measured attempt through the
// same validated readers as live Intent.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { CiProof, CiProofSubject } from "../src/ciProof.ts";
import type { KeptBuild } from "./landedCiObservation.ts";
import { readIntentCiProof } from "./intentCiProofRead.ts";
import { projectFolder } from "./projectFolders.ts";

// One retained build names its own attempt; a missing or ambiguous identity
// remains an explicit proof gap rather than borrowing another attempt.
export async function collectedProofOf(
  source: PublishedSource,
  build: KeptBuild,
  signal: AbortSignal,
): Promise<CiProof> {
  let subject: CiProofSubject;
  if (build.adapterAttempt !== undefined) {
    if (build.adapterAttempt.ambiguous === true)
      return {
        kind: "unavailable",
        reason: "mismatched",
        detail:
          "Another discovered attempt shares this attempt identity at its revision.",
      };
    subject = {
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
    subject = {
      runId: build.runId,
      runAttempt: build.runAttempt,
      revision: build.revision,
    };
  }
  return readIntentCiProof(
    source,
    subject,
    signal,
    (asked) => projectFolder(asked).path,
  );
}
