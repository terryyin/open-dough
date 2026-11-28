import type { CDPSession, Page } from "@playwright/test";
import { type CaptureLog, urlPath } from "./frontendCaptureLog.ts";

// Evidence for each orchestrator page: what Playwright saw happen to it, what
// the browser itself saw begin a navigation or unload, and which page script
// closed a WebSocket.
// Installed before the provider navigates, so the init script reaches every
// document and child frame the page loads.

const bindingName = "__openDoughFrontendCapture";
const textLimit = 300;
const stackLimit = 1500;

function withoutOriginsOrQueries(text: string, limit: number) {
  return text
    .replace(/[a-z]+:\/\/[^/\s)"']+/gi, "")
    .replace(/\?[^\s:)"']*/g, "")
    .slice(0, limit);
}

type PageReport = { event: string; details: Record<string, unknown> };

function reportPageEvents(name: string) {
  const report = (event: string, details: Record<string, unknown>) => {
    const binding = (window as unknown as Record<string, unknown>)[name];
    if (typeof binding === "function")
      void (binding as (report: PageReport) => Promise<void>)({
        event,
        details,
      });
  };
  window.addEventListener("beforeunload", () => {
    report("page-beforeunload", {});
  });
  window.addEventListener("pagehide", (event) => {
    report("page-pagehide", { persisted: event.persisted });
  });
  const { prototype } = WebSocket;
  const close = Object.getOwnPropertyDescriptor(prototype, "close")?.value as (
    this: WebSocket,
    code?: number,
    reason?: string,
  ) => void;
  prototype.close = function closeWithReport(
    this: WebSocket,
    code?: number,
    reason?: string,
  ) {
    report("page-websocket-close-call", {
      socket: this.url,
      code,
      stack: new Error("close").stack ?? "",
    });
    close.call(this, code, reason);
  };
}

async function exposeReports(record: CaptureLog, page: Page, session: number) {
  await page.exposeBinding(bindingName, (source, report: PageReport) => {
    const { event, details } = report;
    const { socket, stack, ...rest } = details;
    record(event, {
      session,
      top: source.frame === page.mainFrame(),
      frame: urlPath(source.frame.url()),
      ...rest,
      ...(typeof socket === "string" ? { socket: urlPath(socket) } : {}),
      ...(typeof stack === "string"
        ? { stack: withoutOriginsOrQueries(stack, stackLimit) }
        : {}),
    });
  });
  await page.addInitScript(reportPageEvents, bindingName);
}

async function observeDevTools(
  record: CaptureLog,
  cdp: CDPSession,
  session: number,
) {
  const { frameTree } = await cdp.send("Page.getFrameTree");
  const mainFrame = frameTree.frame.id;
  const sockets = new Map<string, string | undefined>();
  const where = (frameId: string) => ({ session, top: frameId === mainFrame });
  cdp.on("Page.frameRequestedNavigation", (event) => {
    record("cdp-navigation-requested", {
      ...where(event.frameId),
      reason: event.reason,
      disposition: event.disposition,
      path: urlPath(event.url),
    });
  });
  cdp.on("Page.frameStartedNavigating", (event) => {
    record("cdp-started-navigating", {
      ...where(event.frameId),
      navigationType: event.navigationType,
      path: urlPath(event.url),
    });
  });
  cdp.on("Page.frameStartedLoading", (event) => {
    record("cdp-started-loading", where(event.frameId));
  });
  cdp.on("Page.lifecycleEvent", (event) => {
    if (event.frameId === mainFrame)
      record("cdp-lifecycle", { session, name: event.name });
  });
  cdp.on("Network.webSocketCreated", (event) => {
    sockets.set(event.requestId, urlPath(event.url));
  });
  cdp.on("Network.webSocketClosed", (event) => {
    record("cdp-websocket-closed", {
      session,
      socket: sockets.get(event.requestId),
    });
  });
  cdp.on("Inspector.detached", (event) => {
    record("cdp-detached", { session, reason: event.reason });
  });
  cdp.on("Inspector.targetCrashed", () => {
    record("cdp-target-crashed", { session });
  });
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Page.setLifecycleEventsEnabled", { enabled: true }),
    cdp.send("Network.enable", {
      maxTotalBufferSize: 0,
      maxResourceBufferSize: 0,
    }),
    cdp.send("Inspector.enable"),
  ]);
}

function observePageEvents(record: CaptureLog, page: Page, session: number) {
  const recordPage = (event: string) => {
    record(event, { session, path: urlPath(page.url()) });
  };
  recordPage("page-open");
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) recordPage("main-frame-navigated");
  });
  page.on("close", () => {
    recordPage("page-close");
  });
  page.on("crash", () => {
    recordPage("page-crash");
  });
  page.on("console", (message) => {
    record("page-console", {
      session,
      type: message.type(),
      text: withoutOriginsOrQueries(message.text(), textLimit),
    });
  });
}

export async function observeOrchestratorPage(
  record: CaptureLog,
  page: Page,
  session: number,
) {
  observePageEvents(record, page, session);
  await exposeReports(record, page, session);
  const cdp = await page.context().newCDPSession(page);
  await observeDevTools(record, cdp, session);
}
