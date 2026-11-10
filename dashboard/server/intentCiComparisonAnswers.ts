// Remembered done-story CI comparison answers for this dashboard process
// (`./intentCiComparisonRead.ts`): keyed by repository and story identity.
// Final, and remembered, when every endpoint is a completed build or a final
// gap (`finalSlot`, `./revisionBuildSlot.ts`; ADR 0008: disposable derived
// view). A completed build may carry a timing reason. Unavailable answers or
// slots, running endpoints, gaps awaiting a later trunk build, and Taken
// (provisional) answers are read afresh. The production reader also withholds
// answers whose internal Landed resolution is pending, using the shared
// history/comparison judgment before endpoint projection drops proof details.
// Retained unused Landed answers that only named an equivalent build's missing
// proof summary reopen like pending: Check again and the next same-process
// read re-resolve them under timed wall-time reuse without proof.
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import { rememberedByKey, type RememberedByKey } from "./rememberedByKey.ts";
import { finalSlot } from "./revisionBuildSlot.ts";

export function ciComparisonAnswerKey(
  repository: string,
  identity: string,
): string {
  return `${repository.toLowerCase()}#${identity}`;
}

// Old final Landed gap: confirmed skip unused only because the equivalent
// build published no CI proof summary (wording from
// `equivalentBuildUnavailableLine` for reason `none`).
const unusedEquivalentNoProof =
  /^The equivalent build at .+ published no CI proof summary\.$/;

export function recoverableUnusedNoProofLanded(
  answer: StoryCiComparisonAnswer,
): boolean {
  if (answer.kind !== "comparison") return false;
  const { landed } = answer;
  return (
    landed.kind === "none" &&
    landed.requestedStatus?.kind === "skipped" &&
    unusedEquivalentNoProof.test(landed.explanation)
  );
}

export function keptCiComparisonAnswer(
  key: string,
): StoryCiComparisonAnswer | undefined {
  return answers.get(key);
}

export function rememberCiComparisonAnswer(
  key: string,
  answer: StoryCiComparisonAnswer,
): void {
  answers.set(key, answer);
}

export type CiComparisonAnswers = Pick<
  RememberedByKey<StoryCiComparisonAnswer>,
  "get" | "set" | "clear"
>;

// Revalidate legacy missing-proof gaps once. A fresh final gap can have the
// same wording when its equivalent failed or had no usable timing; that
// actual resolution is final under finalSlot, not another legacy answer.
export function ciComparisonAnswers(
  remembered = rememberedByKey<StoryCiComparisonAnswer>(),
): CiComparisonAnswers {
  let resolved = new WeakSet<StoryCiComparisonAnswer>();
  return {
    get(key) {
      const answer = remembered.get(key);
      return answer !== undefined &&
        recoverableUnusedNoProofLanded(answer) &&
        !resolved.has(answer)
        ? undefined
        : answer;
    },
    set(key, answer) {
      if (!isFinalCiComparisonAnswer(answer)) return;
      resolved.add(answer);
      remembered.set(key, answer);
    },
    clear() {
      remembered.clear();
      resolved = new WeakSet<StoryCiComparisonAnswer>();
    },
  };
}

const answers = ciComparisonAnswers();

export function isFinalCiComparisonAnswer(
  answer: StoryCiComparisonAnswer,
): boolean {
  if (answer.kind === "unavailable") return false;
  // Taken answers follow the live tip; never freeze them.
  if (answer.phase === "taken") return false;
  return [answer.baseline, answer.branch, answer.landed].every(
    (slot) => finalSlot(slot) !== undefined,
  );
}

export function clearCiComparisonAnswers(): void {
  answers.clear();
}
