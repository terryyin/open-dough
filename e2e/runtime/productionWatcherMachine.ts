// Owned machine resources for the public watcher's serial lifecycle journey.
import type { Browser, Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readCursorRunnerAddress } from "../../dashboard/server/hosts/cursor/runnerPaths.ts";
import { openCursorTerminal } from "../../dashboard/tests/support/cursorTerminal.ts";
import { developmentDashboard } from "../../dashboard/tests/support/dashboardCommand.ts";
import { localPublishedMainFixture } from "../../dashboard/tests/support/publishedMainFixture.ts";
import { configureWatcherApplication } from "../../dashboard/tests/support/productionWatcherFixture.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import { serialFileResources } from "../../dashboard/tests/support/serialFileResources.ts";
import { waitForWatcherTerminal } from "./productionWatcherClient.ts";
import {
  productionActivation,
  productionBoundary,
  startProductionWatcher,
  type ProductionWatcher,
} from "../../dashboard/tests/support/productionWatcher.ts";

const bannerPath = "dashboard/src/DashboardBanner.tsx";
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

  async start(browser: Browser) {
    const { resources } = this;
    const fixture = await resources.acquire(
      () => localPublishedMainFixture(true, "application"),
      (owned) => owned.cleanup(),
    );
    this.fixture = fixture;
    const banner = path.join(fixture.development, bannerPath);
    const pinnedBanner = (await readFile(banner, "utf8")).replace(
      "<SessionsButton />",
      '<p data-testid="production-source">PINNED SOURCE</p><SessionsButton />',
    );
    const pinned = await fixture.publish(
      { ...fixture.markerChanges("PINNED MAIN"), [bannerPath]: pinnedBanner },
      "Pinned main",
    );
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
  async developmentStarted(env: NodeJS.ProcessEnv) {
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
    for (const socket of this.sockets) socket.close();
    try {
      await this.watcher?.stop();
    } finally {
      await this.resources.release();
    }
  }
}
