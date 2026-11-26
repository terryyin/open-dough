import type { ChildProcess } from "node:child_process";
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

type ObservedBrowser = { id: number; child: ChildProcess | undefined };
type BrowserImplementation = {
  options?: { browserProcess?: { process?: ChildProcess } };
};
type ObservedSession = {
  readonly id: number;
  page?: Page;
  browser?: ObservedBrowser | undefined;
  provider?: number;
};

function localBrowserProcess(browser: Browser) {
  // Playwright's pinned in-process client can expose its existing child handle.
  // If the implementation changes or the browser is remote, omit OS evidence.
  const { _connection } = browser as Browser & {
    _connection?: { toImpl?: (browser: Browser) => BrowserImplementation };
  };
  try {
    const implementation = _connection?.toImpl?.(browser);
    return implementation?.options?.browserProcess?.process;
  } catch {
    return undefined;
  }
}

function processState(child: ChildProcess | undefined) {
  if (!child?.pid) return undefined;
  if (child.exitCode !== null || child.signalCode !== null) return "exited";
  try {
    process.kill(child.pid, 0);
    return "present";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return "absent";
    return undefined;
  }
}

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

export function frontendDisconnectCapture() {
  const started = performance.now();
  const baselineResources = runnerResources();
  const sessions = new Map<string, ObservedSession>();
  const browsers = new WeakMap<Browser, ObservedBrowser>();
  const servers = new WeakSet<object>();
  const runners = new WeakSet<Vitest>();
  const recent: object[] = [];
  const capture = { source: "frontend-disconnect", baselineResources, recent };
  let nextBrowser = 0;
  let nextProvider = 0;
  let matched = false;

  function record(event: string, details: object = {}) {
    const elapsedMs = Math.round(performance.now() - started);
    recent.push({ elapsedMs, event, ...details });
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
      browser: browser?.id,
      provider,
      browserConnected: page?.context().browser()?.isConnected(),
      pageClosed: page?.isClosed(),
      route: page ? pageRoute(page.url()) : undefined,
    };
  }

  const reporter: Reporter = {
    onTestRunEnd(...result) {
      const [, errors] = result;
      const code = "VITEST_BROWSER_CONNECTION_CLOSED";
      const disconnected = errors.some(
        (error) => error["code"] === code || error.cause?.["code"] === code,
      );
      if (!disconnected) return;
      matched = true;
      record("test-run-ended");
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
            browserProcess: processState(sessionFor(sessionId).browser?.child),
            resources: runnerResources(),
          });
        });
      });
    },
    configureVitest({ vitest }) {
      if (runners.has(vitest)) return;
      runners.add(vitest);
      vitest.config.reporters.push(reporter);
      // Vitest runs this callback after its browser pool has closed the providers.
      vitest.onClose(() => {
        if (!matched) return;
        const finalResources = runnerResources();
        console.error(JSON.stringify({ ...capture, finalResources }));
      });
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
            const child = localBrowserProcess(browser);
            browsers.set(browser, { id, child });
            const browserProcess = processState(child);
            record("browser-open", { browser: id, browserProcess });
            child?.once("exit", (code, signal) => {
              record("browser-process-exit", { browser: id, code, signal });
            });
            browser.on("disconnected", () => {
              record("browser-disconnected", {
                browser: id,
                browserProcess: processState(child),
              });
            });
          }
          session.browser = browser ? browsers.get(browser) : undefined;
          const recordPage = (event: string) => {
            record(event, state(sessionId));
          };
          recordPage("page-open");
          page.on("framenavigated", (frame) => {
            if (frame === page.mainFrame()) recordPage("main-frame-navigated");
          });
          page.on("websocket", (websocket) => {
            const { pathname, searchParams } = new URL(websocket.url());
            if (pathname !== "/__vitest_browser_api__") return;
            if (searchParams.get("type") !== "orchestrator") return;
            websocket.on(
              "close",
              recordPage.bind(undefined, "page-websocket-close"),
            );
          });
          page.on("close", recordPage.bind(undefined, "page-close"));
          page.on("crash", recordPage.bind(undefined, "page-crash"));
          return page;
        };
        instance.close = (options) => {
          record("provider-close", { provider, keepWarm: options?.keepWarm });
          const closing = close(options);
          void Promise.resolve(closing).then(
            record.bind(undefined, "provider-closed", { provider }),
            record.bind(undefined, "provider-close-rejected", { provider }),
          );
          return closing;
        };
        return instance;
      },
    } satisfies typeof base;
  }
  return { plugin, provider };
}
