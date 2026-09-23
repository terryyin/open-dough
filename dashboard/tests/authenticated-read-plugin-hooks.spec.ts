// The Vite plugin hooks through which the local authenticated read boundary
// (../server/authenticatedReadPlugin.ts) ends its owned `gh` subprocesses on
// shutdown, called directly rather than through a Vite server, so that the
// hook is the only possible cause. End-to-end subprocess lifecycle is covered
// in ./authenticated-read-subprocess-lifecycle.spec.ts.

import { expect, test } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { authenticatedReadPlugin } from "../server/authenticatedReadPlugin";
import {
  fakeGhEnv,
  installFakeGh,
  processAlive,
  readPid,
} from "./support/fakeGh";
import { startFakeGitHub } from "./support/fakeGitHub";
import { waitUntil } from "./support/dashboardServer";
import { abandonedRequest } from "./support/rawHttp";
import { withRestoredEnv } from "./support/testEnv";

const knownSourceId = "open-dough";

// A minimal stand-in for `Connect.Server`: `authenticatedReadPlugin()`'s
// `configureServer` hook only ever calls `.use(handler)` on what it is
// given, so that is all this needs to provide.
type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;

test.describe("authenticated read boundary: closeServer/closePreviewServer hook wiring", () => {
  // This is the specific defect a coordinator review found: this project's
  // installed Vite (8.3.0) does not treat `configureServer`'s/
  // `configurePreviewServer`'s return value as a close hook (that return
  // value is a startup "post hook", called once at startup, never at
  // close). `authenticatedReadPlugin()` must instead register its cleanup via the
  // dedicated `closeServer`/`closePreviewServer` plugin hooks. The tests
  // above cannot isolate that fact on their own, because Vite's own graceful
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
    const github = await startFakeGitHub();
    github.setControl({ mode: "hang" });

    const restoreEnv = withRestoredEnv(fakeGhEnv(gh, github.url));

    let storedHandler: StoredHandler | undefined;
    const connectStub = {
      use(fn: StoredHandler) {
        storedHandler = fn;
      },
    };

    const plugin = authenticatedReadPlugin();
    // Cast through the plugin's own actual runtime shape: both hooks are
    // written as plain functions (object-method shorthand), never Rollup's
    // alternate `{ handler, order }` object form, so this reflects what
    // `authenticatedReadPlugin()` really returns, not its looser declared type.
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
        url: `http://127.0.0.1:${String(port)}/__authenticated-read?source=${knownSourceId}`,
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
      await github.close();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
