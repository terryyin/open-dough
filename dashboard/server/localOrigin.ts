// Refuses a request to a local boundary before it launches any process: the
// connection must arrive on a loopback socket, the request must name a
// loopback Host, and it must come from this same origin. A page from anywhere
// else -- reachable only because this machine also runs a browser -- gets no
// answer and triggers no `gh` or agent host call. Guards both the
// authenticated read boundary (`./authenticatedRead.ts`) and the launch
// boundary (`./agentLaunchPlugin.ts`); this module only ever inspects the
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

export function verifyLocalOrigin(req: IncomingMessage): void {
  if (!loopbackHostname(req.socket.remoteAddress ?? "")) {
    throw new RefusedRequest(
      403,
      "This endpoint only answers loopback connections.",
    );
  }
  const host = req.headers.host;
  const hostname = host?.split(":")[0];
  if (!hostname || !loopbackHostname(hostname)) {
    throw new RefusedRequest(
      403,
      "This endpoint only answers on the local loopback host.",
    );
  }
  // A real browser's own same-origin GET `fetch` (the read boundary's only
  // intended caller) carries no `Origin` header at all: the Fetch standard
  // only adds one for a cross-origin request or a non-GET/HEAD method. A
  // same-origin POST (the launch boundary's) does carry `Origin`, naming this
  // same host. What every current browser does send on any `fetch` is the
  // Fetch Metadata `Sec-Fetch-Site` header, which the browser itself computes
  // and a page's own script cannot set or override, so it is checked first;
  // `same-origin` is the value a browser gives only when the requesting
  // page's origin actually is this endpoint's origin. A client that sends no
  // such header (curl, `node:http`, or an older browser) falls through to the
  // `Origin`/`Host` comparison below, which admits a same-origin POST and
  // still refuses a cross-origin browser request: a cross-origin `fetch` of
  // any method carries both an `Origin` header and `Sec-Fetch-Site:
  // cross-site`, so it is refused either way.
  if (req.headers["sec-fetch-site"] === "same-origin") {
    return;
  }
  const origin = req.headers.origin;
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
