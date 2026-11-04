// Intent's CI proof read for the local authenticated read boundary
// (`./authenticatedRead.ts`): the proof of the one GitHub Actions run
// attempt a CI status judgment named (`intent=ci-proof`, with `run`,
// `attempt` and the run's `revision`), read apart from the judgment so a
// slow or failed proof read never delays or alters it
// (`./ciProofArtifact.ts`). A project whose CI is read through a ciAdapter
// has no such run, and is answered without asking GitHub. Anything else is
// refused here before any `gh` call.

import { readingCiProofOf } from "../src/authenticatedReadRules.ts";
import type { CiProof, CiProofRun } from "../src/ciProof.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { readsCiThroughAdapter } from "./baseCiJudgment.ts";
import { readCiProofArtifact } from "./ciProofArtifact.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import { projectFolder } from "./projectFolders.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiProofRead = {
  readonly kind: "intent-ci-proof";
} & CiProofRun;

// What a CI proof read answers: the run it is the proof of, when it was
// checked, and the proof or why there is none.
export type IntentCiProofAnswer = CiProofRun & {
  readonly checkedAt: string;
  readonly proof: CiProof;
};

const ciProofRefusal =
  "A CI proof read names only the Intent request, one run, its attempt and its revision.";

const runNumber = (text: string | null): number | undefined => {
  if (text === null || !/^[1-9][0-9]{0,15}$/.test(text)) return undefined;
  const value = Number(text);
  return Number.isSafeInteger(value) ? value : undefined;
};

// The CI proof read a request names, undefined when it names none. Beside
// the pinned Intent read's own rules, it names one run and its attempt.
export function parseIntentCiProofRead(
  params: URLSearchParams,
): IntentCiProofRead | RefusedParameters | undefined {
  const pinned = parsePinnedIntentRead(
    params,
    "ci-proof",
    "intent-ci-proof",
    ciProofRefusal,
  );
  if (pinned === undefined || pinned.kind === "refused") return pinned;
  const runId = runNumber(params.get("run"));
  const runAttempt = runNumber(params.get("attempt"));
  if (
    !["run", "attempt", "revision"].every(
      (name) => params.getAll(name).length === 1,
    ) ||
    params.get("judged") !== null ||
    runId === undefined ||
    runAttempt === undefined
  )
    return refused(ciProofRefusal);
  return { kind: pinned.kind, runId, runAttempt, revision: pinned.revision };
}

// What a CI proof read names as being read before any request is asked.
export function readingIntentCiProofOf(
  source: PublishedSource,
  read: IntentCiProofRead,
): string {
  return readingCiProofOf(read, source.repository);
}

// Performs one CI proof read: it always answers, with the reason when no
// proof can be shown.
export async function performIntentCiProofRead(
  source: PublishedSource,
  read: IntentCiProofRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const { runId, runAttempt, revision } = read;
  const run = { runId, runAttempt, revision };
  const proof: CiProof = readsCiThroughAdapter(projectFolder(source))
    ? { kind: "unavailable", reason: "ci-adapter" }
    : await readCiProofArtifact(source.repository, run, signal);
  return answered({ ...run, checkedAt: new Date().toISOString(), proof });
}
