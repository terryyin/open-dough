// The public watcher's serial lifecycle; every test observes the next state.
// Accepted cost: the real npm install, Vite build and preview behind each
// activation, which a prepared or prebuilt deployment would bypass. Only
// this chain proves activation, serving beside development, the Cursor
// runner, replacement, stop and restart end to end. Setup and waits around
// the activations stay open to improvement.
import { expect, test } from "../support/pageTest.ts";
import { readdir } from "node:fs/promises";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { processGroup, runnersFor } from "../support/cursorRunnerJourney.ts";
import { dashboardCommand } from "../support/dashboardCommand.ts";
import { keptCursor } from "../support/keptCursorTurn.ts";
import { expectOwnOriginReadsOnly } from "../support/localOriginReads.ts";
import { processRunning } from "../support/processGroup.ts";
import {
  deploymentCheckout,
  expectProductionEnded,
  productionActivation,
  productionDeployments,
  productionReplacement,
  startProductionWatcher,
  type ProductionActivation,
} from "../support/productionWatcher.ts";
import {
  occupyProductionPort,
  sourceMarker,
  ProductionWatcherMachine,
} from "./productionWatcherMachine.ts";
test.describe.configure({ mode: "serial" });
const machine = new ProductionWatcherMachine();
const started = () => machine.started();
let env: NodeJS.ProcessEnv;
let developmentUrl: string;
let pinned: string;
let next: string;
let served: ProductionActivation;
let runner: { port: number; pid: number };
let cursorSessionId: string;
let cursorClientPid: number;
// Setup publishes pinned main and starts the watcher; the first test observes
// its activation and the next starts development, so the shared hook holds
// only the preparation.
test.beforeAll(async ({ browser }) => {
  ({ env, pinned } = await machine.start(browser));
});
test.afterAll(async () => {
  await machine.close();
});

test("npm watcher activates published main and starts the Cursor runner", async () => {
  const watcher = machine.running();
  ({ served, runner } = await machine.activated(pinned));
  expect(watcher.output()).toContain(
    `Preparing production dashboard ${pinned}.`,
  );
  expect(processRunning(served.pid)).toBe(true);
});

test("npm watcher serves published main beside hot-reloaded uncommitted development and enforces the local boundaries", async ({
  browser,
  request,
}) => {
  const watcher = machine.running();
  developmentUrl = await machine.developmentStarted(env);
  const { productionPage, developmentPage } = started();
  expect(served.url).not.toBe(developmentUrl);
  await productionPage.goto(served.url);
  await expect(productionPage).toHaveTitle("PINNED MAIN");
  await expect(sourceMarker(productionPage)).toHaveText("PINNED SOURCE");
  await developmentPage.goto(developmentUrl);
  await expect(developmentPage).toHaveTitle("DEVELOPMENT ONLY");
  await expect(sourceMarker(developmentPage)).toHaveText("DEVELOPMENT SOURCE");
  const productionNavigations = await machine.editDevelopmentSource();
  await expect(sourceMarker(developmentPage)).toHaveText(
    "EDITED DEVELOPMENT SOURCE",
  );
  await expect(sourceMarker(productionPage)).toHaveText("PINNED SOURCE");
  await expect(productionPage).toHaveTitle("PINNED MAIN");
  expect(productionNavigations()).toBe(0);
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
  await expect(sourceMarker(fresh)).toHaveText("PINNED SOURCE");
  await fresh.close();
  await expectOwnOriginReadsOnly(request, served.url);
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
  const { fixture, cursor } = started();
  expect(processGroup(runner.pid)).toBe(runner.pid);
  expect(processGroup(served.pid)).toBe(served.pid);
  expect(processGroup(runner.pid)).not.toBe(processGroup(served.pid));
  expect(runnersFor(fixture.home)).toBe(1);
  const launched = await machine.launchCursor(served.url);
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
  const watcher = machine.running();
  const { fixture, cursor, productionPage } = started();
  next = await fixture.publish(fixture.markerChanges("NEXT MAIN"), "Next main");
  const replaced = await productionReplacement(watcher, served, next);
  await productionPage.reload();
  await expect(productionPage).toHaveTitle("NEXT MAIN");
  expect(processRunning(cursorClientPid)).toBe(true);
  expect(processRunning(runner.pid)).toBe(true);
  expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
  expect(runnersFor(fixture.home)).toBe(1);
  await machine.followCursorSession(replaced.url, cursorSessionId);
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(cursorClientPid);
  served = replaced;
});
test("SIGHUP quietly ends production and its checkouts and leaves development, the runner and its client", async ({
  request,
}) => {
  const watcher = machine.running();
  const { fixture, developmentPage } = started();
  watcher.signal("SIGHUP");
  // npm's hang-up exit differs by version; the watcher must exit quietly and
  // finish cleanup before the command's group is retired.
  await watcher.exited;
  expect(watcher.output()).not.toContain("Production dashboard could not run");
  await watcher.stop();
  machine.watcher = undefined;
  await expect.poll(() => processRunning(served.pid)).toBe(false);
  await expectProductionEnded(request, served, fixture.home);
  await expect(sourceMarker(developmentPage)).toHaveText(
    "EDITED DEVELOPMENT SOURCE",
  );
  expect((await request.get(developmentUrl)).status()).toBe(200);
  expect(processRunning(runner.pid)).toBe(true);
  expect(processRunning(cursorClientPid)).toBe(true);
});

test("an occupied production port is refused rather than moved", async ({
  request,
}) => {
  const { fixture } = started();
  const deployments = productionDeployments(fixture.home);
  const occupied = await occupyProductionPort(served.url);
  const productionPort = occupied.port;
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
    await occupied.close();
  }
});

test("a restart serves current main as its baseline with the same runner, and SIGINT ends it", async ({
  request,
}) => {
  const { fixture, cursor, productionPage } = started();
  const deployments = productionDeployments(fixture.home);
  const current = await fixture.publish(
    { "docs/production-restart-note.md": "# Restart note\n" },
    "Document restart",
  );
  const watcher = startProductionWatcher(fixture.development, env);
  machine.watcher = watcher;
  const restarted = await productionActivation(watcher, current);
  expect(watcher.output()).toContain(
    `Preparing production dashboard ${current}.`,
  );
  expect(watcher.output()).not.toContain(pinned);
  expect(watcher.output()).not.toContain(next);
  expect(await readdir(deployments)).toEqual([deploymentCheckout(current)]);
  await productionPage.goto(restarted.url);
  await expect(productionPage).toHaveTitle("NEXT MAIN");
  await expect(sourceMarker(productionPage)).toHaveText("PINNED SOURCE");
  expect(runnersFor(fixture.home)).toBe(1);
  expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
  expect(processGroup(runner.pid)).toBe(runner.pid);
  expect(processGroup(runner.pid)).not.toBe(processGroup(restarted.pid));
  const follow = await machine.followCursorSession(
    restarted.url,
    cursorSessionId,
  );
  follow.send({ input: "after-restart" });
  await expect
    .poll(() => cursor.input(cursorClientPid))
    .toContain("after-restart");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(cursorClientPid);
  expect(cursor.calls()).toHaveLength(1);
  watcher.signal("SIGINT");
  await watcher.exited;
  await watcher.stop();
  expect(watcher.output()).not.toContain("could not run");
  await expectProductionEnded(request, restarted, fixture.home);
  machine.watcher = undefined;
});
