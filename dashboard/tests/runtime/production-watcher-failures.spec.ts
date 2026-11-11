// One live A/B/C chain keeps its served C through origin recovery and fatal D.
// Each fault preserves actual npm/build/preview; SIGHUP belongs to restart.
import { expect, test } from "../support/pageTest.ts";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { developmentDashboard } from "../support/dashboardCommand.ts";
import { projectConfigurationFile } from "../support/projectConfiguration.ts";
import { productionFailureFixture } from "../support/productionWatcherFixture.ts";
import { writeSharedLaunchRecord } from "../support/sharedLaunchRecord.ts";
import {
  waitForEmptyDirectory,
  waitForWatcherOutput,
} from "../support/watcherEvents.ts";
import {
  faultCause,
  faultGateChanges,
  ownCauseFault,
  productionFault,
} from "../support/productionFault.ts";
import {
  expectProductionEnded,
  expectStillServing,
  preparations,
  productionActivation,
  productionDeployments,
  productionReplacement,
  shownActivation,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";

test.describe.configure({ mode: "serial" });

let fixture: Awaited<ReturnType<typeof productionFailureFixture>> | undefined;
let watcher: ProductionWatcher | undefined;
let page: Page | undefined;
let served: ProductionActivation;
// The commit production serves, and the latest commit published main names.
let servedCommit: string;
let latestCommit: string;

function started() {
  if (fixture === undefined || page === undefined) {
    throw new Error("The file's setup did not complete");
  }
  return { fixture, page };
}

function waitForRetry(watcher: ProductionWatcher, commit: string) {
  return waitForWatcherOutput(
    watcher,
    new RegExp(`Keeping ${commit} at \\S+; retrying on a later check\\.`),
  );
}

test.beforeAll(async ({ browser }) => {
  fixture = await productionFailureFixture();
  page = await browser.newPage();
  servedCommit = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING A"),
      ...(await faultGateChanges(fixture.development)),
    },
    "Working A",
  );
  latestCommit = servedCommit;
});

test.afterAll(async () => {
  await page?.close();
  await watcher?.stop();
  await fixture?.cleanup();
});

test("a watcher serves the working commit whose build and start are gated", async () => {
  const { fixture, page } = started();
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await shownActivation(watcher, servedCommit, page, "WORKING A");
});

test("a failed build keeps working production", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await writeFile(faultCause(fixture.home, "build"), "transient build cause");
  const b = await fixture.publish(
    fixture.markerChanges("WORKING B"),
    "Working B",
  );
  await waitForRetry(watcher, servedCommit);
  expect(watcher.output()).toContain("TRANSIENT build FAILURE");
  expect(watcher.output()).toContain(`Production update failed for ${b}`);
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  await expectStillServing(served, page, "WORKING A");
  latestCommit = b;
});

test("after a failed build the same commit is retried until it builds", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await rm(faultCause(fixture.home, "build"));
  served = await productionReplacement(watcher, served, latestCommit);
  expect(preparations(watcher, latestCommit)).toBeGreaterThanOrEqual(2);
  await page.reload();
  await expect(page).toHaveTitle("WORKING B");
  servedCommit = latestCommit;
});

let cFault: string;
test("a candidate whose preview start will fail is prepared while the working commit serves", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture } = started();
  cFault = faultCause(fixture.home, "preview", "c");
  await writeFile(cFault, "transient candidate start cause");
  latestCommit = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING C"),
      "production-fault.mjs": ownCauseFault("c"),
    },
    "Working C",
  );
  await waitForWatcherOutput(
    watcher,
    new RegExp(`Preparing production dashboard ${latestCommit}\\.`),
  );
  expect(preparations(watcher, latestCommit)).toBe(1);
});

test("a failed preview start restores the working commit", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { page } = started();
  const c = latestCommit;
  served = await productionReplacement(watcher, served, servedCommit, true);
  await waitForRetry(watcher, servedCommit);
  expect(watcher.output()).toContain("TRANSIENT preview FAILURE");
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  expect(watcher.output()).not.toContain(
    `Production dashboard ${c} at ${served.url}`,
  );
  await page.reload();
  await expect(page).toHaveTitle("WORKING B");
  await rm(cFault);
});

test("after a failed preview start the same commit is retried until it serves", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { page } = started();
  served = await productionReplacement(watcher, served, latestCommit);
  expect(preparations(watcher, latestCommit)).toBeGreaterThanOrEqual(2);
  await page.reload();
  await expect(page).toHaveTitle("WORKING C");
  servedCommit = latestCommit;
});

test("an unavailable origin keeps production and checks resume when it returns", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await rename(fixture.origin, `${fixture.origin}.unavailable`);
  await waitForRetry(watcher, servedCommit);
  expect(watcher.output()).toContain(
    `git ls-remote -- ${fixture.origin} refs/heads/main failed`,
  );
  await expectStillServing(served, page, "WORKING C");
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  await rename(`${fixture.origin}.unavailable`, fixture.origin);
  const checks = watcher.checks();
  await watcher.waitForChecks(checks);
  await expectStillServing(served, page, "WORKING C");
});

test("a failed candidate whose restoration also fails reports both causes, exits and cleans up", async ({
  request,
}) => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture } = started();
  const beforeUpdate = watcher.output().length;
  const retired = waitForEmptyDirectory(
    watcher,
    productionDeployments(fixture.home),
  );
  await writeFile(faultCause(fixture.home, "preview"), "start cause");
  await writeFile(faultCause(fixture.home, "preview", "c"), "start cause");
  const d = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING D"),
      "production-fault.mjs": productionFault,
    },
    "Working D",
  );
  await retired;
  expect((await watcher.exited).code).toBe(1);
  await watcher.stop();
  const failure = watcher.output().slice(beforeUpdate);
  expect(failure).toContain(
    `Production dashboard could not run: ${d} failed: `,
  );
  expect(failure).toContain(`; restoring ${servedCommit} also failed: `);
  expect(failure.match(/TRANSIENT preview FAILURE/g)).toHaveLength(2);
  expect(failure).not.toContain(`Production dashboard ${d} at`);
  await expectProductionEnded(request, served, fixture.home);
  watcher = undefined;
  latestCommit = d;
});

test("an unexpectedly ended preview ends the watcher with cleanup", async ({
  request,
}) => {
  const { fixture } = started();
  await rm(faultCause(fixture.home, "preview"));
  await rm(faultCause(fixture.home, "preview", "c"));
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await productionActivation(watcher, latestCommit);
  const development = await developmentDashboard(
    fixture.development,
    fixture.env,
  );
  try {
    const { store, stored } = writeSharedLaunchRecord(fixture.home);
    const configuration = projectConfigurationFile(fixture.home, "production");
    const configured = await readFile(configuration, "utf8");
    expect((await request.get(development.url)).status()).toBe(200);
    const retired = waitForEmptyDirectory(
      watcher,
      productionDeployments(fixture.home),
    );
    process.kill(-served.pid, "SIGKILL");
    await retired;
    expect((await watcher.exited).code).toBe(1);
    await watcher.stop();
    expect(watcher.output()).toContain(
      "Production dashboard could not run: Production dashboard exited unexpectedly (SIGKILL).",
    );
    await expectProductionEnded(request, served, fixture.home);
    watcher = undefined;
    expect((await request.get(development.url)).status()).toBe(200);
    expect(await readFile(store, "utf8")).toBe(stored);
    expect(await readFile(configuration, "utf8")).toBe(configured);
  } finally {
    await development.command.stop();
  }
});
