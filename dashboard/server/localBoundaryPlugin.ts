// Vite launch-mode wiring shared by this dashboard's local boundaries (the
// authenticated read boundary, `./authenticatedReadPlugin.ts`, and the launch
// boundary, `./agentLaunchPlugin.ts`). Mounts one boundary's middleware in
// dev and preview alike, hands it the HTTP server so it can take its own
// WebSocket upgrades (null in Vite's middleware mode, which has none), and
// ends the processes it owns through
// `closeServer`/`closePreviewServer` -- not through `configureServer`'s
// return value, which this project's Vite treats as a startup post-hook only.

import type { Connect, HttpServer, Plugin } from "vite";
import { initializeProjectConfiguration } from "./projectConfiguration.ts";

type BoundaryCleanup = () => void;

// A ready pair installs its middleware and publishes `close` before `ready`
// settles, so a caller that does not await this hook still has `closeServer`.
type BoundaryReady = {
  readonly close: BoundaryCleanup;
  readonly ready: Promise<unknown>;
};

type BoundaryInstallResult =
  BoundaryCleanup | Promise<BoundaryCleanup> | BoundaryReady;

function isReady(installed: BoundaryInstallResult): installed is BoundaryReady {
  return (
    typeof installed === "object" &&
    "close" in installed &&
    !(installed instanceof Promise)
  );
}

export function localBoundaryPlugin(
  name: string,
  install: (
    middlewares: Connect.Server,
    httpServer: HttpServer | null,
  ) => BoundaryInstallResult,
): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook.
  let cleanup: BoundaryCleanup | undefined;
  // Assigns cleanup before the first await when `install` can say so, then
  // waits for `ready` so Vite does not listen early.
  async function mount(
    middlewares: Connect.Server,
    httpServer: HttpServer | null,
  ): Promise<void> {
    const installed = install(middlewares, httpServer);
    if (typeof installed === "function") {
      cleanup = installed;
      return;
    }
    if (isReady(installed)) {
      cleanup = installed.close;
      await installed.ready;
      return;
    }
    cleanup = await installed;
  }
  return {
    name,
    async configureServer(server) {
      initializeProjectConfiguration("development");
      await mount(server.middlewares, server.httpServer);
    },
    async configurePreviewServer(server) {
      initializeProjectConfiguration("production");
      await mount(server.middlewares, server.httpServer);
    },
    closeServer() {
      cleanup?.();
    },
    closePreviewServer() {
      cleanup?.();
    },
  };
}
