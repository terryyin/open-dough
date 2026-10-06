// Vite plugin for the local authenticated read boundary
// (`./authenticatedRead.ts`), mounted in dev and preview by
// `./localBoundaryPlugin.ts`, which also ends every request's wait when the
// server closes, and with it each `gh` call they wait on (`./ghRead.ts`).

import type { Plugin } from "vite";
import { installAuthenticatedReadMiddleware } from "./authenticatedRead.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";

export function authenticatedReadPlugin(): Plugin {
  return localBoundaryPlugin(
    "dough-authenticated-read",
    installAuthenticatedReadMiddleware,
  );
}
