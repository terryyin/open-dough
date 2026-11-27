// Refuses a request to a local boundary before it launches any process: the
// connection must arrive on a loopback socket, the request must name a
// loopback Host, and it must come from this same origin. A page from anywhere
// else -- reachable only because this machine also runs a browser -- gets no
// answer and triggers no `gh` or agent host call. Guards both the
// authenticated read boundary (`./authenticatedRead.ts`) and the launch
// boundary (`./launchBoundary.ts`); this module only ever inspects the
// incoming request, never spawns a process or reads a catalog source.

import type { IncomingMessage } from "node:http";

export class RefusedRequest extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function loopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname === "::ffff:127.0.0.1"
  );
}

// The local Host and origin metadata shared by wire-shaped admission and
// the HTTP guard after it verifies the socket.
export function verifySameOrigin(
  origin: string | null | undefined,
  host: string | undefined,
  fetchSite?: string | string[] | null,
): void {
  const hostname = host?.split(":")[0];
  if (!hostname || !loopbackHostname(hostname)) {
    throw new RefusedRequest(
      403,
      "This endpoint only answers on the local loopback host.",
    );
  }
  // A same-origin browser request can omit Origin. Fetch Metadata supplies
  // the browser's origin decision in that case; other callers fall back to
  // comparing Origin against Host.
  if (fetchSite === "same-origin") return;
  if (typeof origin !== "string") {
    throw new RefusedRequest(
      403,
      "This endpoint requires a same-origin request.",
    );
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new RefusedRequest(
      403,
      "This endpoint requires a same-origin request.",
    );
  }
  if (originHost !== host) {
    throw new RefusedRequest(
      403,
      "This endpoint refuses cross-origin requests.",
    );
  }
}

// The connection itself must arrive on a loopback socket.
export function verifyLoopbackSocket(req: IncomingMessage): void {
  if (!loopbackHostname(req.socket.remoteAddress ?? "")) {
    throw new RefusedRequest(
      403,
      "This endpoint only answers loopback connections.",
    );
  }
}

export function verifyLocalOrigin(req: IncomingMessage): void {
  verifyLoopbackSocket(req);
  verifySameOrigin(
    req.headers.origin,
    req.headers.host,
    req.headers["sec-fetch-site"],
  );
}
