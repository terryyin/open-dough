import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { localBoundaries } from "./server/localBoundaries.ts";
import { localBoundaryPlugin } from "./server/localBoundaryPlugin.ts";

const dashboardRoot = fileURLToPath(new URL(".", import.meta.url));
// The product sources the dashboard shares: the backlog reader that owns
// what a published backlog means, the session policy every workflow's
// start reads, and the rules of asking GitHub every consumer shares. The dev
// server may serve them and nothing else outside the dashboard.
const sharedBacklogReader = fileURLToPath(
  new URL("../src/skills/dough-product-backlog/scripts/", import.meta.url),
);
const sharedSessionPolicy = fileURLToPath(
  new URL(
    "../src/skills/dough-execute-plan/scripts/session-policy.mjs",
    import.meta.url,
  ),
);
const sharedGitHubRequestRules = fileURLToPath(
  new URL(
    "../src/skills/dough-execute-plan/scripts/github-request-rules.mjs",
    import.meta.url,
  ),
);

// The local authenticated read boundary (`./server/authenticatedRead.ts`) answers
// with whatever existing local `gh` credentials can already read, and the
// local launch boundary (`./server/launchBoundary.ts`) starts agent
// sessions on this machine; both must only ever be reachable on loopback,
// never on a network interface a shared machine exposes.
const loopbackOnly = "127.0.0.1";

export default defineConfig(({ command }) => {
  // A build writes production assets whatever NODE_ENV the shell inherited:
  // Vite otherwise honors an inherited `development` with React's development
  // build, whose StrictMode mounts every effect twice and so opens with a
  // second, aborted read that may still reach `gh`.
  if (command === "build") {
    process.env["NODE_ENV"] = "production";
  }
  return {
    root: dashboardRoot,
    // The local boundaries (`./server/localBoundaries.ts`), each as its plugin.
    plugins: [react(), ...localBoundaries.map(localBoundaryPlugin)],
    server: {
      host: loopbackOnly,
      port: 43127,
      strictPort: true,
      fs: {
        allow: [
          dashboardRoot,
          sharedBacklogReader,
          sharedSessionPolicy,
          sharedGitHubRequestRules,
        ],
      },
    },
    preview: {
      host: loopbackOnly,
    },
  };
});
