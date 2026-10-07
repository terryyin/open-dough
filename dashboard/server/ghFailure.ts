// Why a `gh` call did not answer, for the local authenticated read boundary
// (`./ghRead.ts`): only these fixed categories — and, for an HTTP answer, its
// three-digit status — ever leave the invocation; raw stderr may name local
// paths or echo configuration and is never forwarded.

// Why a `gh` call did not answer, as far as this boundary can say without
// repeating anything `gh` printed.
export type GhFailureReason =
  | { readonly kind: "not-logged-in" }
  | { readonly kind: "http"; readonly status: number }
  | {
      readonly kind: "rate-limited";
      readonly status: number;
      // How long this process waits before asking GitHub again
      // (`./readAdmission.ts`): the wait GitHub directed
      // (`./rateLimitDirection.ts`), already validated and bounded, never a
      // header value as GitHub sent it; or, marked `backoff`, this process's
      // own when GitHub directed none.
      readonly waitSeconds: number;
      readonly backoff?: true;
    }
  // Not asked of GitHub at all: a rate limit GitHub met earlier still
  // holds back every read of this process (`./readAdmission.ts`) for these
  // whole seconds. Never GitHub's status, so never an absence either.
  | { readonly kind: "held-back"; readonly waitSeconds: number }
  | { readonly kind: "unreachable" }
  | { readonly kind: "no-commit" }
  | { readonly kind: "timed-out" }
  | { readonly kind: "not-installed" }
  | { readonly kind: "failed" };

export class GhFailure extends Error {
  readonly reason: GhFailureReason;
  constructor(reason: GhFailureReason) {
    super(`gh did not answer: ${reason.kind}`);
    this.reason = reason;
  }
}

// A read GitHub's rate limit stopped: GitHub refused it, or a rate limit met
// earlier held it back unasked. Either says nothing of what was asked, so it
// fails the read rather than standing for any answer.
export type RateLimitStop = Extract<
  GhFailureReason,
  { readonly kind: "rate-limited" | "held-back" }
>;

export function rateLimitStop(error: unknown): RateLimitStop | undefined {
  if (!(error instanceof GhFailure)) return undefined;
  const { reason } = error;
  return reason.kind === "rate-limited" || reason.kind === "held-back"
    ? reason
    : undefined;
}

// A `gh` answer read as JSON; an answer that is not JSON is a failed call.
export function parsedJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new GhFailure({ kind: "failed" });
  }
}

// Whether a `gh` call failed only because GitHub has no such thing (`404`).
export function isNotFound(error: unknown): boolean {
  return (
    error instanceof GhFailure &&
    error.reason.kind === "http" &&
    error.reason.status === 404
  );
}
