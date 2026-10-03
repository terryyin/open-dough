// The real npm watcher qualifies published main against the last served commit
// with the selected commit's own CI push exclusions.
import { expect, test } from "@playwright/test";
import { readFile, readdir, writeFile } from "node:fs/promises";
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
  deploymentWork,
  productionActivation,
  productionDeployments,
  productionInspections,
  settledSkip,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";

const pushExclusions =
  '    paths-ignore:\n      - ".planning/**"\n      - "docs/**"\n';

test("npm watcher skips excluded-only main ranges, builds accumulated and mixed ranges once at the latest commit, and follows the published CI policy over a different local workflow", async ({
  browser,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const workflow = await readFile(
    path.join(fixture.development, ciWorkflowPath),
    "utf8",
  );
  expect(workflow).toContain(`  push:\n${pushExclusions}`);
  const work = () => deploymentWork(watcher, fixture.home);
  let watcher: ProductionWatcher | undefined;
  const page = await browser.newPage();
  try {
    const a = await fixture.publish(
      {
        ...fixture.markerChanges("MAIN A"),
        ...(await buildGateChanges(fixture.development)),
      },
      "Main A",
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

    // Excluded-only B: completed checks keep A without install, build or restart.
    const startup = await work();
    const b = await fixture.publish(
      { "docs/b.md": "# B\n", ".planning/b.md": "# B\n" },
      "Document B",
    );
    await settledSkip(watcher, b);
    expect(watcher.output()).toContain(
      `Skipping production update ${b}: every change since ${a} is excluded by its CI push policy.`,
    );
    expect(await work()).toEqual(startup);
    expect(startup.previews).toEqual([`preview PID ${running.pid}`]);
    expect(processRunning(running.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN A");

    // An application commit (with documentation) then a documentation-only
    // commit reach main together: A-to-C qualifies and builds C once.
    const application = await fixture.commit(
      { ...fixture.markerChanges("MAIN C"), "docs/c.md": "# C\n" },
      "Application C",
    );
    const c = await fixture.commit({ "docs/c-notes.md": "# C\n" }, "Notes C");
    await fixture.push();
    const replaced = await productionActivation(watcher, c);
    expect(replaced.url).toBe(running.url);
    await expect.poll(() => processRunning(running.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("MAIN C");
    expect(watcher.output()).not.toContain(application);
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      [a, c].map((sha) => sha.slice(0, 12)),
    );
    expect((await work()).preparing).toBe(2);

    // E changes the published push exclusions within a mixed update.
    const policy = workflow.replace(
      pushExclusions,
      '    paths-ignore:\n      - ".planning/**"\n      - "extra/**"\n',
    );
    const e = await fixture.publish(
      {
        [ciWorkflowPath]: policy,
        "docs/policy.md": "# Policy\n",
        ...fixture.markerChanges("MAIN E"),
      },
      "Policy E",
    );
    const policyActivation = await productionActivation(watcher, e);
    await page.reload();
    await expect(page).toHaveTitle("MAIN E");
    // The development checkout keeps a different, uncommitted workflow.
    await writeFile(path.join(fixture.development, ciWorkflowPath), workflow);

    const beforeF = await work();
    const f = await fixture.publish({ "extra/f.md": "# F\n" }, "Extra F");
    await settledSkip(watcher, f);
    expect(watcher.output()).toContain(
      `every change since ${e} is excluded by its CI push policy.`,
    );
    expect(await work()).toEqual(beforeF);
    expect(processRunning(policyActivation.pid)).toBe(true);

    // E's published policy no longer excludes docs/, so G qualifies.
    const g = await fixture.publish({ "docs/g.md": "# G\n" }, "Document G");
    const latest = await productionActivation(watcher, g);
    expect(latest.url).toBe(running.url);
    expect(watcher.output()).not.toContain(`Skipping production update ${g}`);
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      [a, c, e, g].map((sha) => sha.slice(0, 12)),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN E");

    await watcher.stop();
    expect(watcher.output()).not.toContain("could not run");
    watcher = undefined;
    expect(processRunning(latest.pid)).toBe(false);
    expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
    expect(await readdir(productionInspections(fixture.home))).toEqual([]);
  } finally {
    await page.close();
    await watcher?.stop();
    fixture.cleanup();
  }
});
