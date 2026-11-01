// The host status endpoint: a GET from this dashboard's own page answers the
// shared host sample (`./hostStatusObservation.ts`) this server holds, one
// per mounted server, so every page it serves shares it.
import type { IncomingMessage } from "node:http";
import { hostStatusEndpoint, type HostStatus } from "../src/hostStatus.ts";
import type { BoundaryInstall } from "./localBoundary.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { HostStatusObservation } from "./hostStatusObservation.ts";

export const installHostStatusMiddleware: BoundaryInstall = (
  middlewares,
  httpServer,
) => {
  const observation = new HostStatusObservation();
  return localJsonEndpoints(
    [hostStatusEndpoint],
    (req: IncomingMessage, pathname, signal): Promise<HostStatus> => {
      if (pathname !== hostStatusEndpoint || req.method !== "GET")
        throw new RefusedRequest(405, "Only GET is accepted.");
      return observation.observed(signal);
    },
    () => ({
      status: 503,
      body: { error: "The host status could not be sampled. Ask again." },
    }),
  )(middlewares, httpServer);
};
