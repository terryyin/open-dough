import { defineConfig } from "vitest/config";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

// Dashboard Backend Test's Vitest engine: `.unit` backend specs in Node,
// beside the group's Playwright specs (../scripts/test-backend.mjs).
export default defineConfig({
  test: {
    include: ["dashboard/backend-tests/**/*.unit.{spec,test}.?(c|m)[jt]s?(x)"],
    includeTaskLocation: true,
    environment: "node",
  },
});
