import { errorMonitor } from "node:events";
import { readFileSync, statfsSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Duplex } from "node:stream";
import type { Browser, Page } from "@playwright/test";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vitest/config";
import type { BrowserProvider, Reporter, Vitest } from "vitest/node";

type ObservedProvider = BrowserProvider & {
  openBrowserPage: (
    sessionId: string,
    options: Parameters<BrowserProvider["openPage"]>[2],
  ) => Promise<Page>;
};

type ObservedSession = {
  readonly id: number;
  page?: Page;
  browser?: number | undefined;
  provider?: number;
};

function readDiagnostic(file: string) {
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    return undefined;
  }
}

function runnerResources() {
  const cgroup = readDiagnostic("/proc/self/cgroup")?.match(/^0::(.*)$/m)?.[1];
  let tmpFreeBytes: number | undefined;
  try {
    const { bavail, bsize } = statfsSync(tmpdir());
    tmpFreeBytes = bavail * bsize;
  } catch {
    // An unavailable resource counter must not change the test result.
  }
  return {
    tmpFreeBytes,
    memoryEvents: cgroup
      ? readDiagnostic(join("/sys/fs/cgroup", cgroup, "memory.events"))
      : undefined,
    hostOomKills:
      readDiagnostic("/proc/vmstat")?.match(/^oom_kill (\d+)$/m)?.[1],
  };
}

function pageRoute(url: string) {
  if (url.startsWith("about:blank")) return "blank";
  if (URL.canParse(url) && /^\/__vitest_test__\/?$/.test(new URL(url).pathname))
    return "orchestrator";
  return "other";
}

// One hosted diagnosis of the socket that runs the Vitest browser shard.
export function frontendDisconnectCapture() {
  const started = performance.now();
  const baselineResources = runnerResources();
  const sessions = new Map<string, ObservedSession>();
  const browsers = new WeakMap<Browser, number>();
  const servers = new WeakSet<object>();
  const runners = new WeakSet<Vitest>();
  const recent: object[] = [];
  let nextBrowser = 0;
  let nextProvider = 0;

  function record(event: string, details: object) {
    recent.push({
      elapsedMs: Math.round(performance.now() - started),
      event,
      ...details,
    });
    if (recent.length > 96) recent.shift();
  }

  function sessionFor(sessionId: string): ObservedSession {
    const existing = sessions.get(sessionId);
    if (existing) return existing;
    const session = { id: sessions.size + 1 };
    sessions.set(sessionId, session);
    return session;
  }

  function state(sessionId: string) {
    const { id, page, browser, provider } = sessionFor(sessionId);
    return {
      session: id,
      browser,
      provider,
      browserConnected: page?.context().browser()?.isConnected(),
      pageClosed: page?.isClosed(),
      route: page ? pageRoute(page.url()) : undefined,
    };
  }

  const reporter: Reporter = {
    onTestRunEnd(...result) {
      const [, errors] = result;
      if (
        !errors.some(
          (error) =>
            error["code"] === "VITEST_BROWSER_CONNECTION_CLOSED" ||
            error.cause?.["code"] === "VITEST_BROWSER_CONNECTION_CLOSED",
        )
      )
        return;
      console.error(
        JSON.stringify({
          source: "frontend-disconnect",
          baselineResources,
          recent,
          finalResources: runnerResources(),
        }),
      );
    },
  };

  const plugin: Plugin = {
    name: "frontend-disconnect-capture",
    configureServer({ httpServer }) {
      if (!httpServer || servers.has(httpServer)) return;
      servers.add(httpServer);
      httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex) => {
        if (!request.url?.startsWith("/__vitest_browser_api__?")) return;
        const { searchParams } = new URL(request.url, "http://localhost");
        const sessionId = searchParams.get("sessionId");
        if (searchParams.get("type") !== "orchestrator" || !sessionId) return;
        record("transport-upgrade", state(sessionId));
        socket.once(errorMonitor, (error: NodeJS.ErrnoException) => {
          record("tcp-error", { ...state(sessionId), code: error.code });
        });
        socket.prependOnceListener("end", () => {
          record("tcp-end", state(sessionId));
        });
        socket.prependOnceListener("close", (hadError: boolean) => {
          record("tcp-close", {
            ...state(sessionId),
            hadError,
            resources: runnerResources(),
          });
        });
      });
    },
    configureVitest({ vitest }) {
      if (runners.has(vitest)) return;
      runners.add(vitest);
      vitest.config.reporters.push(reporter);
    },
  };

  function provider(options: Parameters<typeof playwright>[0]) {
    const base = playwright(options);
    return {
      ...base,
      providerFactory(project) {
        const provider = ++nextProvider;
        const instance = base.providerFactory(project) as ObservedProvider;
        const openBrowserPage = instance.openBrowserPage.bind(instance);
        const close = instance.close.bind(instance);
        instance.openBrowserPage = async (sessionId, options) => {
          const page = await openBrowserPage(sessionId, options);
          const session = sessionFor(sessionId);
          session.page = page;
          session.provider = provider;
          const browser = page.context().browser();
          if (browser && !browsers.has(browser)) {
            const id = ++nextBrowser;
            browsers.set(browser, id);
            browser.on("disconnected", () => {
              record("browser-disconnected", { browser: id });
            });
          }
          session.browser = browser ? browsers.get(browser) : undefined;
          record("page-open", state(sessionId));
          page.on("framenavigated", (frame) => {
            if (frame === page.mainFrame())
              record("main-frame-navigated", state(sessionId));
          });
          page.on("websocket", (websocket) => {
            const { pathname, searchParams } = new URL(websocket.url());
            if (
              pathname !== "/__vitest_browser_api__" ||
              searchParams.get("type") !== "orchestrator"
            )
              return;
            websocket.on("close", () => {
              record("page-websocket-close", state(sessionId));
            });
          });
          page.on("close", () => {
            record("page-close", state(sessionId));
          });
          page.on("crash", () => {
            record("page-crash", state(sessionId));
          });
          return page;
        };
        instance.close = (options) => {
          record("provider-close", { provider });
          return close(options);
        };
        return instance;
      },
    } satisfies typeof base;
  }

  return { plugin, provider };
}
