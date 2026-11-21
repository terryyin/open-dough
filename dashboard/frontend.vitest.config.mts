import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import { isVitestFile } from "./test-support/support/groupSelection.mjs";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

export default defineConfig({
  plugins: [react()],
  test: {
    // The frontend specs that import Vitest, beside the group's Playwright
    // specs (../scripts/test-frontend.mjs).
    include: dashboardSpecFiles(import.meta.dirname, [frontendGroup.root])
      .filter(isVitestFile)
      .map((file) => `dashboard/${file}`),
    includeTaskLocation: true,
    isolate: true,
    browser: {
      enabled: true,
      headless: true,
      viewport: { width: 390, height: 844 },
      provider: playwright({
        launchOptions: { args: dashboardBrowserArgs },
        contextOptions: { hasTouch: true },
      }),
      instances: [{ browser: "chromium" }],
    },
  },
});
