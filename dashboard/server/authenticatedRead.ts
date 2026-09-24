// Local authenticated read boundary for Vite: every catalog source's ref is
// resolved, and its backlog (or one reachability-checked canonical/plan path)
// read, through the launching person's local `gh` authentication. A request
// may instead name an already resolved revision to read that revision's
// backlog, ask only whether the ref still names the revision shown, read
// the agent profiles its directory listing names beside the backlog, ask
// when one reachable record or listed profile was last committed there, or
// resolve the story branch a Taken entry's profile records there and read
// that entry's plan, or its last commit, at the head found.
// Request refusal: `./localOrigin.ts`; which read a request asks for:
// `./requestedRead.ts`; performing it: `./performedRead.ts`, on a story
// branch `./performedBranchRead.ts`, and what it comes to `./readOutcome.ts`;
// gh calls: `./ghRead.ts`, `./ghRevision.ts`, and `./ghContents.ts`; path
// reachability: `./reachablePaths.ts` and `./branchReachability.ts`;
// pinned-text memo: `./pinnedTexts.ts`; revision checks:
// `./revisionChecks.ts`; resolved branch heads: `./branchHeads.ts`; one
// request's `gh` lifetime: `./trackedGh.ts`; failure wording and any directed
// wait: `./readFailureMessage.ts`. Node-only; never returns credentials, raw
// stderr, or an arbitrary path proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import { RefusedRead, verifyLocalOrigin } from "./localOrigin";
import { PinnedTexts } from "./pinnedTexts";
import { RevisionChecks } from "./revisionChecks";
import { BranchHeads } from "./branchHeads";
import { perform, type Boundary } from "./performedRead";
import type { Outcome } from "./readOutcome";
import { parseRequestedRead } from "./requestedRead";
import { sourceById } from "../src/publishedSource";
// The one endpoint path, shared with the browser reader.
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules";

// Only a request naming a catalog source already known to
// `../src/publishedSource.ts` is answered; there is no arbitrary
// repository, path, or shell command acceptance here. Extra file reads must
// name a pinned revision and a path reachable from that revision's records.
async function answer(
  req: IncomingMessage,
  boundary: Boundary,
): Promise<Outcome> {
  try {
    verifyLocalOrigin(req);
  } catch (error) {
    if (error instanceof RefusedRead) {
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
  const url = new URL(req.url ?? "", "http://placeholder");
  const id = url.searchParams.get("source");
  const source = id === null ? undefined : sourceById(id);
  if (!source) {
    return { kind: "refused", status: 404, message: "Unknown catalog source." };
  }
  const read = parseRequestedRead(url.searchParams);
  return read.kind === "refused" ? read : perform(req, boundary, source, read);
}

function respond(res: ServerResponse, outcome: Outcome): void {
  // Disconnect is a cancellation trigger; a closed response has no audience.
  if (res.writableEnded || res.destroyed) {
    return;
  }
  // Never cache: answers may differ per invocation and must not linger.
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };
  if (outcome.kind === "answered") {
    res.writeHead(200, headers);
    res.end(JSON.stringify(outcome.answer));
    return;
  }
  res.writeHead(outcome.kind === "refused" ? outcome.status : 502, headers);
  // An undefined directed wait is left out of the JSON answer altogether.
  res.end(
    JSON.stringify({
      error: outcome.message,
      retryAfterSeconds:
        outcome.kind === "failed" ? outcome.retryAfterSeconds : undefined,
    }),
  );
}

function matchesEndpoint(req: IncomingMessage): boolean {
  const url = new URL(req.url ?? "", "http://placeholder");
  return url.pathname === authenticatedReadEndpoint;
}

// Mounted identically by both Vite launch modes. Requests outside this
// endpoint's exact path are passed on untouched; only a request that names it
// is ever inspected, let alone answered.
export function installAuthenticatedReadMiddleware(
  middlewares: Connect.Server,
): () => void {
  const boundary: Boundary = {
    tracked: new Set<AbortController>(),
    pinned: new PinnedTexts(),
    checks: new RevisionChecks(),
    branches: new BranchHeads(),
  };
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!matchesEndpoint(req)) {
      next();
      return;
    }
    void answer(req, boundary).then((outcome) => {
      respond(res, outcome);
    });
  };
  middlewares.use(handler);
  return () => {
    for (const controller of boundary.tracked) {
      controller.abort();
    }
    boundary.tracked.clear();
  };
}
