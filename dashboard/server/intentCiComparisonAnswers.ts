// Remembered done-story CI comparison answers for this dashboard process
// (`./intentCiComparisonRead.ts`): keyed by repository and story identity.
// Immutable once every endpoint is a completed build or a final gap (ADR
// 0008: disposable derived view). Running endpoints, gaps awaiting a later
// trunk build, and Taken (provisional) answers are never remembered.
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

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
  if (!isImmutableCiComparisonAnswer(answer)) return;
  remembered.set(key, answer);
}

export function isImmutableCiComparisonAnswer(
  answer: StoryCiComparisonAnswer,
): boolean {
  if (answer.kind !== "comparison") return true;
  // Taken answers follow the live tip; never freeze them.
  if (answer.phase === "taken") return false;
  return [answer.baseline, answer.branch, answer.landed].every(
    (slot) =>
      slot.kind !== "running" &&
      !(slot.kind === "none" && slot.awaitingLaterBuild === true),
  );
}

export function clearCiComparisonAnswers(): void {
  remembered.clear();
}
