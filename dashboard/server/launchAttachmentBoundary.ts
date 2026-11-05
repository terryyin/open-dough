import { launchAttachmentEndpoint } from "../src/launchAttachments.ts";
import { readImageAttachment } from "./imageAttachments.ts";
import type { BoundaryInstall } from "./localBoundary.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { claimLaunchAttachment } from "./launchAttachmentClaims.ts";
import { withResponseSignal } from "./responseSignal.ts";

export const installLaunchAttachmentMiddleware: BoundaryInstall = (
  middlewares,
) => {
  const pending = new Set<AbortController>();
  middlewares.use((req, res, next) => {
    if (
      new URL(req.url ?? "", "http://placeholder").pathname !==
      launchAttachmentEndpoint
    ) {
      next();
      return;
    }
    const controller = new AbortController();
    pending.add(controller);
    const respond = (status: number, body: unknown) => {
      if (res.destroyed || res.writableEnded) {
        return;
      }
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...(status !== 200 && !req.complete ? { Connection: "close" } : {}),
      });
      res.end(JSON.stringify(body));
    };
    void withResponseSignal(
      res,
      async (callerSignal) => {
        const signal = AbortSignal.any([callerSignal, controller.signal]);
        verifyLocalOrigin(req);
        if (req.method !== "POST") {
          throw new RefusedRequest(405, "Only POST is accepted.");
        }
        const { bytes, type, name } = await readImageAttachment(req, signal);
        return { claim: claimLaunchAttachment(bytes, type, name) };
      },
      60_000,
    )
      .then(
        (answer) => {
          respond(200, answer);
        },
        (error: unknown) => {
          respond(error instanceof RefusedRequest ? error.status : 503, {
            error:
              error instanceof RefusedRequest
                ? error.message
                : "The image could not be attached.",
          });
        },
      )
      .finally(() => {
        pending.delete(controller);
      });
  });
  return () => {
    for (const controller of pending) {
      controller.abort();
    }
    pending.clear();
  };
};
