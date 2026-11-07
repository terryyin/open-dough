// Owned machine resources for the public watcher's serial lifecycle journey.
import type { Browser, Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { launch } from "../agentLaunchBoundary.ts";
import {
  dashboardCommand,
  developmentDashboard,
} from "../support/dashboardCommand.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "../support/fakeCursor.ts";
import { instruction, liveRunner } from "../support/cursorRunnerJourney.ts";
import { publishedMainFixture } from "../support/publishedMainFixture.ts";
import { publishedMainHosts } from "../support/publishedMainHosts.ts";
import { configureDevelopmentProjects } from "../support/projectConfiguration.ts";
import {
  productionActivation,
  startProductionWatcher,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";

const bannerPath = "dashboard/src/DashboardBanner.tsx";
type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;
export const sourceMarker = (page: Page) =>
  page.getByTestId("production-source");

export class ProductionWatcherMachine {
  private fixture: Fixture | undefined;
  private hosts: Awaited<ReturnType<typeof publishedMainHosts>> | undefined;
  private cursor: FakeCursor | undefined;
  private development: ReturnType<typeof dashboardCommand> | undefined;
  private productionPage: Page | undefined;
  private developmentPage: Page | undefined;
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

  boundary(url: string): DashboardServer {
    return {
      baseURL: url,
      origin: url,
      home: this.started().fixture.home,
    } as DashboardServer;
  }

  async launchCursor(url: string) {
    return launch(this.boundary(url), {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
  }

  async close() {
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
