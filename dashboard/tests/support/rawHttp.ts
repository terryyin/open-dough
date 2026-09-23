// A minimal raw HTTP client for the authenticated read boundary tests. `fetch`
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
};

export type RawRequestOptions = {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Readonly<Record<string, string>>;
};

export function rawRequest(options: RawRequestOptions): Promise<RawResponse> {
  const url = new URL(options.url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
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
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
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
  req.end();
  return {
    cutAfter(ms: number) {
      setTimeout(() => {
        req.destroy();
      }, ms);
    },
  };
}
