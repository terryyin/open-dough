// Owned machine resources for the public watcher's serial lifecycle journey.
import type { Browser, Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { launch } from "../agentLaunchBoundary.ts";
import { openCursorTerminal } from "../support/cursorTerminal.ts";
import {
  dashboardCommand,
  developmentDashboard,
} from "../support/dashboardCommand.ts";
import { installFakeCursor, type FakeCursor } from "../support/fakeCursor.ts";
import { instruction, liveRunner } from "../support/cursorRunnerJourney.ts";
import { expect } from "../support/pageTest.ts";
import { publishedMainFixture } from "../support/publishedMainFixture.ts";
import type { PublishedMainFixture } from "../support/publishedMainFixture.ts";
import { publishedMainHosts } from "../support/publishedMainHosts.ts";
import { configureDevelopmentProjects } from "../support/projectConfiguration.ts";
import {
  productionActivation,
  productionBoundary,
  startProductionWatcher,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";

const bannerPath = "dashboard/src/DashboardBanner.tsx";
export const sourceMarker = (page: Page) =>
  page.getByTestId("production-source");

export class ProductionWatcherMachine {
  private fixture: PublishedMainFixture | undefined;
  private hosts: Awaited<ReturnType<typeof publishedMainHosts>> | undefined;
  private cursor: FakeCursor | undefined;
  private development: ReturnType<typeof dashboardCommand> | undefined;
  private productionPage: Page | undefined;
  private developmentPage: Page | undefined;
  private readonly sockets: { close(): void }[] = [];
  watcher: ProductionWatcher | undefined;

  async start(browser: Browser) {
    const cursor = installFakeCursor({ working: true });
    this.cursor = cursor;
    const fixture = await publishedMainFixture(true);
    this.fixture = fixture;
    const hosts = await publishedMainHosts(fixture);
    this.hosts = hosts;
    const env = {
      ...hosts.env,
      ...cursor.env,
      PATH: [cursor.binDir, hosts.env["PATH"] ?? ""].join(path.delimiter),
    };
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
    configureDevelopmentProjects(fixture.home);
    this.watcher = startProductionWatcher(fixture.development, env);
    this.productionPage = await browser.newPage();
    this.developmentPage = await browser.newPage();
    return { env, pinned };
  }

  // The watcher's first activation and the Cursor runner it started.
  async activated(pinned: string) {
    const { fixture } = this.started();
    const served = await productionActivation(this.watcher, pinned);
    const runner = await liveRunner(fixture.home);
    return { served, runner };
  }

  // Development beside production, started only after the production command
  // has started the Cursor runner.
  async developmentStarted(env: NodeJS.ProcessEnv) {
    const { fixture } = this.started();
    const started = await developmentDashboard(fixture.development, env);
    this.development = started.command;
    return started.url;
  }

  started() {
    const { fixture, cursor, productionPage, developmentPage } = this;
    if (
      fixture === undefined ||
      cursor === undefined ||
      productionPage === undefined ||
      developmentPage === undefined
    ) {
      throw new Error("The file's setup did not complete");
    }
    return { fixture, cursor, productionPage, developmentPage };
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

  async launchCursor(url: string) {
    return launch(this.boundary(url), {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
  }

  // Follows the Cursor session's terminal at that production URL until the
  // session shows its prompt; close() ends the terminal's socket.
  async followCursorSession(url: string, sessionId: string) {
    const terminal = await openCursorTerminal(this.boundary(url), sessionId);
    this.sockets.push(terminal.socket);
    await expect.poll(() => terminal.output()).toContain("ctrl+c to stop");
    return terminal;
  }

  async close() {
    for (const socket of this.sockets) socket.close();
    await this.productionPage?.close();
    await this.developmentPage?.close();
    await this.watcher?.stop();
    await this.development?.stop();
    this.cursor?.cleanup();
    await this.fixture?.cleanup();
    await this.hosts?.close();
  }
}

export async function occupyProductionPort(url: string) {
  const port = new URL(url).port;
  const listener = createServer((req, res) => {
    req.resume();
    res.end("UNOWNED LISTENER");
  });
  await new Promise<void>((resolve) =>
    listener.listen(Number(port), "127.0.0.1", resolve),
  );
  return {
    port,
    close: () =>
      new Promise<void>((resolve, reject) =>
        listener.close((error) => {
          if (error) reject(error);
          else resolve();
        }),
      ),
  };
}
