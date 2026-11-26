import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { brandAssetPlugin } from "./server/brandAssetPlugin.ts";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import { frontendDisconnectCapture } from "./test-support/support/frontendDisconnectCapture.ts";
import { isVitestFile } from "./test-support/support/groupSelection.mjs";
import { dashboardSpecFiles } from "./test-support/support/testFiles.mjs";
import { useDisposableTestHome } from "./test-support/support/runnerConfig.mjs";

useDisposableTestHome();

const defaultViewport = { width: 390, height: 844 };

const desktopSpecs = [
  "dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts",
  "dashboard/frontend-tests/launches/story-card-startup.spec.ts",
  "dashboard/frontend-tests/terminals/agent-terminal-touch-select-desktop.spec.ts",
];

// Temporary hosted diagnosis. At enablement, set the cutoff to at most 72 hours
// after publication. Remove this gate and its capture at the recorded stop.
const captureUntil = Date.parse("2026-11-29T09:54:00Z");
const diagnostics =
  Date.now() < captureUntil &&
  process.env["GITHUB_ACTIONS"] === "true" &&
  process.env["RUNNER_ENVIRONMENT"] === "github-hosted" &&
  process.env["GITHUB_EVENT_NAME"] === "push" &&
  process.env["GITHUB_REF"] ===
    "refs/heads/codex/prove-dashboard-launch-starts-and-recovery-in-no" &&
  process.env["OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT"] === "1/2"
    ? frontendDisconnectCapture()
    : undefined;
const frontendProvider = diagnostics?.provider ?? playwright;

export default defineConfig({
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), brandAssetPlugin(), diagnostics?.plugin],
  test: {
    // The frontend specs that import Vitest, beside the group's Playwright
    // specs (../scripts/test-frontend.mjs).
    include: dashboardSpecFiles(import.meta.dirname, [frontendGroup.root])
      .filter(isVitestFile)
      .map((file) => `dashboard/${file}`),
    includeTaskLocation: true,
    isolate: true,
    // A file's history traversals stay inside its own tester frame.
    setupFiles: [
      "dashboard/test-support/component-mount/historyTraversalGuard.ts",
    ],
    browser: {
      enabled: true,
      headless: true,
      viewport: defaultViewport,
      provider: frontendProvider({
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
          provider: frontendProvider({
            launchOptions: { args: dashboardBrowserArgs },
            contextOptions: { hasTouch: false, viewport: defaultViewport },
          }),
        },
      ],
    },
  },
});
