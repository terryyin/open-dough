// Local authenticated read boundary for Vite: resolves a catalog source's
// ref and reads its backlog (or one reachability-checked canonical/plan path)
// through local `gh`. Request refusal: `./localOrigin.ts`; gh calls:
// `./ghRead.ts`; path reachability: `./privatePathAllowlist.ts`. Node-only;
// never returns credentials, raw stderr, or an arbitrary path proxy.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import {
  commitShaPattern,
  readRepositoryFileViaGh,
  readTimeoutMs,
  resolveRevisionViaGh,
} from "./ghRead";
import { RefusedRead, verifyLocalOrigin } from "./localOrigin";
import {
  parseSafeRepositoryPath,
  pathReachableFromRevision,
} from "./privatePathAllowlist";
import { sourceById } from "../src/publishedSource";
import { privateReadEndpoint } from "../src/privateReadPath";

// Shared with the browser reader via `../src/privateReadPath.ts`.
export { privateReadEndpoint };

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
  | { readonly kind: "failed" };

async function withTrackedGh<T>(
  req: IncomingMessage,
  tracked: Set<AbortController>,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
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
    return await run(controller.signal);
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
        const reachable = await pathReachableFromRevision(
          source,
          revisionParam,
          repositoryPath,
          signal,
        );
        if (!reachable) {
          return {
            kind: "refused" as const,
            status: 404,
            message: "That path is not reachable from this source revision.",
          };
        }
        const text = await readRepositoryFileViaGh(
          source.repository,
          repositoryPath,
          revisionParam,
          signal,
        );
        return {
          kind: "ok-file" as const,
          revision: revisionParam,
          path: repositoryPath,
          text,
        };
      });
    } catch {
      return { kind: "failed" };
    }
  }

  try {
    return await withTrackedGh(req, tracked, async (signal) => {
      const revision = await resolveRevisionViaGh(
        source.repository,
        source.ref,
        signal,
      );
      const backlog = await readRepositoryFileViaGh(
        source.repository,
        source.backlogPath,
        revision,
        signal,
      );
      return { kind: "ok" as const, revision, backlog };
    });
  } catch {
    // Never forward a `gh` failure's raw stderr: it may name local paths,
    // request context, or (in principle) echo configuration. The person
    // sees only a safe, generic report.
    return { kind: "failed" };
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
  return () => {
    for (const controller of tracked) {
      controller.abort();
    }
    tracked.clear();
  };
}
