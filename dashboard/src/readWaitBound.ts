// The shared wait bound (`./authenticatedReadRules.ts`'s `readWaitLimitMs`) on
// one read the page makes: of a snapshot (`./publishedWork.ts`), or of only
// the progress on moved story branches (`./movedBranchProgress.ts`).

import { readWaitLimitMs } from "./authenticatedReadRules";

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
