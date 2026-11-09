// Published fault gates leave real npm/Vite build and serving intact. On one
// build chain, a failed build and a failed preview start keep or restore
// working production and the same commit is retried; an unavailable origin
// keeps production and checks resume; SIGHUP, a failed restoration and an
// unexpectedly ended preview each end the watcher with cleanup. Each test
// steps the shared watcher to its next state from the watcher's own output
// and asserts that delta, staging at most one deployment of its own; after a
// scenario ends the watcher, a restart at current main serves the next.
// Accepted cost: each test's one real staging, which a prepared or prebuilt
// deployment would bypass; only this chain proves that each failure keeps or
// restores working production, or ends the watcher with cleanup. Setup and
// waits around the stagings stay open to improvement.
import { expect, test } from "../support/pageTest.ts";
import { rename, rm, writeFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { publishedMainFixture } from "../support/publishedMainFixture.ts";
import type { PublishedMainFixture } from "../support/publishedMainFixture.ts";
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
  productionReplacement,
  shownActivation,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";

test.describe.configure({ mode: "serial" });

// What a failed setup may leave undefined is closed by afterAll regardless;
// every test reads the started ones through `started()`.
let fixture: PublishedMainFixture | undefined;
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

test.beforeAll(async ({ browser }) => {
  fixture = await publishedMainFixture(true);
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
  await writeFile(faultCause(fixture.home, "build"), "transient build cause");
  const b = await fixture.publish(
    fixture.markerChanges("WORKING B"),
    "Working B",
  );
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 0 })
    .toContain("TRANSIENT build FAILURE");
  expect(watcher.output()).toContain(`Production update failed for ${b}`);
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  await expectStillServing(served, page, "WORKING A");
  latestCommit = b;
});

// The watcher keeps retrying the failed commit; once its cause clears, a
// retry builds and replaces production.
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

// C carries a start cause of its own. The watcher prepares it once it has
// retired the checkout B replaced; C's staging and failed start are the next
// test's.
let cFault: string;
test("a candidate whose preview start will fail is prepared while the working commit serves", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture } = started();
  // The served commit's gate also reads HOME; make the start cause apply to
  // C only.
  cFault = faultCause(fixture.home, "preview", "c");
  await writeFile(cFault, "transient candidate start cause");
  latestCommit = await fixture.publish(
    {
      ...fixture.markerChanges("WORKING C"),
      "production-fault.mjs": ownCauseFault("c"),
    },
    "Working C",
  );
  await expect
    .poll(() => preparations(watcher, latestCommit), { timeout: 0 })
    .toBe(1);
});

test("a failed preview start restores the working commit", async () => {
  if (watcher === undefined) throw new Error("No watcher");
  const { page } = started();
  const c = latestCommit;
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

test("an unavailable origin keeps production and checks resume when it returns; SIGHUP ends the watcher without a failure", async ({
  request,
}) => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture, page } = started();
  await rename(fixture.origin, `${fixture.origin}.unavailable`);
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 0 })
    .toContain(`git ls-remote -- ${fixture.origin} refs/heads/main failed`);
  await expectStillServing(served, page, "WORKING C");
  expect(watcher.output()).toContain(
    `Keeping ${servedCommit} at ${served.url}`,
  );
  await rename(`${fixture.origin}.unavailable`, fixture.origin);
  const checks = watcher.checks();
  await expect.poll(() => watcher?.checks() ?? 0).toBeGreaterThan(checks);
  watcher.signal("SIGHUP");
  // The watcher stops without a failure. npm's own exit for a hung-up
  // group differs by npm version (the signal, or code 1), so it is not
  // what this checks.
  await watcher.exited;
  expect(watcher.output()).not.toContain("Production dashboard could not run");
  await watcher.stop();
  await expectProductionEnded(request, served, fixture.home);
  watcher = undefined;
});

test("a watcher started after a hang-up serves current main again", async () => {
  const { fixture, page } = started();
  watcher = startProductionWatcher(fixture.development, fixture.env);
  served = await shownActivation(watcher, latestCommit, page, "WORKING C");
});

test("a failed candidate whose restoration also fails reports both causes, exits and cleans up", async ({
  request,
}) => {
  if (watcher === undefined) throw new Error("No watcher");
  const { fixture } = started();
  // D's own preview gate and the served commit's (which reads its own
  // cause) both fail.
  await writeFile(faultCause(fixture.home, "preview"), "start cause");
  await writeFile(faultCause(fixture.home, "preview", "c"), "start cause");
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
  process.kill(-served.pid, "SIGKILL");
  expect((await watcher.exited).code).toBe(1);
  await watcher.stop();
  expect(watcher.output()).toContain(
    "Production dashboard could not run: Production dashboard exited unexpectedly (SIGKILL).",
  );
  await expectProductionEnded(request, served, fixture.home);
  watcher = undefined;
});
