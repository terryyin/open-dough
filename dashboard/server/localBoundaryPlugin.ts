// Vite launch-mode wiring shared by this dashboard's local boundaries (the
// authenticated read boundary, `./authenticatedReadPlugin.ts`, and the launch
// boundary, `./agentLaunchPlugin.ts`). Mounts one boundary's middleware in
// dev and preview alike, hands it the HTTP server so it can take its own
// WebSocket upgrades (null in Vite's middleware mode, which has none), and
// ends the processes it owns through
// `closeServer`/`closePreviewServer` -- not through `configureServer`'s
// return value, which this project's Vite treats as a startup post-hook only.

import type { Connect, HttpServer, Plugin } from "vite";

export function localBoundaryPlugin(
  name: string,
  install: (
    middlewares: Connect.Server,
    httpServer: HttpServer | null,
  ) => () => void,
): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook.
  let cleanup: (() => void) | undefined;
  return {
    name,
    configureServer(server) {
      cleanup = install(server.middlewares, server.httpServer);
    },
    configurePreviewServer(server) {
      cleanup = install(server.middlewares, server.httpServer);
    },
    closeServer() {
      cleanup?.();
    },
    closePreviewServer() {
      cleanup?.();
    },
  };
}
