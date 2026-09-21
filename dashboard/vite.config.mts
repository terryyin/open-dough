import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { privateReadPlugin } from "./server/privateRead";

const dashboardRoot = fileURLToPath(new URL(".", import.meta.url));
// The one product source the dashboard shares: the backlog reader that owns
// what a published backlog means. The dev server may serve it and nothing else
// outside the dashboard.
const sharedBacklogReader = fileURLToPath(
  new URL("../src/skills/dough-product-backlog/scripts/", import.meta.url),
);

// The local authenticated read boundary (`./server/privateRead.ts`) answers
// with whatever existing local `gh` credentials can already read; it must
// only ever be reachable on loopback, never on a network interface a shared
// machine exposes.
const loopbackOnly = "127.0.0.1";

export default defineConfig({
  root: dashboardRoot,
  plugins: [react(), privateReadPlugin()],
  server: {
    host: loopbackOnly,
    fs: { allow: [dashboardRoot, sharedBacklogReader] },
  },
  preview: {
    host: loopbackOnly,
  },
});
