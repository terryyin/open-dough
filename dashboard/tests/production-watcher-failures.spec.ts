// Published fault gates leave real npm/Vite build and serving intact.
import { expect, test } from "@playwright/test";
import { readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { processRunning } from "./support/processGroup.ts";
import {
  faultGatedPackage,
  productionFault,
} from "./support/productionFault.ts";
import {
  outputCount,
  productionActivation as activation,
  productionDeployments,
  type ProductionWatcher as Watcher,
} from "./support/productionWatcher.ts";

test("failed builds and real preview activation keep or restore working production, retry the same commit, survive origin failure and stop checks", async ({
  browser,
  request,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const deployments = productionDeployments(fixture.home);
  let watcher: Watcher | undefined;
  const page = await browser.newPage();
  try {
    const aSha = await fixture.publish(
      fixture.markerChanges("WORKING A"),
      "Working A",
    );
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", "0", "--check-interval", "500"],
    );
    const a = await activation(watcher, aSha);
    await page.goto(a.url);
    await expect(page).toHaveTitle("WORKING A");

    // The commit gates its own build/start on a machine-local transient cause.
    // Clearing it never changes source or commit and runs the real scripts.
    const buildFault = path.join(fixture.home, "fault-build");
    await writeFile(buildFault, "transient build cause");
    const bSha = await fixture.publish(
      {
        ...fixture.markerChanges("WORKING B"),
        "package.json": await faultGatedPackage(fixture.development),
        "production-fault.mjs": productionFault,
      },
      "Working B",
    );
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toContain("TRANSIENT build FAILURE");
    expect(watcher.output()).toContain(`Production update failed for ${bSha}`);
    expect(watcher.output()).toContain(`Keeping ${aSha} at ${a.url}`);
    expect(processRunning(a.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("WORKING A");
    await rm(buildFault);
    const b = await activation(watcher, bSha);
    expect(b.url).toBe(a.url);
    expect(
      outputCount(
        watcher,
        new RegExp(`Preparing production dashboard ${bSha}\\.`, "g"),
      ),
    ).toBeGreaterThanOrEqual(2);
    await expect.poll(() => processRunning(a.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("WORKING B");

    const startFault = path.join(fixture.home, "fault-preview");
    // B's gate also reads HOME; make the start cause apply to C only.
    const cFault = `${startFault}-c`;
    await writeFile(cFault, "transient candidate start cause");
    const cSha = await fixture.publish(
      {
        ...fixture.markerChanges("WORKING C"),
        "production-fault.mjs": productionFault.replace(
          'existsSync(path.join(homedir(), "fault-" + phase))',
          'existsSync(path.join(homedir(), "fault-" + phase + "-c"))',
        ),
      },
      "Working C",
    );
    const restored = await activation(watcher, bSha, true);
    expect(restored.url).toBe(a.url);
    expect(restored.pid).not.toBe(b.pid);
    await expect.poll(() => processRunning(b.pid)).toBe(false);
    expect(processRunning(restored.pid)).toBe(true);
    await expect
      .poll(() => watcher?.output() ?? "")
      .toContain(`Production update failed for ${cSha}`);
    expect(watcher.output()).toContain("TRANSIENT preview FAILURE");
    expect(watcher.output()).toContain(`Keeping ${bSha} at ${a.url}`);
    expect(watcher.output()).not.toContain(
      `Production dashboard ${cSha} at ${a.url}`,
    );
    await page.reload();
    await expect(page).toHaveTitle("WORKING B");
    await rm(cFault);
    const c = await activation(watcher, cSha);
    expect(c.url).toBe(a.url);
    expect(
      outputCount(
        watcher,
        new RegExp(`Preparing production dashboard ${cSha}\\.`, "g"),
      ),
    ).toBeGreaterThanOrEqual(2);
    await expect.poll(() => processRunning(restored.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("WORKING C");

    await rename(fixture.origin, `${fixture.origin}.unavailable`);
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 60_000 })
      .toContain(`git ls-remote -- ${fixture.origin} refs/heads/main failed`);
    expect(processRunning(c.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("WORKING C");
    expect(watcher.output()).toContain(`Keeping ${cSha} at ${a.url}`);
    await rename(`${fixture.origin}.unavailable`, fixture.origin);
    const checked = new RegExp(`Checked published main: ${cSha}\\.`, "g");
    const checks = outputCount(watcher, checked);
    await expect
      .poll(() => outputCount(watcher, checked))
      .toBeGreaterThan(checks);
    if (watcher.child.pid === undefined) throw new Error("Missing watcher PID");
    process.kill(-watcher.child.pid, "SIGHUP");
    // The watcher stops without a failure. npm's own exit for a hung-up
    // group differs by npm version (the signal, or code 1), so it is not
    // what this checks.
    await watcher.exited;
    expect(watcher.output()).not.toContain(
      "Production dashboard could not run",
    );
    await watcher.stop();
    const endedOutput = watcher.output();
    await new Promise((resolve) => setTimeout(resolve, 1_100));
    expect(watcher.output()).toBe(endedOutput);
    expect(processRunning(c.pid)).toBe(false);
    await expect(request.get(a.url, { timeout: 2_000 })).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);
    watcher = undefined;
  } finally {
    await page.close();
    await watcher?.stop();
    fixture.cleanup();
  }
});

test("failed restoration reports both causes, exits and cleans up; an unexpectedly ended preview ends the watcher with cleanup", async ({
  request,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const deployments = productionDeployments(fixture.home);
  let watcher: Watcher | undefined;
  try {
    // A publishes the preview gate itself, so restoring A can fail too.
    const aSha = await fixture.publish(
      {
        ...fixture.markerChanges("WORKING A"),
        "package.json": await faultGatedPackage(fixture.development),
        "production-fault.mjs": productionFault,
      },
      "Working A",
    );
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", "0", "--check-interval", "500"],
    );
    const a = await activation(watcher, aSha);
    await writeFile(path.join(fixture.home, "fault-preview"), "start cause");
    const bSha = await fixture.publish(
      fixture.markerChanges("WORKING B"),
      "Working B",
    );
    expect((await watcher.exited).code).toBe(1);
    await watcher.stop();
    expect(watcher.output()).toContain(
      `Production dashboard could not run: ${bSha} failed: `,
    );
    expect(watcher.output()).toContain(`; restoring ${aSha} also failed: `);
    expect(watcher.output().match(/TRANSIENT preview FAILURE/g)).toHaveLength(
      2,
    );
    expect(watcher.output()).not.toContain(`Production dashboard ${bSha} at`);
    expect(processRunning(a.pid)).toBe(false);
    await expect(request.get(a.url, { timeout: 2_000 })).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);

    // The next watcher serves current main; its preview then ends unexpectedly.
    await rm(path.join(fixture.home, "fault-preview"));
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", "0", "--check-interval", "500"],
    );
    const b = await activation(watcher, bSha);
    process.kill(-b.pid, "SIGKILL");
    expect((await watcher.exited).code).toBe(1);
    await watcher.stop();
    expect(watcher.output()).toContain(
      "Production dashboard could not run: Production dashboard exited unexpectedly (SIGKILL).",
    );
    expect(processRunning(b.pid)).toBe(false);
    await expect(request.get(b.url, { timeout: 2_000 })).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);
    watcher = undefined;
  } finally {
    await watcher?.stop();
    fixture.cleanup();
  }
});
