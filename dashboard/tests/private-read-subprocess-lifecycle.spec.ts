// The local authenticated read boundary (../server/privateRead.ts) is
// tested here directly against real HTTP and a real, but controlled,
// subprocess -- not through the browser. A synthetic `gh` on each isolated
// server process's PATH can hold a call open on command, so these tests can
// prove that a `gh` subprocess this boundary owns actually ends -- rather
// than being merely discarded -- on client disconnect, on its own read
// timeout, and on server shutdown (both end to end and through the specific
// Vite plugin hooks that own that cleanup).
//
// This spec covers the boundary's subprocess lifecycle. Its HTTP contract --
// refusal, successful resolve-then-read, and failure reporting -- is covered
// separately in ./private-read-boundary.spec.ts, which shares this suite's
// harness (./support/privateReadServer.ts).
//
// This spec's servers are not the shared webServer (playwright.config.ts)
// the parallel public-origin specs use: each is a separate process, on its
// own port, with its own PATH and its own fake `gh`, so nothing here can
// leak into -- or race with -- those tests.

import { expect, test } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { privateReadPlugin } from "../server/privateRead";
import {
  installFakeGh,
  processAlive,
  readPid,
  writeControl,
} from "./support/fakeGh";
import {
  startPrivateReadServer,
  waitUntil,
  type PrivateReadServer,
} from "./support/privateReadServer";
import { abandonedRequest, rawRequest } from "./support/rawHttp";
import { withRestoredEnv } from "./support/testEnv";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";

test.describe("private read boundary: cancels the held subprocess on client disconnect (dev mode)", () => {
  let server: PrivateReadServer;
  const port = 4295;

  test.beforeAll(async () => {
    server = await startPrivateReadServer({ mode: "dev", port });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("terminates the held gh subprocess when the request is abandoned (client disconnect)", async () => {
    server.setControl({ mode: "hang" });
    const abandoned = abandonedRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(becameAlive).toBe(true);
    abandoned.cutAfter(0);
    const died = await waitUntil(() => !processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(died).toBe(true);
    expect(server.ghExitedBy()).toBe("SIGTERM");
  });
});

test.describe("private read boundary: bounded timeout without changing the production bound", () => {
  let server: PrivateReadServer;
  const port = 4291;
  // A short deadline for this isolated server only, via the same environment
  // seam `../server/ghRead.ts`'s `readTimeoutMs` reads; the 30-second
  // production default is untouched (see that module and
  // `../src/publishedWork.ts`'s `readWaitLimitMs`, which it mirrors).
  const shortTimeoutMs = 300;

  test.beforeAll(async () => {
    server = await startPrivateReadServer({
      mode: "dev",
      port,
      readTimeoutMs: shortTimeoutMs,
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("ends a stalled gh subprocess at the read's own bound, even without a client disconnect", async () => {
    server.setControl({ mode: "hang" });
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(502);
    const died = await waitUntil(() => !processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(died).toBe(true);
  });
});

test.describe("private read boundary: subprocess ownership across server shutdown", () => {
  test("ends every held gh subprocess when the server itself closes, end to end", async () => {
    const server = await startPrivateReadServer({ mode: "dev", port: 4292 });
    server.setControl({ mode: "hang" });
    // Left outstanding on purpose: this test's own client never disconnects
    // it. Only `server.close()` below acts. (An earlier version of this test
    // also destroyed this connection itself after closing the server, which
    // confounded the result: that alone -- the request-disconnect path
    // already proven above -- was enough to end the subprocess, so the test
    // passed even while the production `closeServer`/`closePreviewServer`
    // wiring was broken. The next test below isolates that wiring
    // specifically; this one proves only the end-to-end user-facing
    // guarantee that no owned subprocess survives a real shutdown, by
    // whichever combination of production paths brings that about -- Vite's
    // own `server.close()` also destroys any still-open request socket as
    // part of closing its HTTP server, which independently triggers this
    // boundary's request-disconnect path too.)
    abandonedRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(becameAlive).toBe(true);
    await server.close();
    const died = await waitUntil(() => !processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(died).toBe(true);
  });
});

// A minimal stand-in for `Connect.Server`: `privateReadPlugin()`'s
// `configureServer` hook only ever calls `.use(handler)` on what it is
// given, so that is all this needs to provide.
type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;

test.describe("private read boundary: closeServer/closePreviewServer hook wiring", () => {
  // This is the specific defect a coordinator review found: this project's
  // installed Vite (8.3.0) does not treat `configureServer`'s/
  // `configurePreviewServer`'s return value as a close hook (that return
  // value is a startup "post hook", called once at startup, never at
  // close). `privateReadPlugin()` must instead register its cleanup via the
  // dedicated `closeServer`/`closePreviewServer` plugin hooks. The test
  // above cannot isolate that fact on its own, because Vite's own graceful
  // `server.close()` also destroys any still-open request socket, which
  // independently triggers this boundary's already-proven
  // `req.on("close")` cancellation path. So this test calls the plugin's
  // `configureServer` and `closeServer` hook functions directly, wired to a
  // plain `http.Server` this test owns -- never Vite's own dev/preview
  // server, and this test's own client connection is never destroyed -- so
  // that calling only `closeServer()` is the sole possible cause of the
  // subprocess ending.
  test("closeServer, called alone with no client disconnect and no Vite httpServer.close(), ends the held gh subprocess", async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-hook-wiring-"));
    const gh = installFakeGh(tempRoot);
    writeControl(gh.controlPath, { mode: "hang" });

    const restoreEnv = withRestoredEnv({
      PATH: `${gh.binDir}${path.delimiter}${process.env["PATH"] ?? ""}`,
      FAKE_GH_LOG: gh.logPath,
      FAKE_GH_CONTROL: gh.controlPath,
      FAKE_GH_PIDFILE: gh.pidPath,
    });

    let storedHandler: StoredHandler | undefined;
    const connectStub = {
      use(fn: StoredHandler) {
        storedHandler = fn;
      },
    };

    const plugin = privateReadPlugin();
    // Cast through the plugin's own actual runtime shape: both hooks are
    // written as plain functions (object-method shorthand), never Rollup's
    // alternate `{ handler, order }` object form, so this reflects what
    // `privateReadPlugin()` really returns, not its looser declared type.
    const configureServer = plugin.configureServer as unknown as (server: {
      middlewares: typeof connectStub;
    }) => void;
    const closeServer =
      plugin.closeServer as unknown as () => void | Promise<void>;

    configureServer({ middlewares: connectStub });

    const rawServer = http.createServer((req, res) => {
      storedHandler?.(req, res, () => {
        res.writeHead(404);
        res.end();
      });
    });
    const port = 4294;
    await new Promise<void>((resolve) => {
      rawServer.listen(port, "127.0.0.1", resolve);
    });

    try {
      abandonedRequest({
        url: `http://127.0.0.1:${String(port)}/__private-read?source=${knownSourceId}`,
        headers: { Origin: `http://127.0.0.1:${String(port)}` },
      });
      const becameAlive = await waitUntil(
        () => processAlive(readPid(gh.pidPath)),
        { timeoutMs: 5_000 },
      );
      expect(becameAlive).toBe(true);

      // The isolation: this plain `http.Server` is never closed, and this
      // test's own client connection is never destroyed. Only the plugin's
      // `closeServer` hook function is invoked.
      await closeServer();

      const died = await waitUntil(() => !processAlive(readPid(gh.pidPath)), {
        timeoutMs: 5_000,
      });
      expect(died).toBe(true);
    } finally {
      rawServer.closeAllConnections();
      await new Promise<void>((resolve) => {
        rawServer.close(() => {
          resolve();
        });
      });
      restoreEnv();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
