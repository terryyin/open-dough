import type { ChildProcess } from "node:child_process";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { Browser, Page } from "@playwright/test";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vitest/config";
import type { BrowserProvider } from "vitest/node";
import {
  captureLog,
  captureVitestBrowserDebug,
  type CaptureLog,
  urlPath,
} from "./frontendCaptureLog.ts";
import { observeOrchestratorPage } from "./orchestratorPageCapture.ts";
import { viteServerCapture } from "./viteServerCapture.ts";

// Set to a log file path to record what happens around the orchestrator socket
// during a frontend run; add DEBUG=vitest:browser* to include Vitest's browser
// API debug lines. Unset, the run uses the ordinary provider.
export const frontendCaptureVariable = "OPEN_DOUGH_FRONTEND_CAPTURE";

type ObservedProvider = BrowserProvider & {
  openBrowserPage: (
    sessionId: string,
    options: Parameters<BrowserProvider["openPage"]>[2],
  ) => Promise<Page>;
};
type BrowserImplementation = {
  options?: { browserProcess?: { process?: ChildProcess } };
};

function localBrowserProcess(browser: Browser) {
  // Playwright's pinned in-process client can expose its existing child handle.
  // If the implementation changes or the browser is remote, omit OS evidence.
  const { _connection } = browser as Browser & {
    _connection?: { toImpl?: (browser: Browser) => BrowserImplementation };
  };
  try {
    return _connection?.toImpl?.(browser).options?.browserProcess?.process;
  } catch {
    return undefined;
  }
}

function apiSocketCapture(record: CaptureLog): Plugin {
  const servers = new WeakSet<object>();
  return {
    name: "frontend-api-socket-capture",
    configureServer({ httpServer }) {
      if (!httpServer || servers.has(httpServer)) return;
      servers.add(httpServer);
      httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex) => {
        const { url = "" } = request;
        if (urlPath(url) !== "/__vitest_browser_api__") return;
        const params = new URL(url, "http://localhost").searchParams;
        const type = params.get("type") ?? undefined;
        record("api-connect", { type });
        socket.prependOnceListener("close", (hadError: boolean) => {
          record("api-disconnect", { type, hadError });
        });
      });
    },
  };
}

function observeBrowser(record: CaptureLog, browser: Browser, id: number) {
  const child = localBrowserProcess(browser);
  record("browser-open", { browser: id, pid: child?.pid });
  child?.once("exit", (code, signal) => {
    record("chromium-exit", { browser: id, code, signal });
  });
  browser.on("disconnected", () => {
    record("browser-disconnected", { browser: id });
  });
}

function observedProvider(record: CaptureLog) {
  const browsers = new WeakSet<Browser>();
  let nextBrowser = 0;
  let nextProvider = 0;
  let nextSession = 0;
  return (options: Parameters<typeof playwright>[0]) => {
    const base = playwright(options);
    return {
      ...base,
      providerFactory(project) {
        const provider = ++nextProvider;
        const instance = base.providerFactory(project) as ObservedProvider;
        const openBrowserPage = instance.openBrowserPage.bind(instance);
        const close = instance.close.bind(instance);
        instance.openBrowserPage = async (sessionId, pageOptions) => {
          const page = await openBrowserPage(sessionId, pageOptions);
          const browser = page.context().browser();
          if (browser && !browsers.has(browser)) {
            browsers.add(browser);
            observeBrowser(record, browser, ++nextBrowser);
          }
          await observeOrchestratorPage(record, page, ++nextSession);
          return page;
        };
        instance.close = async (closeOptions) => {
          record("provider-close", { provider });
          await close(closeOptions);
          record("provider-closed", { provider });
        };
        return instance;
      },
    } satisfies typeof base;
  };
}

export function frontendDisconnectCapture(file: string | undefined) {
  if (!file) return { plugins: [], provider: playwright };
  const record = captureLog(file);
  captureVitestBrowserDebug(record);
  record("capture-start");
  return {
    plugins: [apiSocketCapture(record), viteServerCapture(record)],
    provider: observedProvider(record),
  };
}
