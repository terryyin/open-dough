// Remembered done-story CI comparison answers for this dashboard process
// (`./intentCiComparisonRead.ts`): keyed by repository and story identity.
// Final, and remembered, when every endpoint is a completed build or a final
// gap (`finalSlot`, `./revisionBuildSlot.ts`; ADR 0008: disposable derived
// view). A completed build may carry a timing reason. Unavailable answers or
// slots, running endpoints, gaps awaiting a later trunk build, and Taken
// (provisional) answers are read afresh. The production reader also withholds
// answers whose internal Landed resolution is pending, using the shared
// history/comparison judgment before endpoint projection drops proof details.
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import { rememberedByKey } from "./rememberedByKey.ts";
import { finalSlot } from "./revisionBuildSlot.ts";

export function ciComparisonAnswerKey(
  repository: string,
  identity: string,
): string {
  return `${repository.toLowerCase()}#${identity}`;
}

const remembered = rememberedByKey<StoryCiComparisonAnswer>();

export function keptCiComparisonAnswer(
  key: string,
): StoryCiComparisonAnswer | undefined {
  return remembered.get(key);
}

export function rememberCiComparisonAnswer(
  key: string,
  answer: StoryCiComparisonAnswer,
): void {
  if (!isFinalCiComparisonAnswer(answer)) return;
  remembered.set(key, answer);
}

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
  remembered.clear();
}
