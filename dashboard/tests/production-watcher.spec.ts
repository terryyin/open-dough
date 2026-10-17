// The public npm watcher's lifecycle on one machine, one build chain: it
// serves published main beside hot-reloaded uncommitted development, enforces
// the local boundaries, starts one Cursor runner outside the preview's process
// group, replaces the preview at the same URL, owns shutdown, refuses an
// occupied port and restarts at current main; the runner and its cursor-agent
// client outlive replacement, stop and restart. Each test steps the shared
// watcher to its next state from the watcher's own output and asserts that
// delta; the fixture supplies no served pages or watcher outcomes.
import { expect, test } from "./support/pageTest.ts";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import type { Page } from "@playwright/test";
import { launch } from "./agentLaunchBoundary.ts";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { openCursorTerminal } from "./support/cursorTerminal.ts";
import {
  instruction,
  liveRunner,
  processGroup,
  runnersFor,
} from "./support/cursorRunnerJourney.ts";
import {
  dashboardCommand,
  developmentDashboard,
} from "./support/dashboardCommand.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import { keptCursor } from "./support/keptCursorTurn.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { publishedMainHosts } from "./support/publishedMainHosts.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { processRunning } from "./support/processGroup.ts";
import {
  deploymentCheckout,
  productionActivation,
  productionDeployments,
  productionReplacement,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";

test.describe.configure({ mode: "serial" });

type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;

const bannerPath = "dashboard/src/DashboardBanner.tsx";

// What a failed setup may leave undefined is closed by afterAll regardless;
// every test reads the started ones through `started()`.
let fixture: Fixture | undefined;
let hosts: Awaited<ReturnType<typeof publishedMainHosts>> | undefined;
let cursor: FakeCursor | undefined;
let env: NodeJS.ProcessEnv;
let development: ReturnType<typeof dashboardCommand> | undefined;
let developmentUrl: string;
let watcher: ProductionWatcher | undefined;
let productionPage: Page | undefined;
let developmentPage: Page | undefined;
let pinned: string;
let next: string;
let served: ProductionActivation;
let runner: { port: number; pid: number };
let cursorSessionId: string;
let cursorClientPid: number;
const sockets: { close(): void }[] = [];

function started() {
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

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000);
  cursor = installFakeCursor({ working: true });
  fixture = await publishedMainFixture(true);
  hosts = await publishedMainHosts(fixture);
  env = {
    ...hosts.env,
    ...cursor.env,
    PATH: [cursor.binDir, hosts.env["PATH"] ?? ""].join(path.delimiter),
  };
  // Marker changes in real application source become main's built JS and
  // development HMR.
  const banner = path.join(fixture.development, bannerPath);
  const pinnedBanner = (await readFile(banner, "utf8")).replace(
    "<SessionsButton />",
    '<p data-testid="production-source">PINNED SOURCE</p><SessionsButton />',
  );
  pinned = await fixture.publish(
    { ...fixture.markerChanges("PINNED MAIN"), [bannerPath]: pinnedBanner },
    "Pinned main",
  );
  // Development differs only through uncommitted local edits.
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
  watcher = startProductionWatcher(fixture.development, env);
  served = await productionActivation(watcher, pinned);
  // The runner found now is the production command's own; the development
  // server started next finds and shares it.
  runner = await liveRunner(fixture.home);
  const started = await developmentDashboard(fixture.development, env);
  development = started.command;
  developmentUrl = started.url;
  productionPage = await browser.newPage();
  developmentPage = await browser.newPage();
});

test.afterAll(async () => {
  for (const socket of sockets) socket.close();
  await productionPage?.close();
  await developmentPage?.close();
  await watcher?.stop();
  await development?.stop();
  cursor?.cleanup();
  await fixture?.cleanup();
  await hosts?.close();
});

test("npm watcher serves published main beside hot-reloaded uncommitted development and enforces the local boundaries", async ({
  browser,
  request,
}) => {
  test.setTimeout(60_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, productionPage, developmentPage } = started();
  const banner = path.join(fixture.development, bannerPath);
  expect(watcher.output()).toContain(
    `Preparing production dashboard ${pinned}.`,
  );
  expect(processRunning(served.pid)).toBe(true);
  expect(served.url).not.toBe(developmentUrl);
  await productionPage.goto(served.url);
  await expect(productionPage).toHaveTitle("PINNED MAIN");
  await expect(productionPage.getByTestId("production-source")).toHaveText(
    "PINNED SOURCE",
  );
  await developmentPage.goto(developmentUrl);
  await expect(developmentPage).toHaveTitle("DEVELOPMENT ONLY");
  await expect(developmentPage.getByTestId("production-source")).toHaveText(
    "DEVELOPMENT SOURCE",
  );
  let productionNavigations = 0;
  productionPage.on("framenavigated", (frame) => {
    if (frame === productionPage.mainFrame()) productionNavigations++;
  });
  await productionPage.evaluate(() => {
    document.documentElement.dataset["openWatcherPage"] = "retained";
  });
  await writeFile(
    banner,
    (await readFile(banner, "utf8")).replace(
      "DEVELOPMENT SOURCE",
      "EDITED DEVELOPMENT SOURCE",
    ),
  );
  await expect(developmentPage.getByTestId("production-source")).toHaveText(
    "EDITED DEVELOPMENT SOURCE",
  );
  await expect(productionPage.getByTestId("production-source")).toHaveText(
    "PINNED SOURCE",
  );
  await expect(productionPage).toHaveTitle("PINNED MAIN");
  expect(productionNavigations).toBe(0);
  expect(
    await productionPage.evaluate(
      () => document.documentElement.dataset["openWatcherPage"],
    ),
  ).toBe("retained");
  expect(processRunning(served.pid)).toBe(true);
  expect(watcher.output().match(/preview PID \d+/g)).toEqual([
    `preview PID ${served.pid}`,
  ]);
  const fresh = await browser.newPage();
  await fresh.goto(served.url);
  await expect(fresh).toHaveTitle("PINNED MAIN");
  await expect(fresh.getByTestId("production-source")).toHaveText(
    "PINNED SOURCE",
  );
  await fresh.close();
  const readUrl = `${served.url}/__authenticated-read?source=unknown`;
  expect((await request.get(readUrl)).status()).toBe(403);
  expect(
    (
      await request.get(readUrl, {
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
  ).toBe(403);
  const sameOrigin = await request.get(readUrl, {
    headers: { Origin: served.url },
  });
  expect(sameOrigin.status()).toBe(404);
  expect(await sameOrigin.text()).toContain("Unknown catalog source");
  expect(
    (
      await request.post(`${served.url}/__agent-launch/accept`, {
        data: {},
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
  ).toBe(403);
});

test("the production command starts one Cursor runner outside the preview's process group, which a launched Cursor session uses", async () => {
  test.setTimeout(60_000);
  const { fixture, cursor } = started();
  expect(processGroup(runner.pid)).toBe(runner.pid);
  expect(processGroup(served.pid)).toBe(served.pid);
  expect(processGroup(runner.pid)).not.toBe(processGroup(served.pid));
  expect(runnersFor(fixture.home)).toBe(1);
  const launched = await launch(boundary(served.url, fixture.home), {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  const answer = JSON.parse(launched.body) as { kind?: string };
  if (launched.status !== 200 || answer.kind !== "launched") {
    throw new Error(`Expected a launched session, got ${launched.body}`);
  }
  cursorSessionId = keptCursor(fixture.home).session.sessionId;
  expect(cursor.attaches()).toHaveLength(1);
  cursorClientPid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(cursorClientPid)).toBe(true);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
});

test("the next published main replaces production at the same URL and leaves the runner and its client in place", async () => {
  test.setTimeout(90_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, cursor, productionPage } = started();
  next = await fixture.publish(fixture.markerChanges("NEXT MAIN"), "Next main");
  const replaced = await productionReplacement(watcher, served, next);
  await productionPage.reload();
  await expect(productionPage).toHaveTitle("NEXT MAIN");
  expect(processRunning(cursorClientPid)).toBe(true);
  expect(processRunning(runner.pid)).toBe(true);
  expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
  expect(runnersFor(fixture.home)).toBe(1);
  const terminal = await openCursorTerminal(
    boundary(replaced.url, fixture.home),
    cursorSessionId,
  );
  sockets.push(terminal.socket);
  await expect.poll(() => terminal.output()).toContain("ctrl+c to stop");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(cursorClientPid);
  served = replaced;
});

test("stopping the watcher ends production and its checkouts and leaves development, the runner and its client", async ({
  request,
}) => {
  test.setTimeout(60_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, developmentPage } = started();
  const deployments = productionDeployments(fixture.home);
  await watcher.stop();
  watcher = undefined;
  await expect.poll(() => processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(deployments)).toEqual([]);
  // SIGTERM (stop) ends production; independently launched development
  // stays usable, and the detached runner and its client stay up.
  await expect(developmentPage.getByTestId("production-source")).toHaveText(
    "EDITED DEVELOPMENT SOURCE",
  );
  expect((await request.get(developmentUrl)).status()).toBe(200);
  expect(processRunning(runner.pid)).toBe(true);
  expect(processRunning(cursorClientPid)).toBe(true);
});

test("an occupied production port is refused rather than moved", async ({
  request,
}) => {
  test.setTimeout(60_000);
  const { fixture } = started();
  const deployments = productionDeployments(fixture.home);
  // An occupied intended production URL must fail, never move to another port.
  const occupied = createServer((req, res) => {
    req.resume();
    res.end("UNOWNED LISTENER");
  });
  const productionPort = new URL(served.url).port;
  await new Promise<void>((resolve) =>
    occupied.listen(Number(productionPort), "127.0.0.1", resolve),
  );
  try {
    const refused = dashboardCommand(
      fixture.development,
      env,
      "watch:dashboard",
      ["--port", productionPort],
    );
    expect((await refused.exited).code).toBe(1);
    expect(refused.output()).toContain(
      `Port ${productionPort} is already in use`,
    );
    expect(refused.output()).not.toMatch(/Production dashboard \w+ at http:/);
    expect(await (await request.get(served.url)).text()).toBe(
      "UNOWNED LISTENER",
    );
    expect(await readdir(deployments)).toEqual([]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      occupied.close((error) => {
        if (error) reject(error);
        else resolve();
      }),
    );
  }
});

test("a restart serves current main as its baseline with the same runner, and SIGINT ends it", async ({
  request,
}) => {
  test.setTimeout(90_000);
  const { fixture, cursor, productionPage } = started();
  const deployments = productionDeployments(fixture.home);
  // Current main is the new baseline even when its latest commit edits only
  // documentation.
  const current = await fixture.publish(
    { "docs/production-restart-note.md": "# Restart note\n" },
    "Document restart",
  );
  watcher = startProductionWatcher(fixture.development, env);
  const restarted = await productionActivation(watcher, current);
  expect(watcher.output()).toContain(
    `Preparing production dashboard ${current}.`,
  );
  expect(watcher.output()).not.toContain(pinned);
  expect(watcher.output()).not.toContain(next);
  expect(await readdir(deployments)).toEqual([deploymentCheckout(current)]);
  await productionPage.goto(restarted.url);
  await expect(productionPage).toHaveTitle("NEXT MAIN");
  await expect(productionPage.getByTestId("production-source")).toHaveText(
    "PINNED SOURCE",
  );
  expect(runnersFor(fixture.home)).toBe(1);
  expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
  expect(processGroup(runner.pid)).toBe(runner.pid);
  expect(processGroup(runner.pid)).not.toBe(processGroup(restarted.pid));
  const follow = await openCursorTerminal(
    boundary(restarted.url, fixture.home),
    cursorSessionId,
  );
  sockets.push(follow.socket);
  await expect.poll(() => follow.output()).toContain("ctrl+c to stop");
  follow.send({ input: "after-restart" });
  await expect
    .poll(() => cursor.input(cursorClientPid))
    .toContain("after-restart");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(cursorClientPid);
  expect(cursor.calls()).toHaveLength(1);

  if (watcher.child.pid === undefined) throw new Error("Missing watcher PID");
  process.kill(-watcher.child.pid, "SIGINT");
  await watcher.exited;
  await watcher.stop();
  expect(watcher.output()).not.toContain("could not run");
  expect(processRunning(restarted.pid)).toBe(false);
  await expect(
    request.get(restarted.url, { timeout: 2_000 }),
  ).rejects.toThrow();
  expect(await readdir(deployments)).toEqual([]);
  watcher = undefined;
});

function boundary(url: string, home: string): DashboardServer {
  return { baseURL: url, origin: url, home } as DashboardServer;
}
