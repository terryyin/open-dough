// Local authenticated read boundary for Vite: every catalog source's ref is
// resolved, and its backlog (or one reachability-checked canonical/plan path)
// read, through the launching person's local `gh` authentication. A request
// may instead name an already resolved revision to read that revision's
// backlog, ask only whether the ref still names the revision shown and which
// heads the story branches recorded there name now, read
// the agent profiles its directory listing names beside the backlog, or the
// done catalog published there and the done records it lists
// (`./doneCatalogRead.ts`), the Intent locations configured in the project
// settings (`./intentLocationsRead.ts`), the Test Optimization Candidates
// record (`./intentCandidatesRead.ts`), ask when one reachable record was
// last committed there, or which commit added a listed profile, when, and who
// committed it (`./ghProfileAddition.ts`), or resolve the story branch a Taken
// entry's profile records there and read that entry's plan, or its last
// commit, at the head found, or ask whether it contains a launch's accepted
// publication (`./containmentRead.ts`).
// Request refusal: `./localOrigin.ts`; which read a request asks for:
// `./requestedRead.ts`; performing it: `./performedRead.ts`, on a story
// branch `./performedBranchRead.ts`, and what it comes to `./readOutcome.ts`;
// gh calls: `./ghRead.ts`, `./ghRevision.ts`, and `./ghContents.ts`; path
// reachability: `./reachablePaths.ts`, `./recordsBesideBacklog.ts`, and
// `./branchReachability.ts`; pinned-text memo: `./pinnedTexts.ts`; revision
// checks: `./performedRevisionCheck.ts` and `./revisionChecks.ts`; resolved
// branch heads: `./branchHeads.ts`; one request's wait for its `gh`
// answers: `./trackedGh.ts`; failure wording and any directed wait:
// `./readFailureMessage.ts`; bounded local failure history:
// `./readDiagnostics.ts`, kept across processes in `./incidentRecord.ts`;
// where an answer's time went, in its `Server-Timing` header:
// `./readTiming.ts`. Beside it, a second path serves
// the GitHub avatar of the human credited for one listed profile
// (`./avatarRead.ts`, images kept by `./avatarImages.ts`), and a third
// inspects recent failed upstream reads without asking GitHub.
// Node-only; never returns credentials, raw stderr, or an arbitrary path or
// image proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { performAvatarRead, type AvatarOutcome } from "./avatarRead.ts";
import { perform, type Boundary } from "./performedRead.ts";
import {
  diagnosticsForSource,
  type DiagnosticOutcome,
} from "./readDiagnostics.ts";
import type { Outcome } from "./readOutcome.ts";
import { parseRequestedRead } from "./requestedRead.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProject } from "./projectConfiguration.ts";
// The endpoint paths, shared with the browser.
import {
  authenticatedAvatarEndpoint,
  authenticatedReadDiagnosticsEndpoint,
} from "../src/authenticatedReadRules.ts";

// Only a request naming a configured project held by
// `./projectConfiguration.ts` is answered; there is no arbitrary
// repository, path, or shell command acceptance here. Extra file reads must
// name a pinned revision and a path reachable from that revision's records.
// The catalog source an accepted request names, or why it is refused: both
// endpoints answer only a local same-origin GET naming a known source.
export function admitted(
  req: IncomingMessage,
  params: URLSearchParams,
): PublishedSource | Extract<Outcome, { readonly kind: "refused" }> {
  try {
    verifyLocalOrigin(req);
  } catch (error) {
    if (error instanceof RefusedRequest) {
      return { kind: "refused", status: error.status, message: error.message };
    }
    throw error;
  }
  if (req.method !== "GET") {
    return {
      kind: "refused",
      status: 405,
      message: "Only GET is accepted here.",
    };
  }
  const id = params.get("source");
  const source = id === null ? undefined : configuredProject(id);
  return (
    source ?? {
      kind: "refused",
      status: 404,
      message: "Unknown catalog source.",
    }
  );
}

export async function answer(
  req: IncomingMessage,
  boundary: Boundary,
  url: URL,
): Promise<Outcome | AvatarOutcome | DiagnosticOutcome> {
  const source = admitted(req, url.searchParams);
  if ("kind" in source) {
    return source;
  }
  if (url.pathname === authenticatedReadDiagnosticsEndpoint) {
    // Local inspection only: never asks GitHub.
    return { kind: "diagnostics", ...(await diagnosticsForSource(source.id)) };
  }
  if (url.pathname === authenticatedAvatarEndpoint) {
    return performAvatarRead(req, boundary, source, url.searchParams);
  }
  const read = parseRequestedRead(url.searchParams);
  return read.kind === "refused" ? read : perform(req, boundary, source, read);
}

export function respond(
  res: ServerResponse,
  outcome: Outcome | AvatarOutcome | DiagnosticOutcome,
  serverTiming: string,
): void {
  // Disconnect is a cancellation trigger; a closed response has no audience.
  if (res.writableEnded || res.destroyed) {
    return;
  }
  // Never cache: answers may differ per invocation and must not linger. An
  // avatar is kept by this process instead.
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    "Server-Timing": serverTiming,
  };
  if (outcome.kind === "image") {
    res.writeHead(200, {
      ...headers,
      "Content-Type": outcome.image.contentType,
      "X-Content-Type-Options": "nosniff",
    });
    res.end(outcome.image.bytes);
    return;
  }
  if (outcome.kind === "diagnostics") {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({ failures: outcome.failures, record: outcome.record }),
    );
    return;
  }
  if (outcome.kind === "answered") {
    res.writeHead(200, headers);
    res.end(JSON.stringify(outcome.answer));
    return;
  }
  res.writeHead(outcome.kind === "refused" ? outcome.status : 502, headers);
  // An undefined directed wait or recovery eligibility is left out of the
  // JSON answer altogether; the browser validates either as typed data.
  res.end(
    JSON.stringify({
      error: outcome.message,
      retryAfterSeconds:
        outcome.kind === "failed" ? outcome.retryAfterSeconds : undefined,
      recovery: outcome.kind === "failed" ? outcome.recovery : undefined,
    }),
  );
}
