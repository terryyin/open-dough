// The local, authenticated read boundary for a Vite dev or preview launch:
// one narrow HTTP endpoint that resolves a catalog source's ref and reads its
// backlog file through the local `gh` CLI's existing authentication, instead
// of the browser's unauthenticated public path (`../src/githubSource.ts`).
// This module is Node-only server wiring, mounted from `vite.config.mts`;
// nothing in the browser bundle imports it, and nothing it answers with
// carries credentials, raw process stderr, or an arbitrary repository/path.
//
// The catalog (`../src/publishedSource.ts`) is the one source of project
// identity; this boundary answers only for a source already named there.
// Request refusal lives in `./localOrigin.ts`; the `gh` invocations
// themselves live in `./ghRead.ts`. This module is the orchestration that
// connects them to a mounted HTTP endpoint.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import {
  readBacklogViaGh,
  readTimeoutMs,
  resolveRevisionViaGh,
} from "./ghRead";
import { RefusedRead, verifyLocalOrigin } from "./localOrigin";
import { sourceById } from "../src/publishedSource";
import { privateReadEndpoint } from "../src/privateReadPath";

// Re-exported so existing importers of this module (this boundary's own
// tests) keep one place to find the endpoint path; `../src/privateReadPath.ts`
// is now its one source, so the browser-side reader
// (`../src/privateRead.ts`) can share the exact same literal without
// importing this Node-only module.
export { privateReadEndpoint };

type Outcome =
  | { readonly kind: "ok"; readonly revision: string; readonly backlog: string }
  | {
      readonly kind: "refused";
      readonly status: number;
      readonly message: string;
    }
  | { readonly kind: "failed" };

// Only a request naming a catalog source already known to
// `../src/publishedSource.ts` is answered; there is no arbitrary
// repository, path, or shell command acceptance here.
async function answer(
  req: IncomingMessage,
  tracked: Set<AbortController>,
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

  const controller = new AbortController();
  tracked.add(controller);
  const timer = setTimeout(() => {
    controller.abort();
  }, readTimeoutMs());
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);
  try {
    const revision = await resolveRevisionViaGh(
      source.repository,
      source.ref,
      controller.signal,
    );
    const backlog = await readBacklogViaGh(
      source.repository,
      source.backlogPath,
      revision,
      controller.signal,
    );
    return { kind: "ok", revision, backlog };
  } catch {
    // Never forward a `gh` failure's raw stderr: it may name local paths,
    // request context, or (in principle) echo configuration. The person
    // sees only a safe, generic report.
    return { kind: "failed" };
  } finally {
    clearTimeout(timer);
    req.off("close", onClose);
    tracked.delete(controller);
  }
}

function respond(res: ServerResponse, outcome: Outcome): void {
  // The requester may already be gone (a disconnect is one of this
  // boundary's three cancellation triggers): writing to a closed response
  // would throw rather than reach anyone, so there is nothing left to answer.
  if (res.writableEnded || res.destroyed) {
    return;
  }
  // A private answer is never cached: it may differ per invocation, and it
  // must never linger in an intermediary given what authorized it.
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
  if (outcome.kind === "refused") {
    res.writeHead(outcome.status, headers);
    res.end(JSON.stringify({ error: outcome.message }));
    return;
  }
  res.writeHead(502, headers);
  res.end(JSON.stringify({ error: "The local authenticated read failed." }));
}

function matchesEndpoint(req: IncomingMessage): boolean {
  const url = new URL(req.url ?? "", "http://placeholder");
  return url.pathname === privateReadEndpoint;
}

// Mounted identically by both Vite launch modes below. Requests outside this
// endpoint's exact path are passed on untouched; only a request that names it
// is ever inspected, let alone answered.
export function installPrivateReadMiddleware(
  middlewares: Connect.Server,
): () => void {
  const tracked = new Set<AbortController>();
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!matchesEndpoint(req)) {
      next();
      return;
    }
    void answer(req, tracked).then((outcome) => {
      respond(res, outcome);
    });
  };
  middlewares.use(handler);
  // The caller (`privateReadPlugin`, below) hands this to Vite's
  // `closeServer`/`closePreviewServer` plugin hooks: a held `gh` subprocess
  // must end with the owning server rather than being merely orphaned and
  // discarded. It is NOT the return value of `configureServer`/
  // `configurePreviewServer` -- in this project's installed Vite (8.3.0),
  // that return value is a "post hook" Vite calls once, synchronously, right
  // after startup finishes registering its own middlewares, never at close.
  return () => {
    for (const controller of tracked) {
      controller.abort();
    }
    tracked.clear();
  };
}

export function privateReadPlugin(): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook. Vite's `configureServer`/`configurePreviewServer` return value is
  // a startup post-hook, not a close hook, so shutdown cleanup is wired
  // through the dedicated `closeServer`/`closePreviewServer` hooks instead.
  let cleanup: (() => void) | undefined;
  return {
    name: "dough-private-read",
    configureServer(server) {
      cleanup = installPrivateReadMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      cleanup = installPrivateReadMiddleware(server.middlewares);
    },
    closeServer() {
      cleanup?.();
    },
    closePreviewServer() {
      cleanup?.();
    },
  };
}
