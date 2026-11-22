import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import { isVitestFile } from "./test-support/support/groupSelection.mjs";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

const desktopLaunchSpecs = [
  "dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts",
  "dashboard/frontend-tests/launches/story-card-startup.spec.ts",
];

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
      commands: {
        // Bounded well inside the test timeout, so a stuck tap fails with
        // Playwright's call log naming the stage it waited in.
        tapMountedControl: ({ iframe }, selector: string) =>
          iframe.locator(selector).tap({ timeout: 5000 }),
      },
      instances: [
        { browser: "chromium", exclude: desktopLaunchSpecs },
        // A touch context cannot acquire a Linux fine pointer by disabling touch.
        {
          browser: "chromium",
          name: "chromium-desktop",
          include: desktopLaunchSpecs,
          provider: playwright({
            launchOptions: { args: dashboardBrowserArgs },
            contextOptions: { hasTouch: false },
          }),
        },
      ],
    },
  },
});
