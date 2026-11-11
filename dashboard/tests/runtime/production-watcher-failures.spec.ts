// Advance a real watcher's recovery chain using one small published Vite page.
// Each fault gate leaves actual npm, build and preview commands in the path.
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
} from "../support/productionFault.ts";
import {
  expectProductionEnded,
  expectStillServing,
  preparations,
  productionDeployments,
  productionReplacement,
  shownActivation,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";

test.describe.configure({ mode: "serial" });

// What a failed setup may leave undefined is closed by afterAll regardless;
// every test reads the started ones through `started()`.
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

// The retry line ends the report. Its cause may span multiple output chunks.
function waitForRetry(watcher: ProductionWatcher, commit: string) {
  return waitForWatcherOutput(
    watcher,
    new RegExp(`Keeping ${commit} at \\S+; retrying on a later check\\.`),
  );
}

test.beforeAll(async ({ browser }) => {
  fixture = await productionFailureFixture();
  page = await browser.newPage();
  // Every commit gates its own build and start on a machine-local transient
  // cause. Clearing it never changes source or commit and runs the real
  // scripts.
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
  await writeFile(
    faultCause(fixture.home, "build", "b"),
    "transient build cause",
  );
  const b = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING B"),
      "production-fault.mjs": ownCauseFault("b"),
    },
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

// Both retries keep B selected while the transient cause changes.
let previewFault: string;
test("the same candidate retries its build, and a failed preview restores working production", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  previewFault = faultCause(fixture.home, "preview", "b");
  await writeFile(previewFault, "transient candidate start cause");
  await rm(faultCause(fixture.home, "build", "b"));

  const candidate = latestCommit;
  served = await productionReplacement(watcher, served, servedCommit, true);
  await waitForWatcherOutput(
    watcher,
    new RegExp(
      String.raw`TRANSIENT preview FAILURE[\s\S]+?Keeping ${servedCommit} at \S+; retrying on a later check\.`,
    ),
  );
  expect(watcher.output()).toContain(
    `Production update failed for ${candidate}`,
  );
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  expect(watcher.output()).not.toContain(
    `Production dashboard ${candidate} at ${served.url}`,
  );
  expect(preparations(watcher, candidate)).toBeGreaterThanOrEqual(2);
  await page.reload();
  await expect(page).toHaveTitle("WORKING A");
});

test("after a failed preview start the same commit is retried until it serves", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { page } = started();
  await rm(previewFault);
  served = await productionReplacement(watcher, served, latestCommit);
  expect(preparations(watcher, latestCommit)).toBeGreaterThanOrEqual(3);
  await page.reload();
  await expect(page).toHaveTitle("WORKING B");
  servedCommit = latestCommit;
});

test("an unavailable origin keeps production and checks resume when it returns; SIGHUP ends the watcher without a failure", async ({
  request,
}) => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await rename(fixture.origin, `${fixture.origin}.unavailable`);
  await waitForRetry(watcher, servedCommit);
  expect(watcher.output()).toContain(
    `git ls-remote -- ${fixture.origin} refs/heads/main failed`,
  );
  await expectStillServing(served, page, "WORKING B");
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  const checks = watcher.checks();
  await rename(`${fixture.origin}.unavailable`, fixture.origin);
  await watcher.waitForChecks(checks);
  const retired = waitForEmptyDirectory(
    watcher,
    productionDeployments(fixture.home),
  );
  watcher.signal("SIGHUP");
  // npm can finish before the watcher removes its checkout. Await retirement
  // before the harness ends any remaining members of npm's process group.
  await retired;
  await watcher.exited;
  expect(watcher.output()).not.toContain("Production dashboard could not run");
  await watcher.stop();
  await expectProductionEnded(request, served, fixture.home);
  watcher = undefined;
});

test("a watcher started after a hang-up serves current main again", async () => {
  const { fixture, page } = started();
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await shownActivation(watcher, latestCommit, page, "WORKING B");
});

test("an unexpectedly ended preview ends the watcher with cleanup", async ({
  request,
}) => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture } = started();
  const development = await developmentDashboard(
    fixture.development,
    fixture.env,
  );
  try {
    const { store, stored } = writeSharedLaunchRecord(fixture.home);
    const configuration = projectConfigurationFile(fixture.home, "production");
    const configured = await readFile(configuration, "utf8");
    expect((await request.get(development.url)).status()).toBe(200);

    process.kill(-served.pid, "SIGKILL");
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
