// The shared wait bound (`./authenticatedReadRules.ts`'s `readWaitLimitMs`) on
// one read the page makes: of a snapshot (`./publishedWorkRead.ts`), or of only
// the progress on moved story branches (`./movedBranchProgress.ts`).

import { readWaitLimitMs } from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";

// How a read, or one detail of it, still unanswered at the bound is said.
export const unansweredWithinReadWait = `GitHub did not answer within ${readWaitLimitMs / 1000} seconds`;

// Typed meaning a gap projection retains for recovery: the person-facing
// problem, any rate-limit resume time, transient eligibility, whether the
// owned bound interrupted the question, and whether the caller departed
// without the bound (not a settled observation outcome).
export type GapCause = {
  readonly problem: string;
  readonly resumesAt?: Date;
  readonly recovery?: "transient";
  readonly bound?: true;
  readonly departed?: true;
};

// An unavailable fact as gap projections show it: person-facing problem plus
// typed failure meaning retained for recovery. Departure is never projected.
export type UnavailableGap = {
  readonly status: "unavailable";
  readonly problem: string;
  readonly resumesAt?: Date;
  readonly recovery?: "transient";
  readonly bound?: true;
};

// Optional typed failure fields a gap or unread projection retains for
// recovery (never departure).
export function gapRetention(
  cause: Pick<GapCause, "resumesAt" | "recovery" | "bound">,
): Pick<UnavailableGap, "resumesAt" | "recovery" | "bound"> {
  return {
    ...(cause.resumesAt !== undefined ? { resumesAt: cause.resumesAt } : {}),
    ...(cause.recovery !== undefined ? { recovery: cause.recovery } : {}),
    ...(cause.bound ? { bound: true as const } : {}),
  };
}

export function unavailableGap(cause: GapCause): UnavailableGap {
  return {
    status: "unavailable",
    problem: cause.problem,
    ...gapRetention(cause),
  };
}

// Why a read GitHub's rate limit stopped is a gap: the limit's own wording
// and the time the page's limit ends (`./readingLimit.ts`), as its notice says
// it; undefined when anything else stopped it.
export function limitGapProblem(error: unknown): string | undefined {
  return error instanceof ReadProblem && error.resumesAt !== undefined
    ? `${error.message} Limited until ${error.resumesAt.toLocaleString()}.`
    : undefined;
}

// Typed cause of one later detail's gap. `untilEither` ends on caller
// departure or the owned bound; `bound` ends only when the owned bound
// passed. Departure without the bound is marked so outcomes do not settle it.
export function gapCauseOf(
  error: unknown,
  untilEither: AbortSignal,
  bound: AbortSignal,
  reading: string,
  unreadable: string,
): GapCause {
  if (error instanceof ReadProblem) {
    return {
      problem: limitGapProblem(error) ?? error.message,
      ...(error.resumesAt !== undefined ? { resumesAt: error.resumesAt } : {}),
      ...(error.recovery !== undefined ? { recovery: error.recovery } : {}),
    };
  }
  if (bound.aborted) {
    return {
      problem: `${unansweredWithinReadWait} while reading ${reading}.`,
      recovery: "transient",
      bound: true,
    };
  }
  if (untilEither.aborted) {
    return { problem: unreadable, departed: true };
  }
  return { problem: unreadable };
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
