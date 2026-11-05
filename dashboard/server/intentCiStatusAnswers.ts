// The last CI status answer this dashboard process read for one target
// (`./intentCiStatusRead.ts`): keyed by repository, judged branch and CI
// reading path (GitHub Actions or ciAdapter). Disposable derived state under
// ADR 0008 — rebuilt by reading CI, never a home of project state, never
// persisted under retained-answers. A fresh unread or failed judgment does
// not replace a kept answer. Bounded like the CI proof summary memory
// (`./ciProofArtifact.ts`).

import type { BaseCiJudgment } from "./baseCiNearest.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

export type CiStatusReadingPath = "github" | "ciAdapter";

// What the process keeps: the judgment and when it was retrieved, without a
// freshness mark (that mark is added when the answer is served).
export type StoredCiStatusAnswer = {
  readonly branch: string;
  readonly checkedAt: string;
} & BaseCiJudgment;

// A keepable judgment: every state but unread. Unread means CI could not be
// read, so it must not overwrite a previously retrieved answer.
export function isKeepableCiStatusAnswer(
  answer: StoredCiStatusAnswer,
): boolean {
  return answer.state !== "unread";
}

export function ciStatusAnswerKey(
  repository: string,
  branch: string,
  path: CiStatusReadingPath,
): string {
  return `${repository.toLowerCase()}#${branch}#${path}`;
}

const remembered = rememberedByKey<StoredCiStatusAnswer>();

// What this process last kept under `key`, if any.
export function keptCiStatusAnswer(
  key: string,
): StoredCiStatusAnswer | undefined {
  return remembered.get(key);
}

// Keeps `answer` under `key` when it is keepable; unread leaves any earlier
// answer as it was.
export function keepCiStatusAnswer(
  key: string,
  answer: StoredCiStatusAnswer,
): void {
  if (!isKeepableCiStatusAnswer(answer)) return;
  remembered.replace(key, answer);
}

// Empties the process memory; unit proof only.
export function clearCiStatusAnswers(): void {
  remembered.clear();
}
