import { readFileSync, statfsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "@playwright/test";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import type { BrowserProvider } from "vitest/node";
import { brandAssetPlugin } from "./server/brandAssetPlugin.ts";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
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

function readDiagnostic(path: string) {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return undefined;
  }
}

function temporarySpace() {
  try {
    const stats = statfsSync(tmpdir());
    return stats.bavail * stats.bsize;
  } catch {
    return undefined;
  }
}

// Temporary observation of the frontend shard's orchestrator disconnect.
function logLifecycle(event: string, details: object = {}) {
  console.error(
    JSON.stringify({
      time: new Date().toISOString(),
      source: "frontend-browser-lifecycle",
      event,
      ...details,
    }),
  );
}

function logResources() {
  const cgroup = readDiagnostic("/proc/self/cgroup")?.match(/^0::(.*)$/m)?.[1];
  logLifecycle("resources", {
    tmpFreeBytes: temporarySpace(),
    memoryEvents: cgroup
      ? readDiagnostic(join("/sys/fs/cgroup", cgroup, "memory.events"))
      : undefined,
    hostOomKills:
      readDiagnostic("/proc/vmstat")?.match(/^oom_kill (\d+)$/m)?.[1],
  });
}

type ObservedProvider = BrowserProvider & {
  openBrowserPage: (
    sessionId: string,
    options: Parameters<BrowserProvider["openPage"]>[2],
  ) => Promise<Page>;
};

const browserIds = new WeakMap<Browser, number>();
let nextBrowserId = 0;
let resourceTimer: NodeJS.Timeout | undefined;

function frontendProvider(options: Parameters<typeof playwright>[0]) {
  const provider = playwright(options);
  if (process.env.OPEN_DOUGH_FRONTEND_LIFECYCLE_DIAGNOSTIC !== "1") {
    return provider;
  }
  return {
    ...provider,
    providerFactory(project) {
      const instance = provider.providerFactory(project) as ObservedProvider;
      const openBrowserPage = instance.openBrowserPage.bind(instance);
      const close = instance.close.bind(instance);
      instance.openBrowserPage = async (sessionId, options) => {
        const page = await openBrowserPage(sessionId, options);
        if (!resourceTimer) {
          logResources();
          resourceTimer = setInterval(logResources, 15_000).unref();
        }
        const browser = page.context().browser();
        if (browser && !browserIds.has(browser)) {
          const browserId = ++nextBrowserId;
          browserIds.set(browser, browserId);
          browser.on("disconnected", () => {
            logLifecycle("browser-disconnected", { browserId });
            logResources();
          });
        }
        const session = {
          project: project.name,
          sessionId,
          browserId: browser ? browserIds.get(browser) : undefined,
        };
        logLifecycle("page-open", session);
        page.on("framenavigated", (frame) => {
          if (frame === page.mainFrame()) {
            logLifecycle("main-frame-navigated", {
              ...session,
              url: frame.url().split(/[?#]/, 1)[0],
            });
          }
        });
        page.on("crash", () => {
          logLifecycle("page-crashed", session);
        });
        page.on("close", () => {
          logLifecycle("page-closed", session);
        });
        return page;
      };
      instance.close = (options) => {
        logLifecycle("provider-close", { project: project.name });
        return close(options);
      };
      return instance;
    },
  } satisfies typeof provider;
}

export default defineConfig({
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), brandAssetPlugin()],
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
