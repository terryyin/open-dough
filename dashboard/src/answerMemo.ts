// In-memory answers fixed by their read's full identity, for one browser
// session, beside the file text cache (`./fileContentCache.ts`): the Intent
// locations and Test Optimization Candidates record of one revision
// (`./authenticatedIntentRead.ts`, `./authenticatedIntentCandidatesRead.ts`)
// and a story file's diff and texts between two trees (`./useReviewRead.ts`).
// A read in flight under the same identity is joined (`./sharedRead.ts`).
// Only an answer its reader says is fixed is kept: failures, limited and
// refused reads (`./readProblem.ts`, `./readingLimit.ts`) and answers that
// would read differently when asked again are asked again. A kept answer can
// be shown as its reader renders (`keptAnswer`), without waiting a moment for
// the memo's promise. Retained answers
// stay within a byte budget, least recently used first out
// (`./byteBudgetedMemo.ts`). No persistence.

import { byteBudgetedMemo } from "./byteBudgetedMemo.ts";
import { joinRead } from "./sharedRead.ts";

export const answerMemoBudgetBytes = 8 * 1024 * 1024;

const utf8 = new TextEncoder();

const memo = byteBudgetedMemo<unknown>(
  answerMemoBudgetBytes,
  (answer) => utf8.encode(JSON.stringify(answer)).byteLength,
);

// The answer under `key`: kept, joined while in flight, or asked with `ask`
// and kept when `fixed` says so. `signal` is this reader's departure.
export function memoizedAnswer<T>(
  key: string,
  ask: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  fixed: (answer: T) => boolean,
): Promise<T> {
  const kept = keptAnswer(key);
  if (kept !== undefined) return Promise.resolve(kept as T);
  return joinRead(
    `answer\0${key}`,
    async (shared) => {
      const answer = await ask(shared);
      if (fixed(answer)) memo.set(key, answer);
      return answer;
    },
    signal,
  );
}

// The answer kept under `key`, if any.
export function keptAnswer(key: string): unknown {
  return memo.get(key);
}

export function retainedAnswerBytes(): number {
  return memo.retainedBytes();
}

export function forgetAnswers(): void {
  memo.clear();
}
