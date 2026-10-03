// The request handling shared by this dashboard's local JSON settings
// endpoints (projects, OpenAI access, terminal theme): only the listed paths
// are taken, every request must come from this dashboard's own page, the
// answer is JSON that is never cached, and closing the server aborts what is
// still pending. A `RefusedRequest` answers its own status and message; any
// other failure is answered as `failure` describes it.
import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import { readTimeoutMs } from "./ghRead.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { withResponseSignal } from "./responseSignal.ts";

export type EndpointFailure = {
  readonly status: number;
  readonly body: Readonly<Record<string, unknown>>;
};

export function localJsonEndpointsPlugin(
  name: string,
  endpoints: readonly string[],
  answer: (
    req: IncomingMessage,
    pathname: string,
    signal: AbortSignal,
  ) => Promise<unknown>,
  failure: (error: unknown) => EndpointFailure,
): Plugin {
  return localBoundaryPlugin(name, (middlewares) => {
    const pending = new Set<AbortController>();
    middlewares.use((req, res, next) => {
      const pathname = new URL(req.url ?? "", "http://placeholder").pathname;
      if (!endpoints.includes(pathname)) {
        next();
        return;
      }
      const controller = new AbortController();
      pending.add(controller);
      const respond = (status: number, body: unknown) => {
        if (res.destroyed || res.writableEnded) return;
        res.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(body));
      };
      void withResponseSignal(
        res,
        async (signal) => {
          verifyLocalOrigin(req);
          return answer(
            req,
            pathname,
            AbortSignal.any([signal, controller.signal]),
          );
        },
        readTimeoutMs(),
      )
        .then(
          (body) => {
            respond(200, body);
          },
          (error: unknown) => {
            const { status, body } =
              error instanceof RefusedRequest
                ? { status: error.status, body: { error: error.message } }
                : failure(error);
            respond(status, body);
          },
        )
        .finally(() => {
          pending.delete(controller);
        });
    });
    return () => {
      for (const controller of pending) controller.abort();
      pending.clear();
    };
  });
}
