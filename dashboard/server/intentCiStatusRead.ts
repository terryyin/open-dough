// Intent's CI status read for the local authenticated read boundary
// (`./authenticatedRead.ts`): the selected check's judgment of one branch of
// the published source (`intent=ci-status`), the configured ref unless the
// request names a `judged` branch the safe-branch rule accepts. It names no
// revision: the judgment resolves the branch head from its own commit
// listing (`./baseCiJudgment.ts`, the launch's rule). The project folder
// supplies the CI settings (`./projectFolders.ts`). Anything else is
// refused here before any `gh` call.
//
// A fresh read asks CI and keeps a keepable answer in this process
// (`./intentCiStatusAnswers.ts`). The kept form (`kept=1`) answers that
// memory without any CI request, marked so the page cannot present it as
// newly verified. An unread fresh judgment does not overwrite a kept one.

import {
  isSafeBranchName,
  readingCiStatusOf,
} from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration, judgeBranchCi } from "./baseCiJudgment.ts";
import {
  ciStatusAnswerKey,
  keepCiStatusAnswer,
  keptCiStatusAnswer,
  type CiStatusReadingPath,
  type StoredCiStatusAnswer,
} from "./intentCiStatusAnswers.ts";
import { intentReadMixedParameters } from "./intentReadParameters.ts";
import { projectFolder } from "./projectFolders.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiStatusRead = {
  readonly kind: "intent-ci-status";
  // The `judged` branch; undefined judges the source's configured ref.
  readonly judged?: string;
  // When set, answer only what this process already kept for the target;
  // no CI is asked.
  readonly kept?: true;
};

// What a CI status read answers: the judged branch, when it was checked,
// whether this answer is the kept one or a fresh CI read, and the judgment
// (including `ciAdapter` from that judgment's own configuration read, so a
// ciAdapter project needs no second settings read).
export type IntentCiStatusAnswer = StoredCiStatusAnswer & {
  readonly freshness: "kept" | "fresh";
};

// The kept form when this process holds no answer for the target.
export type IntentCiStatusNone = { readonly none: true };

const ciStatusRefusal =
  "A CI status read names only the Intent request and, optionally, one judged branch.";

const keptRefusal =
  "A kept CI status read names only the Intent request, kept=1, and optionally one judged branch.";

const unsafeBranchRefusal = "The branch name is not one this dashboard reads.";

// The CI status read a request names, undefined when it names none.
export function parseIntentCiStatusRead(
  params: URLSearchParams,
): IntentCiStatusRead | RefusedParameters | undefined {
  if (params.get("intent") !== "ci-status") return undefined;
  const keptValues = params.getAll("kept");
  const kept = keptValues.length > 0;
  if (
    params.getAll("intent").length !== 1 ||
    params.getAll("judged").length > 1 ||
    params.get("revision") !== null ||
    intentReadMixedParameters.some((name) => params.get(name) !== null) ||
    (kept && (keptValues.length !== 1 || keptValues[0] !== "1"))
  ) {
    return refused(kept ? keptRefusal : ciStatusRefusal);
  }
  const judged = params.get("judged");
  if (judged === null) {
    return kept
      ? { kind: "intent-ci-status", kept: true }
      : { kind: "intent-ci-status" };
  }
  if (!isSafeBranchName(judged)) return refused(unsafeBranchRefusal);
  return kept
    ? { kind: "intent-ci-status", judged, kept: true }
    : { kind: "intent-ci-status", judged };
}

function judgedBranch(source: PublishedSource, read: IntentCiStatusRead) {
  return read.judged ?? source.ref;
}

function readingPathOf(folderPath: string): CiStatusReadingPath {
  return ciConfiguration(folderPath).adapter !== undefined
    ? "ciAdapter"
    : "github";
}

// What a CI status read names as being read before any request is asked.
export function readingIntentCiStatusOf(
  source: PublishedSource,
  read: IntentCiStatusRead,
): string {
  const branch = judgedBranch(source, read);
  const reading = readingCiStatusOf(branch, source.repository);
  return read.kept === true ? `the kept ${reading}` : reading;
}

// Performs one CI status read: the kept form answers memory without CI; a
// fresh read always answers, with an unread judgment naming its reason when
// the CI could not be read, and keeps a keepable answer for later shows.
export async function performIntentCiStatusRead(
  source: PublishedSource,
  read: IntentCiStatusRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const branch = judgedBranch(source, read);
  const folder = projectFolder(source);
  const key = ciStatusAnswerKey(
    source.repository,
    branch,
    readingPathOf(folder.path),
  );
  if (read.kept === true) {
    const kept = keptCiStatusAnswer(key);
    if (kept === undefined) return answered({ none: true });
    const answer: IntentCiStatusAnswer = { ...kept, freshness: "kept" };
    return answered(answer);
  }
  const judgment = await judgeBranchCi(source, folder, branch, signal);
  const stored: StoredCiStatusAnswer = {
    branch,
    checkedAt: new Date().toISOString(),
    ...judgment,
  };
  keepCiStatusAnswer(key, stored);
  const answer: IntentCiStatusAnswer = { ...stored, freshness: "fresh" };
  return answered(answer);
}
