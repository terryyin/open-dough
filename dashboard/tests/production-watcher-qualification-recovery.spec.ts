// Policy errors and failed builds never move the real npm watcher's comparison
// baseline; only a successful activation does.
import { expect, test } from "@playwright/test";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { processRunning } from "./support/processGroup.ts";
import {
  buildGateChanges,
  builtCommitPrefixes,
} from "./support/productionBuildGate.ts";
import { ciWorkflowPath } from "../server/productionQualification.mjs";
import {
  faultGatedPackage,
  productionFault,
} from "./support/productionFault.ts";
import {
  deploymentWork,
  productionActivation,
  productionDeployments,
  productionInspections,
  settledSkip,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";

test("npm watcher keeps its baseline through an unsupported published policy and failed builds, then compares from the next successful activation", async ({
  browser,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const workflow = await readFile(
    path.join(fixture.development, ciWorkflowPath),
    "utf8",
  );
  const work = () => deploymentWork(watcher, fixture.home);
  let watcher: ProductionWatcher | undefined;
  const page = await browser.newPage();
  try {
    // A's build first passes its fault gate, then the counting build gate.
    await fixture.commit(
      {
        ...fixture.markerChanges("MAIN A"),
        ...(await buildGateChanges(fixture.development)),
      },
      "Main A",
    );
    const a = await fixture.publish(
      {
        "package.json": await faultGatedPackage(fixture.development),
        "production-fault.mjs": productionFault,
      },
      "Fault-gated A",
    );
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", "0", "--check-interval", "500"],
    );
    const running = await productionActivation(watcher, a);
    await page.goto(running.url);
    await expect(page).toHaveTitle("MAIN A");

    // An unsupported policy at P is reported on each check before any install.
    const startup = await work();
    const p = await fixture.publish(
      {
        [ciWorkflowPath]: workflow.replace("  push:\n", "  push:\n    # P\n"),
        ...fixture.markerChanges("MAIN P"),
      },
      "Unsupported policy P",
    );
    const policyError = `Production update failed for ${p}: ${ciWorkflowPath} at ${p} has an unsupported CI push path policy.\nKeeping ${a} at ${running.url}; retrying on a later check.`;
    await expect
      .poll(() => (watcher?.output() ?? "").split(policyError).length - 1, {
        timeout: 60_000,
      })
      .toBeGreaterThan(2);
    expect(await work()).toEqual(startup);
    expect(processRunning(running.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN A");

    // A valid Q appears: A-to-Q still holds P's application change.
    const q = await fixture.publish(
      { [ciWorkflowPath]: workflow, "docs/q.md": "# Q\n" },
      "Valid policy Q",
    );
    const atQ = await productionActivation(watcher, q);
    expect(atQ.url).toBe(running.url);
    await page.reload();
    await expect(page).toHaveTitle("MAIN P");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      [a, q].map((sha) => sha.slice(0, 12)),
    );

    // R fails its real build; documentation-only S is still compared with Q.
    const buildFault = path.join(fixture.home, "fault-build");
    await writeFile(buildFault, "transient build cause");
    const r = await fixture.publish(fixture.markerChanges("MAIN R"), "Main R");
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toContain(`Production update failed for ${r}: `);
    expect(watcher.output()).toContain("TRANSIENT build FAILURE");
    const s = await fixture.publish({ "docs/s.md": "# S\n" }, "Document S");
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toContain(`Production update failed for ${s}: `);
    expect(watcher.output()).toContain(`Keeping ${q} at ${running.url}`);
    expect(processRunning(atQ.pid)).toBe(true);
    await rm(buildFault);
    const atS = await productionActivation(watcher, s);
    expect(atS.url).toBe(running.url);
    expect(watcher.output()).not.toContain(`Skipping production update ${s}`);
    expect(watcher.output()).not.toMatch(
      new RegExp(`Production dashboard ${r} at`),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN R");
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      [a, q, s].map((sha) => sha.slice(0, 12)),
    );

    // The next comparison starts at S, so documentation-only T is skipped.
    const beforeT = await work();
    const t = await fixture.publish({ "docs/t.md": "# T\n" }, "Document T");
    await settledSkip(watcher, t);
    expect(watcher.output()).toContain(
      `Skipping production update ${t}: every change since ${s} is excluded by its CI push policy.`,
    );
    expect(await work()).toEqual(beforeT);
    expect(processRunning(atS.pid)).toBe(true);

    await watcher.stop();
    expect(watcher.output()).not.toContain("could not run");
    watcher = undefined;
    expect(processRunning(atS.pid)).toBe(false);
    expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
    expect(await readdir(productionInspections(fixture.home))).toEqual([]);
  } finally {
    await page.close();
    await watcher?.stop();
    fixture.cleanup();
  }
});
