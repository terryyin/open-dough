import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { agentLaunchPlugin } from "./server/agentLaunchPlugin.ts";
import { authenticatedReadPlugin } from "./server/authenticatedReadPlugin.ts";

const dashboardRoot = fileURLToPath(new URL(".", import.meta.url));
// The one product source the dashboard shares: the backlog reader that owns
// what a published backlog means. The dev server may serve it and nothing else
// outside the dashboard.
const sharedBacklogReader = fileURLToPath(
  new URL("../src/skills/dough-product-backlog/scripts/", import.meta.url),
);

// The local authenticated read boundary (`./server/authenticatedRead.ts`) answers
// with whatever existing local `gh` credentials can already read, and the
// local launch boundary (`./server/agentLaunchPlugin.ts`) starts agent
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
    plugins: [react(), authenticatedReadPlugin(), agentLaunchPlugin()],
    server: {
      host: loopbackOnly,
      port: 43127,
      strictPort: true,
      fs: { allow: [dashboardRoot, sharedBacklogReader] },
    },
    preview: {
      host: loopbackOnly,
    },
  };
});
