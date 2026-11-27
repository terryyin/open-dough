// Mounts the local authenticated read boundary (`./authenticatedRead.ts`).
// Launch modes omit `supplied` and keep the GitHub-backed pinned texts and
// revision checks. A direct read may replace either.

import type { Connect } from "vite";
import { AvatarImages } from "./avatarImages.ts";
import { answer, admitted, respond } from "./authenticatedRead.ts";
import { BranchHeads } from "./branchHeads.ts";
import { disconnectGh } from "./ghRead.ts";
import type { BoundaryMiddlewares } from "./localBoundary.ts";
import type { Boundary } from "./performedRead.ts";
import { PinnedTexts } from "./pinnedTexts.ts";
import { withReadTiming } from "./readTiming.ts";
import { parseRequestedRevisionStream } from "./requestedRevisionStream.ts";
import { RetainedAnswers } from "./retainedAnswers.ts";
import { RevisionChecks } from "./revisionChecks.ts";
import { RevisionMemo } from "./revisionMemo.ts";
import { RevisionStreamObservation } from "./revisionStreamObservation.ts";
import { SharedVerifiedOriginTrunk } from "./sharedVerifiedOriginTrunk.ts";
import {
  authenticatedAvatarEndpoint,
  authenticatedReadDiagnosticsEndpoint,
  authenticatedReadEndpoint,
} from "../src/authenticatedReadRules.ts";

// Mounted identically by both Vite launch modes. Requests outside these
// endpoints' exact paths are passed on untouched; only a request that names
// one is ever inspected, let alone answered.
export function installAuthenticatedReadMiddleware(
  middlewares: BoundaryMiddlewares,
): () => void {
  return mountAuthenticatedRead(middlewares);
}

export function mountAuthenticatedRead(
  middlewares: BoundaryMiddlewares,
  supplied?: Partial<Pick<Boundary, "pinned" | "checks">>,
): () => void {
  const tracked = new Set<AbortController>();
  const boundary: Boundary = {
    tracked,
    // Answers at resolved commits outlive this process; nothing else here does.
    pinned:
      supplied?.pinned ??
      new PinnedTexts(new RevisionMemo(new RetainedAnswers())),
    checks: supplied?.checks ?? new RevisionChecks({ tracked }),
    trunks: new SharedVerifiedOriginTrunk(),
    branches: new BranchHeads(),
    avatars: new AvatarImages(),
  };
  const streams = new RevisionStreamObservation(boundary);
  let closed = false;
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (
      url.pathname !== authenticatedReadEndpoint &&
      url.pathname !== authenticatedAvatarEndpoint &&
      url.pathname !== authenticatedReadDiagnosticsEndpoint
    ) {
      next();
      return;
    }
    if (closed) {
      respond(
        res,
        { kind: "refused", status: 503, message: "This dashboard is closing." },
        "",
      );
      return;
    }
    if (url.pathname === authenticatedReadEndpoint) {
      const stream = parseRequestedRevisionStream(url.searchParams);
      if (stream !== undefined) {
        const source = admitted(req, url.searchParams);
        if ("kind" in source) {
          respond(res, source, "");
          return;
        }
        if ("kind" in stream) {
          respond(res, stream, "");
          return;
        }
        void streams.open(source, stream, req, res);
        return;
      }
    }
    void withReadTiming(() => answer(req, boundary, url)).then(
      ({ outcome, serverTiming }) => {
        respond(res, outcome, serverTiming);
      },
    );
  };
  middlewares.use(handler);
  return () => {
    if (closed) return;
    closed = true;
    disconnectGh();
    streams.close();
    for (const controller of boundary.tracked) {
      controller.abort();
    }
    boundary.tracked.clear();
  };
}
