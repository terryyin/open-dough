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
import { rememberedByKey } from "./rememberedByKey.ts";
import { finalSlot } from "./revisionBuildSlot.ts";

export function ciComparisonAnswerKey(
  repository: string,
  identity: string,
): string {
  return `${repository.toLowerCase()}#${identity}`;
}

const remembered = rememberedByKey<StoryCiComparisonAnswer>();

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
  const answer = remembered.get(key);
  if (answer === undefined) return undefined;
  // Same-process recovery path used for pending Landed: do not serve a
  // retained unused/no-proof Landed answer; the next read re-resolves.
  if (recoverableUnusedNoProofLanded(answer)) return undefined;
  return answer;
}

export function rememberCiComparisonAnswer(
  key: string,
  answer: StoryCiComparisonAnswer,
): void {
  if (!isFinalCiComparisonAnswer(answer)) return;
  remembered.set(key, answer);
}

// Seeds a retained process answer for recovery proofs, including shapes
// ordinary remember refuses so Check again / same-process reopen can run.
export function seedRememberedCiComparisonAnswer(
  key: string,
  answer: StoryCiComparisonAnswer,
): void {
  remembered.set(key, answer);
}

export function isFinalCiComparisonAnswer(
  answer: StoryCiComparisonAnswer,
): boolean {
  if (answer.kind === "unavailable") return false;
  // Taken answers follow the live tip; never freeze them.
  if (answer.phase === "taken") return false;
  // Do not freeze Landed unused solely for equivalent missing proof.
  if (recoverableUnusedNoProofLanded(answer)) return false;
  return [answer.baseline, answer.branch, answer.landed].every(
    (slot) => finalSlot(slot) !== undefined,
  );
}

export function clearCiComparisonAnswers(): void {
  remembered.clear();
}
