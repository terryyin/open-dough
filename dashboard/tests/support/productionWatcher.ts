// Observe the public production watcher through its own reported activations
// and its default machine-home deployment checkouts.
import { expect } from "@playwright/test";
import path from "node:path";
import { dashboardCommand } from "./dashboardCommand.ts";
import { processRunning } from "./processGroup.ts";
import { recordedBuilds } from "./productionBuildGate.ts";

export type ProductionWatcher = ReturnType<typeof dashboardCommand>;
// A preview the watcher reported serving: its URL and process.
export type ProductionActivation = { url: string; pid: number };

// The public watcher under test: an ephemeral port and a 500 ms check of
// published main, so journeys observe its next check promptly.
export function startProductionWatcher(
  development: string,
  env: NodeJS.ProcessEnv,
): ProductionWatcher {
  return dashboardCommand(development, env, "watch:dashboard", [
    "--port",
    "0",
    "--check-interval",
    "500",
  ]);
}

export function productionDeployments(home: string) {
  return path.join(home, ".open-dough/dashboard/deployments");
}

// The deployment checkout a commit is staged in: named by its commit prefix.
export function deploymentCheckout(commit: string) {
  return expect.stringMatching(new RegExp(`^${commit.slice(0, 12)}-`));
}

export function productionInspections(home: string) {
  return path.join(home, ".open-dough/dashboard/inspections");
}

export function activationPattern(commit: string, restored = false) {
  return new RegExp(
    `${restored ? "Restored production" : "Production"} dashboard ${commit} at (http://127\\.0\\.0\\.1:\\d+) \\(preview PID (\\d+)\\)`,
  );
}

// Waits for the watcher to report serving the commit; returns its URL and PID.
export async function productionActivation(
  watcher: ProductionWatcher | undefined,
  commit: string,
  restored = false,
): Promise<ProductionActivation> {
  const expression = activationPattern(commit, restored);
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
    .toMatch(expression);
  const match = expression.exec(watcher?.output() ?? "");
  if (!match?.[1] || !match[2]) throw new Error("Missing preview address/PID");
  return { url: match[1], pid: Number(match[2]) };
}

// Waits for the watcher to serve the commit in place of the running preview:
// the same URL, a new process, and the former preview ended.
export async function productionReplacement(
  watcher: ProductionWatcher | undefined,
  served: ProductionActivation,
  commit: string,
  restored = false,
): Promise<ProductionActivation> {
  const replacement = await productionActivation(watcher, commit, restored);
  expect(replacement.url).toBe(served.url);
  expect(replacement.pid).not.toBe(served.pid);
  await expect.poll(() => processRunning(served.pid)).toBe(false);
  expect(processRunning(replacement.pid)).toBe(true);
  return replacement;
}

// Waits for the watcher's first check of main after it reported serving the
// commit. The watcher retires superseded deployment checkouts before it
// checks main again, so by then they are gone, however long that took.
export async function checkedAfterActivation(
  watcher: ProductionWatcher | undefined,
  commit: string,
) {
  const activatedAt = watcher?.output().search(activationPattern(commit)) ?? -1;
  expect(activatedAt).toBeGreaterThanOrEqual(0);
  await expect
    .poll(() => watcher?.output().slice(activatedAt) ?? "", { timeout: 60_000 })
    .toContain(`Checked published main: ${commit}.`);
}

export function outputCount(
  watcher: ProductionWatcher | undefined,
  expression: RegExp,
) {
  return watcher?.output().match(expression)?.length ?? 0;
}

// Deployment work observed so far: install/build attempts the watcher began,
// real builds the published build gate recorded, and reported activations.
export async function deploymentWork(
  watcher: ProductionWatcher | undefined,
  home: string,
) {
  return {
    preparing: outputCount(watcher, /Preparing production dashboard /g),
    builds: (await recordedBuilds(home)).length,
    activations: outputCount(watcher, /dashboard \w+ at http:/g),
    previews: watcher?.output().match(/preview PID \d+/g) ?? [],
  };
}

// Waits for the watcher to skip a published commit, then for two further
// completed checks of it, so callers observe the skip as settled.
export async function settledSkip(
  watcher: ProductionWatcher | undefined,
  commit: string,
) {
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 60_000 })
    .toContain(`Skipping production update ${commit}: `);
  const checked = new RegExp(`Checked published main: ${commit}\\.`, "g");
  const checks = outputCount(watcher, checked);
  await expect
    .poll(() => outputCount(watcher, checked))
    .toBeGreaterThan(checks + 1);
}
