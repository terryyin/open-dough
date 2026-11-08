// A minimal raw HTTP client for the local boundary tests (read and launch). `fetch`
// refuses to send some headers a browser could never send either (Origin
// among them), but this suite's refusal cases are about what the *server*
// does when a header disagrees -- not about re-proving what browsers already
// enforce -- so these requests are built directly on `node:http`, free of any
// client-side header allowlist.

import http from "node:http";

export type RawResponse = {
  readonly status: number;
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly body: string;
  // The body's bytes as received, before any decoding: a gzip-encoded
  // answer's encoded bytes, whose `body` is then not its text.
  readonly raw: Buffer;
};

export type RawRequestOptions = {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string;
};

// Every request opens its own connection (`agent: false`). A kept-alive one
// is closed by the server once idle, and a test that blocked its own loop
// meanwhile (a synchronous child, say) would send its next request on that
// closed socket and fail with "socket hang up".
export function rawRequest(options: RawRequestOptions): Promise<RawResponse> {
  const url = new URL(options.url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        agent: false,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: options.method ?? "GET",
        headers: options.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks);
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: raw.toString("utf8"),
            raw,
          });
        });
      },
    );
    req.on("error", reject);
    req.end(options.body);
  });
}

type EventStreamEnd = {
  readonly kind: "ended" | "aborted";
  readonly eventCount: number;
};

// Opens a GET that stays open and yields each `data:` line of a
// `text/event-stream` as its JSON payload, for revision-stream boundary
// specs. Closing ends the request the way a page closes its EventSource.
export function openEventStream(options: RawRequestOptions): {
  readonly headers: Promise<
    Readonly<{
      status: number;
      headers: Readonly<Record<string, string | string[] | undefined>>;
    }>
  >;
  readonly nextEvent: () => Promise<unknown>;
  readonly ended: Promise<EventStreamEnd>;
  readonly close: () => void;
} {
  const url = new URL(options.url);
  const events: unknown[] = [];
  const waiters: Array<(value: unknown) => void> = [];
  let buffer = "";
  let eventCount = 0;
  let finish!: (kind: EventStreamEnd["kind"]) => void;
  const ended = new Promise<EventStreamEnd>((resolve) => {
    finish = (kind) => {
      resolve({ kind, eventCount });
    };
  });
  let headersResolve: (value: {
    status: number;
    headers: Readonly<Record<string, string | string[] | undefined>>;
  }) => void;
  const headers = new Promise<{
    status: number;
    headers: Readonly<Record<string, string | string[] | undefined>>;
  }>((resolve) => {
    headersResolve = resolve;
  });
  const req = http.request(
    {
      agent: false,
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method: options.method ?? "GET",
      headers: options.headers,
    },
    (res) => {
      headersResolve({
        status: res.statusCode ?? 0,
        headers: res.headers,
      });
      res.once("end", () => {
        finish("ended");
      });
      res.once("close", () => {
        finish("aborted");
      });
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        buffer += chunk;
        let split: number;
        while ((split = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, split);
          buffer = buffer.slice(split + 2);
          const dataLine = frame
            .split("\n")
            .find((line) => line.startsWith("data:"));
          if (dataLine === undefined) continue;
          const payload: unknown = JSON.parse(
            dataLine.slice("data:".length).trim(),
          );
          eventCount += 1;
          const waiter = waiters.shift();
          if (waiter !== undefined) waiter(payload);
          else events.push(payload);
        }
      });
    },
  );
  req.on("error", () => {
    finish("aborted");
  });
  req.end(options.body);
  return {
    headers,
    ended,
    nextEvent: () =>
      events.length > 0
        ? Promise.resolve(events.shift())
        : new Promise((resolve) => {
            waiters.push(resolve);
          }),
    close: () => {
      req.destroy();
    },
  };
}

// Starts a GET and severs the connection before any response arrives, the
// way a browser tab does when the person navigates away or the page's own
// controller aborts: the server sees a premature close on this request, not
// a discarded answer it can keep computing.
export function abandonedRequest(options: RawRequestOptions): {
  readonly cutAfter: (ms: number) => void;
} {
  const url = new URL(options.url);
  const req = http.request({
    agent: false,
    hostname: url.hostname,
    port: url.port,
    path: `${url.pathname}${url.search}`,
    method: options.method ?? "GET",
    headers: options.headers,
  });
  req.on("error", () => {
    // Destroying the request races the server's own answer; either outcome
    // is fine, only the server-side effect is under test here.
  });
  req.end(options.body);
  return {
    cutAfter(ms: number) {
      setTimeout(() => {
        req.destroy();
      }, ms);
    },
  };
}
