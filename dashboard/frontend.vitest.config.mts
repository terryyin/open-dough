import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { normalizePath, type Plugin } from "vite";
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

function keepVitestOrchestratorOpen(): Plugin {
  const require = createRequire(import.meta.url);
  const viteClient = normalizePath(
    join(
      dirname(require.resolve("vite/package.json")),
      "dist/client/client.mjs",
    ),
  );
  const disconnect =
    /(if \(payload\.event === "vite:ws:disconnect"\) \{\s*if \(hasDocument && !willUnload)\)/g;

  return {
    name: "keep-vitest-orchestrator-open",
    enforce: "post",
    transform(code, id) {
      if (id !== viteClient) return;
      if ([...code.matchAll(disconnect)].length !== 1) {
        this.error(
          "Vite's HMR disconnect handler changed. Recheck the Vitest orchestrator reload guard.",
        );
      }
      // The test RPC can still be live when Vite's separate HMR socket closes.
      // Reloading the orchestrator would destroy that RPC and its active tests.
      return code.replace(
        disconnect,
        '$1 && !(window === window.top && location.pathname === "/__vitest_test__/"))',
      );
    },
  };
}

export default defineConfig({
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), brandAssetPlugin(), keepVitestOrchestratorOpen()],
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
