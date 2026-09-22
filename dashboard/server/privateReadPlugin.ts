// Vite launch-mode wiring for the local authenticated read boundary
// (`./privateRead.ts`). Mounts the same middleware in dev and preview, and
// tears owned `gh` subprocesses down through `closeServer`/
// `closePreviewServer` — not through `configureServer`'s return value, which
// this project's Vite treats as a startup post-hook only.

import type { Plugin } from "vite";
import { installPrivateReadMiddleware } from "./privateRead";

export function privateReadPlugin(): Plugin {
  // Set by whichever of the two launch-mode hooks below actually runs (dev
  // XOR preview, never both in one process); read by the matching close
  // hook. Vite's `configureServer`/`configurePreviewServer` return value is
  // a startup post-hook, not a close hook, so shutdown cleanup is wired
  // through the dedicated `closeServer`/`closePreviewServer` hooks instead.
  let cleanup: (() => void) | undefined;
  return {
    name: "dough-private-read",
    configureServer(server) {
      cleanup = installPrivateReadMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      cleanup = installPrivateReadMiddleware(server.middlewares);
    },
    closeServer() {
      cleanup?.();
    },
    closePreviewServer() {
      cleanup?.();
    },
  };
}
