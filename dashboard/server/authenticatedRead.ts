// Local authenticated read boundary for Vite: every catalog source's ref is
// resolved, and its backlog (or one reachability-checked canonical/plan path)
// read, through the launching person's local `gh` authentication. Request
// refusal: `./localOrigin.ts`; gh calls: `./ghRead.ts`; path reachability:
// `./reachablePaths.ts`; pinned-text memo: `./pinnedTexts.ts`; failure
// wording: `./readFailureMessage.ts`. Node-only; never returns credentials,
// raw stderr, or an arbitrary path proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import {
  commitShaPattern,
  GhFailure,
  readRepositoryFileViaGh,
  readTimeoutMs,
  resolveRevisionViaGh,
} from "./ghRead";
import { RefusedRead, verifyLocalOrigin } from "./localOrigin";
import { PinnedTexts } from "./pinnedTexts";
import { failureMessage } from "./readFailureMessage";
import {
  parseSafeRepositoryPath,
  pathReachableFromRevision,
} from "./reachablePaths";
import { sourceById } from "../src/publishedSource";
// The one endpoint path, shared with the browser reader.
import { authenticatedReadEndpoint } from "../src/authenticatedReadPath";

type Outcome =
  | { readonly kind: "ok"; readonly revision: string; readonly backlog: string }
  | {
      readonly kind: "ok-file";
      readonly revision: string;
      readonly path: string;
      readonly text: string;
    }
  | {
      readonly kind: "refused";
      readonly status: number;
      readonly message: string;
    }
  | { readonly kind: "failed"; readonly message: string };

async function withTrackedGh<T>(
  req: IncomingMessage,
  tracked: Set<AbortController>,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  tracked.add(controller);
  const timeout = new GhFailure({ kind: "timed-out" });
  const timer = setTimeout(() => {
    controller.abort(timeout);
  }, readTimeoutMs());
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);
  try {
    return await run(controller.signal);
  } catch (error) {
    throw controller.signal.reason === timeout ? timeout : error;
  } finally {
    clearTimeout(timer);
    req.off("close", onClose);
    tracked.delete(controller);
  }
}

// Only a request naming a catalog source already known to
// `../src/publishedSource.ts` is answered; there is no arbitrary
// repository, path, or shell command acceptance here. Extra file reads must
// name a pinned revision and a path reachable from that revision's records.
async function answer(
  req: IncomingMessage,
  tracked: Set<AbortController>,
  pinned: PinnedTexts,
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

  const revisionParam = url.searchParams.get("revision");
  const pathParam = url.searchParams.get("path");
  const wantsFile = revisionParam !== null || pathParam !== null;
  if (wantsFile) {
    if (revisionParam === null || pathParam === null) {
      return {
        kind: "refused",
        status: 400,
        message: "A pinned revision and repository path are both required.",
      };
    }
    if (!commitShaPattern.test(revisionParam)) {
      return {
        kind: "refused",
        status: 400,
        message: "The pinned revision is not a commit sha.",
      };
    }
    const repositoryPath = parseSafeRepositoryPath(pathParam);
    if (repositoryPath === undefined) {
      return {
        kind: "refused",
        status: 400,
        message: "The repository path is not usable.",
      };
    }

    try {
      return await withTrackedGh(req, tracked, async (signal) => {
        const readPinned = pinned.reader(source, revisionParam, signal);
        const reachable = await pathReachableFromRevision(
          source,
          revisionParam,
          repositoryPath,
          readPinned,
        );
        if (!reachable) {
          return {
            kind: "refused" as const,
            status: 404,
            message: "That path is not reachable from this source revision.",
          };
        }
        return {
          kind: "ok-file" as const,
          revision: revisionParam,
          path: repositoryPath,
          text: await readPinned(repositoryPath),
        };
      });
    } catch (error) {
      return {
        kind: "failed",
        message: failureMessage(
          error,
          source,
          `${repositoryPath} at ${revisionParam}`,
        ),
      };
    }
  }

  let reading = `${source.ref} of ${source.repository}`;
  try {
    return await withTrackedGh(req, tracked, async (signal) => {
      const revision = await resolveRevisionViaGh(
        source.repository,
        source.ref,
        signal,
      );
      reading = `${source.backlogPath} at ${revision}`;
      // The membership read always asks for the backlog afresh, and leaves
      // it for the reachability checks of this revision's later detail reads.
      const backlog = await readRepositoryFileViaGh(
        source.repository,
        source.backlogPath,
        revision,
        signal,
      );
      pinned.remember(source, revision, source.backlogPath, backlog);
      return { kind: "ok" as const, revision, backlog };
    });
  } catch (error) {
    return { kind: "failed", message: failureMessage(error, source, reading) };
  }
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
  if (outcome.kind === "ok") {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({ revision: outcome.revision, backlog: outcome.backlog }),
    );
    return;
  }
  if (outcome.kind === "ok-file") {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        revision: outcome.revision,
        path: outcome.path,
        text: outcome.text,
      }),
    );
    return;
  }
  res.writeHead(outcome.kind === "refused" ? outcome.status : 502, headers);
  res.end(JSON.stringify({ error: outcome.message }));
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
  const tracked = new Set<AbortController>();
  const pinned = new PinnedTexts();
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!matchesEndpoint(req)) {
      next();
      return;
    }
    void answer(req, tracked, pinned).then((outcome) => {
      respond(res, outcome);
    });
  };
  middlewares.use(handler);
  return () => {
    for (const controller of tracked) {
      controller.abort();
    }
    tracked.clear();
  };
}
