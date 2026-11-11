// Vite builds and serves the published page with the real drain middleware.
import { defineConfig } from "vite";
import { installAgentLaunchMiddleware } from "../../server/launchBoundary.ts";
import { localBoundaryPlugin } from "../../server/localBoundaryPlugin.ts";

export default defineConfig({
  plugins: [
    localBoundaryPlugin({
      name: "dough-agent-launch",
      install: installAgentLaunchMiddleware,
    }),
  ],
});
