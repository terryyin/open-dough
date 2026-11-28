import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { brandAssetPlugin } from "./server/brandAssetPlugin.ts";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import {
  frontendCaptureVariable,
  frontendDisconnectCapture,
} from "./test-support/support/frontendDisconnectCapture.ts";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

const defaultViewport = { width: 390, height: 844 };

const desktopSpecs = [
  "dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts",
  "dashboard/frontend-tests/launches/story-card-startup.spec.ts",
  "dashboard/frontend-tests/terminals/agent-terminal-touch-select-desktop.spec.ts",
];

const capture = frontendDisconnectCapture(process.env[frontendCaptureVariable]);
export default defineConfig({
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), brandAssetPlugin(), ...capture.plugins],
  test: {
    include: dashboardSpecFiles(import.meta.dirname, [frontendGroup.root]).map(
      (file) => `dashboard/${file}`,
    ),
    includeTaskLocation: true,
    isolate: true,
    // Page waits read the in-page DOM, so each settles within a frame of its
    // condition rather than Vitest's default 50 ms poll.
    expect: { poll: { interval: 5 } },
    // A file's history traversals stay inside its own tester frame.
    setupFiles: [
      "dashboard/test-support/component-mount/historyTraversalGuard.ts",
    ],
    browser: {
      enabled: true,
      headless: true,
      viewport: defaultViewport,
      provider: capture.provider({
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
          provider: capture.provider({
            launchOptions: { args: dashboardBrowserArgs },
            contextOptions: { hasTouch: false, viewport: defaultViewport },
          }),
        },
      ],
    },
  },
});
