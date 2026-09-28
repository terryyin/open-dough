// Vite launch-mode wiring shared by this dashboard's local boundaries (the
// authenticated read boundary, `./authenticatedReadPlugin.ts`, and the launch
// boundary, `./agentLaunchPlugin.ts`). Mounts one boundary's middleware in
// dev and preview alike, and ends the processes it owns through
// `closeServer`/`closePreviewServer` -- not through `configureServer`'s
// return value, which this project's Vite treats as a startup post-hook only.

import type { Connect, Plugin } from "vite";

export function localBoundaryPlugin(
  name: string,
  install: (middlewares: Connect.Server) => () => void,
): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook.
  let cleanup: (() => void) | undefined;
  return {
    name,
    configureServer(server) {
      cleanup = install(server.middlewares);
    },
    configurePreviewServer(server) {
      cleanup = install(server.middlewares);
    },
    closeServer() {
      cleanup?.();
    },
    closePreviewServer() {
      cleanup?.();
    },
  };
}
