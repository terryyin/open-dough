// Published fault gates leave real npm/Vite build and serving intact. On one
// build chain, a failed build and a failed preview start keep or restore
// working production and the same commit is retried; an unavailable origin
// keeps production and checks resume; SIGHUP, a failed restoration and an
// unexpectedly ended preview each end the watcher with cleanup. Each test
// steps the shared watcher to its next state from the watcher's own output
// and asserts that delta; a scenario that ends the watcher restarts it at
// current main for the next.
import { expect, test } from "./support/pageTest.ts";
import { readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { processRunning } from "./support/processGroup.ts";
import {
  faultGatedPackage,
  productionFault,
} from "./support/productionFault.ts";
import {
  outputCount,
  productionActivation,
  productionDeployments,
  productionReplacement,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";

test.describe.configure({ mode: "serial" });

type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;

// What a failed setup may leave undefined is closed by afterAll regardless;
// every test reads the started ones through `started()`.
let fixture: Fixture | undefined;
let watcher: ProductionWatcher | undefined;
let page: Page | undefined;
let deployments: string;
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
const preparing = (commit: string) =>
  outputCount(
    watcher,
    new RegExp(`Preparing production dashboard ${commit}\\.`, "g"),
  );

test.beforeAll(async ({ browser }) => {
  test.setTimeout(120_000);
  fixture = await publishedMainFixture(true);
  deployments = productionDeployments(fixture.home);
  page = await browser.newPage();
  // Every commit gates its own build and start on a machine-local transient
  // cause. Clearing it never changes source or commit and runs the real
  // scripts.
  servedCommit = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING A"),
      "package.json": await faultGatedPackage(fixture.development),
      "production-fault.mjs": productionFault,
    },
    "Working A",
  );
  latestCommit = servedCommit;
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await productionActivation(watcher, servedCommit);
  await page.goto(served.url);
  await expect(page).toHaveTitle("WORKING A");
});

test.afterAll(async () => {
  await page?.close();
  await watcher?.stop();
  await fixture?.cleanup();
});

test("a failed build keeps working production and the same commit is retried until it builds", async () => {
  test.setTimeout(90_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  const buildFault = path.join(fixture.home, "fault-build");
  await writeFile(buildFault, "transient build cause");
  const b = await fixture.publish(
    fixture.markerChanges("WORKING B"),
    "Working B",
  );
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 60_000 })
    .toContain("TRANSIENT build FAILURE");
  expect(watcher.output()).toContain(`Production update failed for ${b}`);
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  expect(processRunning(served.pid)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle("WORKING A");
  await rm(buildFault);
  served = await productionReplacement(watcher, served, b);
  expect(preparing(b)).toBeGreaterThanOrEqual(2);
  await page.reload();
  await expect(page).toHaveTitle("WORKING B");
  servedCommit = b;
  latestCommit = b;
});

test("a failed preview start restores the working commit and the same commit is retried until it serves", async () => {
  test.setTimeout(90_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  // The served commit's gate also reads HOME; make the start cause apply to
  // C only.
  const cFault = path.join(fixture.home, "fault-preview-c");
  await writeFile(cFault, "transient candidate start cause");
  const c = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING C"),
      "production-fault.mjs": productionFault.replace(
        'existsSync(path.join(homedir(), "fault-" + phase))',
        'existsSync(path.join(homedir(), "fault-" + phase + "-c"))',
      ),
    },
    "Working C",
  );
  served = await productionReplacement(watcher, served, servedCommit, true);
  await expect
    .poll(() => watcher?.output() ?? "")
    .toContain(`Production update failed for ${c}`);
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
  served = await productionReplacement(watcher, served, c);
  expect(preparing(c)).toBeGreaterThanOrEqual(2);
  await page.reload();
  await expect(page).toHaveTitle("WORKING C");
  servedCommit = c;
  latestCommit = c;
});

test("an unavailable origin keeps production and checks resume when it returns; SIGHUP ends the watcher without a failure", async ({
  request,
}) => {
  test.setTimeout(60_000);
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await rename(fixture.origin, `${fixture.origin}.unavailable`);
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 30_000 })
    .toContain(`git ls-remote -- ${fixture.origin} refs/heads/main failed`);
  expect(processRunning(served.pid)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle("WORKING C");
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  await rename(`${fixture.origin}.unavailable`, fixture.origin);
  const checks = watcher.checks();
  await expect.poll(() => watcher?.checks() ?? 0).toBeGreaterThan(checks);
  if (watcher.child.pid === undefined) throw new Error("Missing watcher PID");
  process.kill(-watcher.child.pid, "SIGHUP");
  // The watcher stops without a failure. npm's own exit for a hung-up
  // group differs by npm version (the signal, or code 1), so it is not
  // what this checks.
  await watcher.exited;
  expect(watcher.output()).not.toContain("Production dashboard could not run");
  await watcher.stop();
  expect(processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(deployments)).toEqual([]);
  watcher = undefined;
});

test("a failed candidate whose restoration also fails reports both causes, exits and cleans up", async ({
  request,
}) => {
  test.setTimeout(90_000);
  const { fixture } = started();
  // The next watcher serves current main. Then D's own preview gate and
  // the served commit's (which reads its own cause) both fail.
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await productionActivation(watcher, latestCommit);
  await writeFile(path.join(fixture.home, "fault-preview"), "start cause");
  await writeFile(path.join(fixture.home, "fault-preview-c"), "start cause");
  const d = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING D"),
      "production-fault.mjs": productionFault,
    },
    "Working D",
  );
  expect((await watcher.exited).code).toBe(1);
  await watcher.stop();
  expect(watcher.output()).toContain(
    `Production dashboard could not run: ${d} failed: `,
  );
  expect(watcher.output()).toContain(
    `; restoring ${servedCommit} also failed: `,
  );
  expect(watcher.output().match(/TRANSIENT preview FAILURE/g)).toHaveLength(2);
  expect(watcher.output()).not.toContain(`Production dashboard ${d} at`);
  expect(processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(deployments)).toEqual([]);
  watcher = undefined;
  latestCommit = d;
});

test("an unexpectedly ended preview ends the watcher with cleanup", async ({
  request,
}) => {
  test.setTimeout(90_000);
  const { fixture } = started();
  await rm(path.join(fixture.home, "fault-preview"));
  await rm(path.join(fixture.home, "fault-preview-c"));
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await productionActivation(watcher, latestCommit);
  process.kill(-served.pid, "SIGKILL");
  expect((await watcher.exited).code).toBe(1);
  await watcher.stop();
  expect(watcher.output()).toContain(
    "Production dashboard could not run: Production dashboard exited unexpectedly (SIGKILL).",
  );
  expect(processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(deployments)).toEqual([]);
  watcher = undefined;
});
