// Local authenticated read boundary for Vite: every catalog source's ref is
// resolved, and its backlog (or one reachability-checked canonical/plan path)
// read, through the launching person's local `gh` authentication. A request
// may instead name an already resolved revision to read that revision's
// backlog, ask only whether the ref still names the revision shown and which
// heads the story branches recorded there name now, read
// the agent profiles its directory listing names beside the backlog, or the
// done catalog published there and the done records it lists
// (`./doneCatalogRead.ts`), ask
// when one reachable record was last committed there, or which commit added
// a listed profile, when, and who committed it (`./ghProfileAddition.ts`), or
// resolve the story branch a Taken entry's profile records there and read
// that entry's plan, or its last commit, at the head found, or ask whether it
// contains a launch's accepted publication (`./containmentRead.ts`).
// Request refusal: `./localOrigin.ts`; which read a request asks for:
// `./requestedRead.ts`; performing it: `./performedRead.ts`, on a story
// branch `./performedBranchRead.ts`, and what it comes to `./readOutcome.ts`;
// gh calls: `./ghRead.ts`, `./ghRevision.ts`, and `./ghContents.ts`; path
// reachability: `./reachablePaths.ts`, `./recordsBesideBacklog.ts`, and
// `./branchReachability.ts`; pinned-text memo: `./pinnedTexts.ts`; revision
// checks: `./performedRevisionCheck.ts` and `./revisionChecks.ts`; resolved
// branch heads: `./branchHeads.ts`; one request's wait for its `gh`
// answers: `./trackedGh.ts`; failure wording and any directed wait:
// `./readFailureMessage.ts`. Beside it, a second path serves the GitHub
// avatar of the human credited for one listed profile (`./avatarRead.ts`,
// images kept by `./avatarImages.ts`).
// Node-only; never returns credentials, raw stderr, or an arbitrary path or
// image proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { PinnedTexts } from "./pinnedTexts.ts";
import { RevisionChecks } from "./revisionChecks.ts";
import { BranchHeads } from "./branchHeads.ts";
import { AvatarImages } from "./avatarImages.ts";
import { performAvatarRead, type AvatarOutcome } from "./avatarRead.ts";
import { perform, type Boundary } from "./performedRead.ts";
import type { Outcome } from "./readOutcome.ts";
import { parseRequestedRead } from "./requestedRead.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProject } from "./projectConfiguration.ts";
// The endpoint paths, shared with the browser.
import {
  authenticatedAvatarEndpoint,
  authenticatedReadEndpoint,
} from "../src/authenticatedReadRules.ts";

// Only a request naming a configured project held by
// `./projectConfiguration.ts` is answered; there is no arbitrary
// repository, path, or shell command acceptance here. Extra file reads must
// name a pinned revision and a path reachable from that revision's records.
// The catalog source an accepted request names, or why it is refused: both
// endpoints answer only a local same-origin GET naming a known source.
function admitted(
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

async function answer(
  req: IncomingMessage,
  boundary: Boundary,
  url: URL,
): Promise<Outcome | AvatarOutcome> {
  const source = admitted(req, url.searchParams);
  if ("kind" in source) {
    return source;
  }
  if (url.pathname === authenticatedAvatarEndpoint) {
    return performAvatarRead(req, boundary, source, url.searchParams);
  }
  const read = parseRequestedRead(url.searchParams);
  return read.kind === "refused" ? read : perform(req, boundary, source, read);
}

function respond(res: ServerResponse, outcome: Outcome | AvatarOutcome): void {
  // Disconnect is a cancellation trigger; a closed response has no audience.
  if (res.writableEnded || res.destroyed) {
    return;
  }
  // Never cache: answers may differ per invocation and must not linger. An
  // avatar is kept by this process instead.
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
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

// Mounted identically by both Vite launch modes. Requests outside these
// endpoints' exact paths are passed on untouched; only a request that names
// one is ever inspected, let alone answered.
export function installAuthenticatedReadMiddleware(
  middlewares: Connect.Server,
): () => void {
  const boundary: Boundary = {
    tracked: new Set<AbortController>(),
    pinned: new PinnedTexts(),
    checks: new RevisionChecks(),
    branches: new BranchHeads(),
    avatars: new AvatarImages(),
  };
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (
      url.pathname !== authenticatedReadEndpoint &&
      url.pathname !== authenticatedAvatarEndpoint
    ) {
      next();
      return;
    }
    void answer(req, boundary, url).then((outcome) => {
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
