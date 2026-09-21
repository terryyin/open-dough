// Refuses before any `gh` subprocess is launched: the connection must arrive
// on a loopback socket, the request must name a loopback Host, and it must
// carry an Origin naming that same host. A page from anywhere else --
// reachable only because this machine also runs a browser -- gets no answer
// and triggers no `gh` call. Kept apart from `./privateRead.ts`'s `gh`
// invocation: this module only ever inspects the incoming request, never
// spawns a process or reads a catalog source.

import type { IncomingMessage } from "node:http";

export class RefusedRead extends Error {
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
    throw new RefusedRead(
      403,
      "This endpoint only answers loopback connections.",
    );
  }
  const host = req.headers.host;
  const hostname = host?.split(":")[0];
  if (!hostname || !loopbackHostname(hostname)) {
    throw new RefusedRead(
      403,
      "This endpoint only answers on the local loopback host.",
    );
  }
  // A real browser's own same-origin `fetch` (this endpoint's only intended
  // caller) carries no `Origin` header at all: the Fetch standard only adds
  // one for a cross-origin request or a non-GET/HEAD method, neither of
  // which this endpoint uses. What every current browser does send on any
  // `fetch` is the Fetch Metadata `Sec-Fetch-Site` header, which the browser
  // itself computes and a page's own script cannot set or override, so it is
  // checked first; `same-origin` is the value a browser gives only when the
  // requesting page's origin actually is this endpoint's origin. A client
  // that sends no such header (curl, `node:http`, or an older browser) falls
  // through to the `Origin`/`Host` comparison below, which still refuses a
  // cross-origin browser request: a cross-origin `fetch` carries both an
  // `Origin` header and `Sec-Fetch-Site: cross-site`, so it is refused either
  // way.
  if (req.headers["sec-fetch-site"] === "same-origin") {
    return;
  }
  const origin = req.headers.origin;
  if (typeof origin !== "string") {
    throw new RefusedRead(403, "This endpoint requires a same-origin request.");
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new RefusedRead(403, "This endpoint requires a same-origin request.");
  }
  if (originHost !== host) {
    throw new RefusedRead(403, "This endpoint refuses cross-origin requests.");
  }
}
