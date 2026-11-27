import { defineConfig } from "vitest/config";
import { backendGroup } from "./test-support/support/browserTestGroups.mjs";
import { isVitestFile } from "./test-support/support/groupSelection.mjs";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

// Dashboard Backend Test's Vitest engine: the backend specs that import
// Vitest, in Node, beside the group's Playwright specs
// (../scripts/test-backend.mjs).
export default defineConfig({
  test: {
    include: dashboardSpecFiles(import.meta.dirname, [backendGroup.root])
      .filter(isVitestFile)
      .map((file) => `dashboard/${file}`),
    includeTaskLocation: true,
    environment: "node",
    globalSetup: [
      `${import.meta.dirname}/test-support/support/backendGlobalSetup.ts`,
    ],
  },
});
