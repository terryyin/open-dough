// The shared wait bound (`./authenticatedReadRules.ts`'s `readWaitLimitMs`) on
// one read the page makes: of a snapshot (`./publishedWorkRead.ts`), or of only
// the progress on moved story branches (`./movedBranchProgress.ts`).

import { readWaitLimitMs } from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";

// How a read, or one detail of it, still unanswered at the bound is said.
export const unansweredWithinReadWait = `GitHub did not answer within ${readWaitLimitMs / 1000} seconds`;

// Why one later detail of a read, such as a human or a slice clock, is a gap:
// a read problem says why itself; a read still unanswered when `signal`
// aborted (the bound) was so `while reading` what it names; any other failure
// is said as `unreadable`.
export function detailGapProblem(
  error: unknown,
  signal: AbortSignal,
  reading: string,
  unreadable: string,
): string {
  if (error instanceof ReadProblem) {
    return error.message;
  }
  return signal.aborted
    ? `${unansweredWithinReadWait} while reading ${reading}.`
    : unreadable;
}

// Runs `read` with a signal that aborts when `signal` does or when the bound
// passes, whichever comes first; `bound` aborts only when the bound passed.
export async function withinReadWait<T>(
  signal: AbortSignal,
  read: (untilEither: AbortSignal, bound: AbortSignal) => Promise<T>,
): Promise<T> {
  const waitLimit = new AbortController();
  const waiting = setTimeout(() => {
    waitLimit.abort();
  }, readWaitLimitMs);
  try {
    return await read(
      AbortSignal.any([signal, waitLimit.signal]),
      waitLimit.signal,
    );
  } finally {
    clearTimeout(waiting);
  }
}
