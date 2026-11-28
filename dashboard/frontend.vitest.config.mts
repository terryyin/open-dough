import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { brandAssetPlugin } from "./server/brandAssetPlugin.ts";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

const defaultViewport = { width: 390, height: 844 };

const desktopSpecs = [
  "dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts",
  "dashboard/frontend-tests/launches/story-card-startup.spec.ts",
  "dashboard/frontend-tests/terminals/agent-terminal-touch-select-desktop.spec.ts",
];

export default defineConfig({
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), brandAssetPlugin()],
  test: {
    include: dashboardSpecFiles(import.meta.dirname, [frontendGroup.root]).map(
      (file) => `dashboard/${file}`,
    ),
    includeTaskLocation: true,
    isolate: true,
    // Page waits read the in-page DOM, so each settles within a frame of its
    // condition rather than Vitest's default 50 ms poll.
    expect: { poll: { interval: 5 } },
    browser: {
      enabled: true,
      headless: true,
      viewport: defaultViewport,
      provider: playwright({
        launchOptions: { args: dashboardBrowserArgs },
        contextOptions: { hasTouch: true, viewport: defaultViewport },
      }),
      instances: [
        { browser: "chromium", exclude: desktopSpecs },
        // A touch context cannot acquire a Linux fine pointer by disabling touch.
        {
          browser: "chromium",
          name: "chromium-desktop",
          include: desktopSpecs,
          provider: playwright({
            launchOptions: { args: dashboardBrowserArgs },
            contextOptions: { hasTouch: false, viewport: defaultViewport },
          }),
        },
      ],
    },
  },
});
