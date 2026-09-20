import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dashboardRoot = fileURLToPath(new URL(".", import.meta.url));
// The one product source the dashboard shares: the backlog reader that owns
// what a published backlog means. The dev server may serve it and nothing else
// outside the dashboard.
const sharedBacklogReader = fileURLToPath(
  new URL("../src/skills/dough-product-backlog/scripts/", import.meta.url),
);

export default defineConfig({
  root: dashboardRoot,
  plugins: [react()],
  server: {
    fs: { allow: [dashboardRoot, sharedBacklogReader] },
  },
});
