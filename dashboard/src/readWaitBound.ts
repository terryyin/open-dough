// The shared wait bound (`./authenticatedReadRules.ts`'s `readWaitLimitMs`) on
// one read the page makes: of a snapshot (`./publishedWorkRead.ts`), or of only
// the progress on moved story branches (`./movedBranchProgress.ts`).

import { readWaitLimitMs } from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";

// How a read, or one detail of it, still unanswered at the bound is said.
export const unansweredWithinReadWait = `GitHub did not answer within ${readWaitLimitMs / 1000} seconds`;

// Why a read GitHub's rate limit stopped is a gap, said one way whether
// GitHub refused it, the server held it back, or the page did not ask: what
// was being read and the time the page's limit ends (`./readingLimit.ts`), as
// its notice says it; undefined when anything else stopped it.
export function limitGapProblem(error: unknown): string | undefined {
  if (!(error instanceof ReadProblem) || error.limited === undefined) {
    return undefined;
  }
  const { reading, resumesAt } = error.limited;
  return `GitHub's rate limit withheld ${reading}. Limited until ${resumesAt.toLocaleString()}.`;
}

// Why one later detail of a read, such as a human or a slice clock, is a gap:
// a read problem says why itself, or is the limit's gap (`limitGapProblem`)
// when GitHub's rate limit stopped it; a read still unanswered when `signal`
// aborted (the bound) was so `while reading` what it names; any other failure
// is said as `unreadable`.
export function detailGapProblem(
  error: unknown,
  signal: AbortSignal,
  reading: string,
  unreadable: string,
): string {
  if (error instanceof ReadProblem) {
    return limitGapProblem(error) ?? error.message;
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
