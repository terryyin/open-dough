// Intent's CI proof read for the local authenticated read boundary
// (`./authenticatedRead.ts`): the proof of the one attempt a CI status
// judgment named (`intent=ci-proof`), read apart from the judgment so a
// slow or failed proof read never delays or alters it. A GitHub Actions run
// attempt is named by `run`, `attempt` and the run's `revision`
// (`./ciProofArtifact.ts`); a ciAdapter attempt by the text of its `run` and
// `attempt-id`, the `run-branch` whose discover listed it and its
// `revision`, and is read through the project's own adapter, run from the
// project folder as discover is (`./ciAdapterProof.ts`). Anything else is
// refused here before any `gh` call or adapter run.

import {
  isSafeBranchName,
  readingCiProofOf,
} from "../src/authenticatedReadRules.ts";
import {
  ciProofSubjectOf,
  isAdapterProofAttempt,
  type CiProof,
  type CiProofSubject,
} from "../src/ciProof.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { readCiAdapterProof } from "./ciAdapterProof.ts";
import { readCiProofArtifact } from "./ciProofArtifact.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiProofRead = {
  readonly kind: "intent-ci-proof";
} & CiProofSubject;

// What a CI proof read answers: the attempt it is the proof of, when it was
// checked, and the proof or why there is none.
export type IntentCiProofAnswer = CiProofSubject & {
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

// The longest adapter `runId` or `attemptId` text a proof read names.
const adapterIdentityLimit = 256;

const adapterText = (text: string | null): string | undefined =>
  text !== null && text !== "" && text.length <= adapterIdentityLimit
    ? text
    : undefined;

const namedOnce = (params: URLSearchParams, names: readonly string[]) =>
  names.every((name) => params.getAll(name).length === 1);

const githubNames = ["run", "attempt", "revision"] as const;
const adapterNames = ["run", "attempt-id", "run-branch", "revision"] as const;

// The CI proof read a request names, undefined when it names none. Beside
// the pinned Intent read's own rules, it names one GitHub Actions run and
// its attempt, or one ciAdapter attempt.
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
  const { kind, revision } = pinned;
  const adapter = params.has("attempt-id");
  const names: readonly string[] = adapter ? adapterNames : githubNames;
  if (
    !namedOnce(params, names) ||
    params.get("judged") !== null ||
    (adapter && params.get("attempt") !== null)
  )
    return refused(ciProofRefusal);
  if (adapter) {
    const runId = adapterText(params.get("run"));
    const attemptId = adapterText(params.get("attempt-id"));
    const branch = params.get("run-branch") ?? "";
    if (
      runId === undefined ||
      attemptId === undefined ||
      !isSafeBranchName(branch)
    )
      return refused(ciProofRefusal);
    return { kind, runId, attemptId, branch, revision };
  }
  const runId = runNumber(params.get("run"));
  const runAttempt = runNumber(params.get("attempt"));
  if (runId === undefined || runAttempt === undefined)
    return refused(ciProofRefusal);
  return { kind, runId, runAttempt, revision };
}

// What a CI proof read names as being read before any request is asked.
export function readingIntentCiProofOf(
  source: PublishedSource,
  read: IntentCiProofRead,
): string {
  return readingCiProofOf(read, source.repository);
}

// Performs one CI proof read: it always answers, with the reason when no
// proof can be shown. `folderOf` resolves the project folder an adapter
// attempt's proof is asked in.
export async function performIntentCiProofRead(
  source: PublishedSource,
  read: IntentCiProofRead,
  signal: AbortSignal,
  folderOf: (source: PublishedSource) => string,
): Promise<Outcome> {
  const subject = ciProofSubjectOf(read);
  const proof = isAdapterProofAttempt(subject)
    ? await readCiAdapterProof(
        source.repository,
        folderOf(source),
        subject,
        signal,
      )
    : await readCiProofArtifact(source.repository, subject, signal);
  const answer: IntentCiProofAnswer = {
    ...subject,
    checkedAt: new Date().toISOString(),
    proof,
  };
  return answered(answer);
}
