// The Vite plugin that mounts one of this dashboard's local boundaries
// (`./localBoundaries.ts`) in dev and preview (`../vite.config.mts`). It
// installs the boundary's middleware (`./localBoundary.ts`) in both alike,
// hands it the HTTP server so it can take its own WebSocket upgrades (null in
// Vite's middleware mode, which has none), and ends the processes it owns
// through `closeServer`/`closePreviewServer` -- not through
// `configureServer`'s return value, which this project's Vite treats as a
// startup post-hook only.

import type { Connect, HttpServer, Plugin } from "vite";
import {
  installBoundary,
  type BoundaryCleanup,
  type LocalBoundary,
} from "./localBoundary.ts";
import {
  initializeProjectConfiguration,
  type ProjectEnvironment,
} from "./projectConfiguration.ts";

// The project environment each Vite serving mode opens before it mounts a
// boundary: the dev server keeps development's, the preview production's.
export const servingModeEnvironment = {
  dev: "development",
  preview: "production",
} as const satisfies Record<string, ProjectEnvironment>;

export function localBoundaryPlugin(
  { name, install }: LocalBoundary,
  openEnvironment: (
    environment: ProjectEnvironment,
  ) => void = initializeProjectConfiguration,
): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook.
  let cleanup: BoundaryCleanup | undefined;
  // Assigns cleanup before the first await, then waits for `ready` so Vite
  // does not listen early.
  async function mount(
    middlewares: Connect.Server,
    httpServer: HttpServer | null,
  ): Promise<void> {
    const boundary = installBoundary(install, middlewares, httpServer);
    cleanup = boundary.close;
    await boundary.ready;
  }
  return {
    name,
    async configureServer(server) {
      openEnvironment(servingModeEnvironment.dev);
      await mount(server.middlewares, server.httpServer);
    },
    async configurePreviewServer(server) {
      openEnvironment(servingModeEnvironment.preview);
      await mount(server.middlewares, server.httpServer);
    },
    closeServer() {
      return cleanup?.();
    },
    closePreviewServer() {
      return cleanup?.();
    },
  };
}
