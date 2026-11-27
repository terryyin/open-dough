// Why a `gh` call did not answer, for the local authenticated read boundary
// (`./ghRead.ts`): only these fixed categories — and, for an HTTP answer, its
// three-digit status — ever leave the invocation; raw stderr may name local
// paths or echo configuration and is never forwarded.

import {
  GhFailure as GhRequestFailed,
  type GhRequestFailure,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";

// Why a `gh` call did not answer, as far as this boundary can say without
// repeating anything `gh` printed: how the request itself failed
// (`github-request-answer.mjs`), -- `no-commit` -- an answer in which the
// boundary found no commit, or -- `unavailable` -- a verified-origin trunk
// check (`./verifiedOriginTrunk.ts`) that could not establish the trunk:
// origin unavailable, the trunk branch missing, or its backlog unreadable.
export type GhFailureReason =
  | GhRequestFailure
  | { readonly kind: "no-commit" }
  | { readonly kind: "unavailable"; readonly part: UnavailableTrunkPart };

export type UnavailableTrunkPart = "origin" | "trunk" | "backlog";

// The installed request source's one failure, carrying this boundary's
// reasons: a request's wait ended with it is recognised there as well.
export type GhFailure = GhRequestFailed<GhFailureReason>;
export const GhFailure: new (reason: GhFailureReason) => GhFailure =
  GhRequestFailed;

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
