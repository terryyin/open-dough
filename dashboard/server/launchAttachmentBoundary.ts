import { launchAttachmentEndpoint } from "../src/launchAttachments.ts";
import type { RawBodyRequest } from "./boundedRawBody.ts";
import { readImageAttachment } from "./imageAttachments.ts";
import type { BoundaryInstall } from "./localBoundary.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { claimLaunchAttachment } from "./launchAttachmentClaims.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { withResponseSignal } from "./responseSignal.ts";

const uploadAnswerHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
} as const;

type LaunchAttachmentAnswer = {
  readonly status: number;
  readonly body: { readonly claim: string } | { readonly error: string };
  readonly headers: typeof uploadAnswerHeaders;
};

function refusedUpload(error: unknown): LaunchAttachmentAnswer {
  const refusal = error instanceof RefusedRequest ? error : undefined;
  return {
    status: refusal?.status ?? 503,
    body: { error: refusal?.message ?? "The image could not be attached." },
    headers: uploadAnswerHeaders,
  };
}

export async function answerLaunchAttachmentUpload(
  request: RawBodyRequest,
  signal: AbortSignal,
  dashboardDirectory: string,
): Promise<LaunchAttachmentAnswer> {
  try {
    const { bytes, type, name } = await readImageAttachment(request, signal);
    return {
      status: 200,
      body: {
        claim: claimLaunchAttachment(bytes, type, name, dashboardDirectory),
      },
      headers: uploadAnswerHeaders,
    };
  } catch (error) {
    return refusedUpload(error);
  }
}

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
    const respond = ({ status, body, headers }: LaunchAttachmentAnswer) => {
      if (res.destroyed || res.writableEnded) {
        return;
      }
      res.writeHead(status, {
        ...headers,
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
        return answerLaunchAttachmentUpload(
          req,
          signal,
          machineDashboardDirectory(),
        );
      },
      60_000,
    )
      .then(respond, (error: unknown) => {
        respond(refusedUpload(error));
      })
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
