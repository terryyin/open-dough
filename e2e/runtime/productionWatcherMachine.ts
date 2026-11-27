// Owned machine resources for the public watcher's serial lifecycle journey.
import type { APIRequestContext, Browser, Page } from "@playwright/test";
import { expect } from "../../dashboard/test-support/support/pageTest.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readCursorRunnerAddress } from "../../dashboard/server/hosts/cursor/runnerPaths.ts";
import { openCursorTerminal } from "../../dashboard/test-support/support/cursorTerminal.ts";
import { developmentDashboard } from "../../dashboard/test-support/support/dashboardCommand.ts";
import { localPublishedMainFixture } from "../../dashboard/test-support/support/publishedMainFixture.ts";
import { repoRoot } from "../../dashboard/test-support/support/repositoryRoot.ts";
import { configureWatcherApplication } from "../../dashboard/test-support/support/productionWatcherFixture.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";
import { processGroup } from "../../dashboard/test-support/support/cursorRunnerJourney.ts";
import { incidentEntries } from "../../dashboard/test-support/support/readDiagnostics.ts";
import { serialFileResources } from "../../dashboard/test-support/support/serialFileResources.ts";
import { waitForWatcherTerminal } from "./productionWatcherClient.ts";
import {
  productionActivation,
  productionBoundary,
  startProductionWatcher,
  type ProductionWatcher,
} from "../../dashboard/test-support/support/productionWatcher.ts";

const bannerPath = "dashboard/src/DashboardBanner.tsx";
// Published with the pinned commit; only cartoon portraits are published.
const cartoonAvatar =
  "dashboard/public/agent-avatars/odd-e-nerds/cartoon/stanly.webp";
const photoAvatar =
  "dashboard/public/agent-avatars/odd-e-nerds/photo/stanly.webp";
const servedPath = (publicFile: string) =>
  publicFile.replace(/^dashboard\/public/, "");

// Production serves the published cartoon avatar, never the local photo one.
export async function expectPublishedAvatarsOnly(
  request: APIRequestContext,
  url: string,
) {
  const cartoon = await request.get(`${url}${servedPath(cartoonAvatar)}`);
  expect(cartoon.status()).toBe(200);
  expect(cartoon.headers()["content-type"]).toContain("image/webp");
  const photo = await request.get(`${url}${servedPath(photoAvatar)}`);
  expect(photo.headers()["content-type"] ?? "").not.toContain("image/webp");
}

// The one server process the machine's incident record started inside a
// preview's process group.
export function previewServer(root: string, previewPid: number) {
  const [server, ...others] = incidentEntries(root).filter(
    (entry) =>
      entry.kind === "process-started" &&
      processGroup(entry.pid) === previewPid,
  );
  if (server === undefined || others.length > 0) {
    throw new Error(
      `Expected one server process in preview group ${previewPid}.`,
    );
  }
  return server.pid;
}

// The process lifecycle entries the incident record holds for one process.
export const processRecord = (root: string, pid: number) =>
  incidentEntries(root)
    .filter((entry) => entry.pid === pid)
    .map((entry) => entry.kind)
    .filter((kind) => kind.startsWith("process-"));

export const sourceMarker = (page: Page) =>
  page.getByTestId("production-source");

export class ProductionWatcherMachine {
  // Released by `close` even when a later setup operation fails.
  private readonly resources = serialFileResources();
  private fixture:
    Awaited<ReturnType<typeof localPublishedMainFixture>> | undefined;
  private productionPage: Page | undefined;
  private developmentPage: Page | undefined;
  private readonly sockets: { close(): void }[] = [];
  watcher: ProductionWatcher | undefined;

  private preparation:
    Promise<{ env: NodeJS.ProcessEnv; pinned: string }> | undefined;
  private developmentStarting: Promise<string> | undefined;

  start(browser: Browser) {
    this.preparation = this.prepare(browser);
    return this.preparation;
  }

  private async prepare(browser: Browser) {
    const { resources } = this;
    const fixture = await resources.acquire(
      () => localPublishedMainFixture(true, "application"),
      (owned) => owned.cleanup(),
    );
    this.fixture = fixture;
    const banner = path.join(fixture.development, bannerPath);
    const bannerSource = await readFile(banner, "utf8");
    const pinnedBanner = bannerSource.replace(
      /<header\b[^>]*>/,
      '$&<p data-testid="production-source">PINNED SOURCE</p>',
    );
    if (pinnedBanner === bannerSource) {
      throw new Error(
        "Could not put the watcher source marker in the dashboard banner.",
      );
    }
    const pinned = await fixture.publish(
      {
        ...fixture.markerChanges("PINNED MAIN"),
        [bannerPath]: pinnedBanner,
        [cartoonAvatar]: await readFile(
          path.join(repoRoot, "dashboard/public/agent-avatars/atlas-1.webp"),
        ),
      },
      "Pinned main",
    );
    // A local photo avatar is never published, so never served.
    await mkdir(path.dirname(path.join(fixture.development, photoAvatar)), {
      recursive: true,
    });
    await writeFile(path.join(fixture.development, photoAvatar), "LOCAL PHOTO");
    const index = path.join(fixture.development, "dashboard/index.html");
    await writeFile(
      index,
      (await readFile(index, "utf8")).replace(
        /<title>.*?<\/title>/,
        "<title>DEVELOPMENT ONLY</title>",
      ),
    );
    await writeFile(
      banner,
      pinnedBanner.replace("PINNED SOURCE", "DEVELOPMENT SOURCE"),
    );
    await fixture.installDevelopment();
    resources.ensureOpen();
    const { env } = await configureWatcherApplication(fixture);
    this.watcher = await resources.acquire(
      () => startProductionWatcher(fixture.development, env),
      (watcher) => watcher.stop(),
    );
    const page = () =>
      resources.acquire(
        () => browser.newPage(),
        (opened) => opened.close(),
      );
    this.productionPage = await page();
    this.developmentPage = await page();
    return { env, pinned };
  }

  // The watcher's first activation and the Cursor runner it started.
  async activated(pinned: string) {
    const { fixture } = this.started();
    const served = await productionActivation(this.watcher, pinned);
    const runner = readCursorRunnerAddress(fixture.home);
    if (runner === undefined || !processRunning(runner.pid))
      throw new Error("Production activated without a running Cursor runner.");
    return { served, runner };
  }

  // Development beside production, started only after the production command
  // has started the Cursor runner.
  developmentStarted(env: NodeJS.ProcessEnv) {
    this.developmentStarting = this.startDevelopment(env);
    return this.developmentStarting;
  }

  private async startDevelopment(env: NodeJS.ProcessEnv) {
    const { fixture } = this.started();
    const started = await this.resources.acquire(
      () => developmentDashboard(fixture.development, env),
      (development) => development.command.stop(),
    );
    return started.url;
  }

  started() {
    const { fixture, productionPage, developmentPage } = this;
    if (
      fixture === undefined ||
      productionPage === undefined ||
      developmentPage === undefined
    ) {
      throw new Error("The file's setup did not complete");
    }
    return { fixture, productionPage, developmentPage };
  }

  // The watcher this machine runs now.
  running() {
    if (this.watcher === undefined) throw new Error("No watcher");
    return this.watcher;
  }

  async editDevelopmentSource() {
    const { fixture, productionPage } = this.started();
    let navigations = 0;
    productionPage.on("framenavigated", (frame) => {
      if (frame === productionPage.mainFrame()) navigations++;
    });
    await productionPage.evaluate(() => {
      document.documentElement.dataset["openWatcherPage"] = "retained";
    });
    const banner = path.join(fixture.development, bannerPath);
    await writeFile(
      banner,
      (await readFile(banner, "utf8")).replace(
        "DEVELOPMENT SOURCE",
        "EDITED DEVELOPMENT SOURCE",
      ),
    );
    return () => navigations;
  }

  boundary(url: string) {
    return productionBoundary(url, this.started().fixture.home);
  }

  async followCursorSession(url: string, sessionId: string, pid: number) {
    const terminal = await openCursorTerminal(this.boundary(url), sessionId);
    this.sockets.push(terminal.socket);
    await waitForWatcherTerminal(terminal, `WATCHER CLIENT ${pid}`);
    return terminal;
  }

  // A restarted watcher is a test's own; the rest is released in reverse.
  async close() {
    // Own setup through settlement before its HOME is removed.
    const settled = await Promise.allSettled([
      this.preparation,
      this.developmentStarting,
    ]);
    const errors: unknown[] = [];
    for (const result of settled)
      if (result.status === "rejected") errors.push(result.reason);
    try {
      if (errors.length > 0)
        throw new AggregateError(errors, "Watcher setup did not complete");
    } finally {
      for (const socket of this.sockets) socket.close();
      try {
        await this.watcher?.stop();
      } finally {
        await this.resources.release();
      }
    }
  }
}
