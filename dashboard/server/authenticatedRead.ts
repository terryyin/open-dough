// Local authenticated read boundary for Vite: every catalog source's ref is
// resolved, and its backlog (or one reachability-checked canonical/plan path)
// read, through the launching person's local `gh` authentication. A request
// may instead name an already resolved revision to read that revision's
// backlog, or ask only whether the ref still names the revision shown.
// Request refusal: `./localOrigin.ts`; which read a request asks for:
// `./requestedRead.ts`; gh calls: `./ghRead.ts`; path
// reachability: `./reachablePaths.ts`; pinned-text memo: `./pinnedTexts.ts`;
// revision checks: `./revisionChecks.ts`; one request's `gh` lifetime:
// `./trackedGh.ts`; failure wording and any directed wait:
// `./readFailureMessage.ts`. Node-only; never returns credentials, raw
// stderr, or an arbitrary path proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import { readRepositoryFileViaGh, resolveRevisionViaGh } from "./ghRead";
import { RefusedRead, verifyLocalOrigin } from "./localOrigin";
import { PinnedTexts } from "./pinnedTexts";
import { RevisionChecks } from "./revisionChecks";
import { withTrackedGh } from "./trackedGh";
import { reportedFailure, type ReportedFailure } from "./readFailureMessage";
import { pathReachableFromRevision } from "./reachablePaths";
import { parseRequestedRead, type RequestedRead } from "./requestedRead";
import { sourceById, type PublishedSource } from "../src/publishedSource";
// The one endpoint path and failure wording, shared with the browser reader.
import {
  authenticatedReadEndpoint,
  readingPathAt,
  readingRefOf,
} from "../src/authenticatedReadRules";

// What a successful read answers, as the browser reader
// (`../src/authenticatedRead.ts`) checks it.
type Answer =
  | { readonly revision: string; readonly backlog: string }
  | { readonly revision: string; readonly path: string; readonly text: string }
  | { readonly revision: string; readonly changed: boolean };

type Outcome =
  | { readonly kind: "answered"; readonly answer: Answer }
  | {
      readonly kind: "refused";
      readonly status: number;
      readonly message: string;
    }
  | ({ readonly kind: "failed" } & ReportedFailure);

type Boundary = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
};

// Performs one allowed read with its `gh` calls tracked, and words any
// failure for this source and what was being read when it failed.
async function perform(
  req: IncomingMessage,
  { tracked, pinned, checks }: Boundary,
  source: PublishedSource,
  read: RequestedRead,
): Promise<Outcome> {
  let reading =
    read.kind === "ref" || read.kind === "revision-check"
      ? readingRefOf(source)
      : readingPathAt(
          read.kind === "file-at" ? read.path : source.backlogPath,
          read.revision,
        );
  try {
    return await withTrackedGh(req, tracked, async (signal) => {
      switch (read.kind) {
        case "revision-check": {
          const revision = await checks.check(source, signal);
          return answered({ revision, changed: revision !== read.since });
        }
        case "backlog-at":
          return answered({
            revision: read.revision,
            backlog: await pinned.reader(
              source,
              read.revision,
              signal,
            )(source.backlogPath),
          });
        case "file-at": {
          const readPinned = pinned.reader(source, read.revision, signal);
          const reachable = await pathReachableFromRevision(
            source,
            read.revision,
            read.path,
            readPinned,
          );
          if (!reachable) {
            return {
              kind: "refused",
              status: 404,
              message: "That path is not reachable from this source revision.",
            };
          }
          return answered({
            revision: read.revision,
            path: read.path,
            text: await readPinned(read.path),
          });
        }
        case "ref": {
          const revision = await resolveRevisionViaGh(
            source.repository,
            source.ref,
            signal,
          );
          reading = readingPathAt(source.backlogPath, revision);
          // The membership read always asks for the backlog afresh, and
          // leaves it for the reachability checks of this revision's later
          // detail reads.
          const backlog = await readRepositoryFileViaGh(
            source.repository,
            source.backlogPath,
            revision,
            signal,
          );
          pinned.remember(source, revision, source.backlogPath, backlog);
          return answered({ revision, backlog });
        }
      }
    });
  } catch (error) {
    return { kind: "failed", ...reportedFailure(error, source, reading) };
  }
}

function answered(answer: Answer): Outcome {
  return { kind: "answered", answer };
}

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
