// What one of this dashboard's local boundaries is to the server that mounts
// it: an install function given the middleware chain to answer on and the
// HTTP server whose WebSocket upgrades it may take, returning how to close
// it. Vite mounts a boundary this way in dev and preview
// (`./localBoundaryPlugin.ts`), and the boundary server mounts the same
// boundaries on a plain HTTP server for boundary tests
// (`./boundaryServer.ts`); which boundaries those are is
// `./localBoundaries.ts`.

import type { Connect, HttpServer } from "vite";

// The chain a boundary mounts on. Vite's Connect server is one; so is the
// boundary server's own list of handlers. A boundary only ever appends a
// handler that answers its own paths and passes every other request on.
export type BoundaryMiddlewares = {
  use(handler: Connect.NextHandleFunction): unknown;
};

export type BoundaryCleanup = () => void | Promise<void>;

// A ready pair installs its middleware and publishes `close` before `ready`
// settles, so a caller that does not await `ready` can still close it.
export type BoundaryReady = {
  readonly close: BoundaryCleanup;
  readonly ready: Promise<unknown>;
};

export type BoundaryInstallResult =
  BoundaryCleanup | Promise<BoundaryCleanup> | BoundaryReady;

export type BoundaryInstall = (
  middlewares: BoundaryMiddlewares,
  httpServer: HttpServer | null,
) => BoundaryInstallResult;

// One boundary as the list of them names it (`./localBoundaries.ts`): its
// install, and the name of the Vite plugin that mounts it.
export type LocalBoundary = {
  readonly name: string;
  readonly install: BoundaryInstall;
};

function isReady(installed: BoundaryInstallResult): installed is BoundaryReady {
  return (
    typeof installed === "object" &&
    "close" in installed &&
    !(installed instanceof Promise)
  );
}

// Installs one boundary and hands back its `close` at once, whatever shape
// the install answered in, with `ready` to await before the server listens.
export function installBoundary(
  install: BoundaryInstall,
  middlewares: BoundaryMiddlewares,
  httpServer: HttpServer | null,
): BoundaryReady {
  const installed = install(middlewares, httpServer);
  if (typeof installed === "function") {
    return { close: installed, ready: Promise.resolve() };
  }
  if (isReady(installed)) return installed;
  return {
    close: () => installed.then((cleanup) => cleanup()),
    ready: installed,
  };
}
