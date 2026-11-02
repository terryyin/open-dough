// Intent's CI status read for the local authenticated read boundary
// (`./authenticatedRead.ts`): the selected check's judgment of one branch of
// the published source (`intent=ci-status`), the configured ref unless the
// request names a `judged` branch the safe-branch rule accepts. It names no
// revision: the judgment resolves the branch head from its own commit
// listing (`./baseCiJudgment.ts`, the launch's rule). The project folder
// supplies the CI settings (`./projectFolders.ts`). Anything else is
// refused here before any `gh` call.

import {
  isSafeBranchName,
  readingCiStatusOf,
} from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { judgeBranchCi, type BaseCiJudgment } from "./baseCiJudgment.ts";
import { intentReadMixedParameters } from "./intentReadParameters.ts";
import { projectFolder } from "./projectFolders.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiStatusRead = {
  readonly kind: "intent-ci-status";
  // The `judged` branch; undefined judges the source's configured ref.
  readonly judged?: string;
};

// What a CI status read answers: the judged branch, when it was checked,
// and the judgment.
export type IntentCiStatusAnswer = {
  readonly branch: string;
  readonly checkedAt: string;
} & BaseCiJudgment;

const ciStatusRefusal =
  "A CI status read names only the Intent request and, optionally, one judged branch.";

const unsafeBranchRefusal = "The branch name is not one this dashboard reads.";

// The CI status read a request names, undefined when it names none.
export function parseIntentCiStatusRead(
  params: URLSearchParams,
): IntentCiStatusRead | RefusedParameters | undefined {
  if (params.get("intent") !== "ci-status") return undefined;
  if (
    params.getAll("intent").length !== 1 ||
    params.getAll("judged").length > 1 ||
    params.get("revision") !== null ||
    intentReadMixedParameters.some((name) => params.get(name) !== null)
  ) {
    return refused(ciStatusRefusal);
  }
  const judged = params.get("judged");
  if (judged === null) return { kind: "intent-ci-status" };
  if (!isSafeBranchName(judged)) return refused(unsafeBranchRefusal);
  return { kind: "intent-ci-status", judged };
}

function judgedBranch(source: PublishedSource, read: IntentCiStatusRead) {
  return read.judged ?? source.ref;
}

// What a CI status read names as being read before any request is asked.
export function readingIntentCiStatusOf(
  source: PublishedSource,
  read: IntentCiStatusRead,
): string {
  return readingCiStatusOf(judgedBranch(source, read), source.repository);
}

// Performs one CI status read: the judgment always answers, with an unread
// judgment naming its reason when the CI could not be read.
export async function performIntentCiStatusRead(
  source: PublishedSource,
  read: IntentCiStatusRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const branch = judgedBranch(source, read);
  const judgment = await judgeBranchCi(
    source,
    projectFolder(source),
    branch,
    signal,
  );
  return answered({
    branch,
    checkedAt: new Date().toISOString(),
    ...judgment,
  });
}
