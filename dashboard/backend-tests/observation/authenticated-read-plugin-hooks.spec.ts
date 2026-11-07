// The Vite plugin hooks (../../server/localBoundaryPlugin.ts) through which the
// local authenticated read boundary (../../server/authenticatedRead.ts) ends its
// owned `gh` subprocesses on shutdown, called directly rather than through a
// Vite server, so that the
// hook is the only possible cause. End-to-end subprocess lifecycle is covered
// in ./authenticated-read-subprocess-lifecycle.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../tests/support/fakeGh.ts";
import { processAlive, readPid } from "../../tests/support/processGroup.ts";
import {
  everyRepository,
  hangs,
  startFakeGitHub,
} from "../../tests/support/fakeGitHub.ts";
import { waitUntil } from "../../tests/support/waitUntil.ts";
import { abandonedRequest } from "../../tests/support/rawHttp.ts";
import { withRestoredEnv } from "../../tests/support/testEnv.ts";
import { configureDevelopmentProjects } from "../../tests/support/projectConfiguration.ts";
import { startInProcessBoundaryHttp } from "../../tests/support/inProcessBoundaryHttp.ts";

const knownSourceId = "open-dough";

test.describe("authenticated read boundary: closeServer/closePreviewServer hook wiring", () => {
  // This is the specific defect a coordinator review found: this project's
  // installed Vite (8.3.0) does not treat `configureServer`'s/
  // `configurePreviewServer`'s return value as a close hook (that return
  // value is a startup "post hook", called once at startup, never at
  // close). The plugin must instead register its cleanup via the
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
    github.serve(everyRepository, hangs);

    const home = path.join(tempRoot, "home");
    configureDevelopmentProjects(home);
    const restoreEnv = withRestoredEnv({
      ...fakeGhEnv(gh, github.url),
      HOME: home,
    });

    const boundary = await startInProcessBoundaryHttp({
      name: "dough-authenticated-read",
      install: installAuthenticatedReadMiddleware,
    });

    try {
      abandonedRequest({
        url: `${boundary.origin}/__authenticated-read?source=${knownSourceId}`,
        headers: { Origin: boundary.origin },
      });
      const becameAlive = await waitUntil(
        () => processAlive(readPid(gh.pidPath)),
        { timeoutMs: 5_000 },
      );
      expect(becameAlive).toBe(true);

      // The isolation: this plain `http.Server` is never closed, and this
      // test's own client connection is never destroyed. Only the plugin's
      // `closeServer` hook function is invoked.
      await boundary.closeBoundary();

      const died = await waitUntil(() => !processAlive(readPid(gh.pidPath)), {
        timeoutMs: 5_000,
      });
      expect(died).toBe(true);
    } finally {
      await boundary.closeHttp();
      restoreEnv();
      await endFakeGh(gh);
      await github.close();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
