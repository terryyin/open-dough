// Observe the public production watcher through its own reported activations
// and its default machine-home deployment checkouts, and address the
// production it serves.
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./dashboardCommand.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { processRunning } from "./processGroup.ts";
import { recordedBuilds } from "./productionBuildGate.ts";

export type ProductionWatcher = ReturnType<typeof startProductionWatcher>;
// A preview the watcher reported serving: its URL and process.
export type ProductionActivation = { url: string; pid: number };

// The public watcher under test: an ephemeral port and a 500 ms check of
// published main, so journeys observe its next check promptly.
export function startProductionWatcher(
  development: string,
  env: NodeJS.ProcessEnv,
) {
  // Git's existing trace observes real successful reads without requiring the
  // public watcher to print routine polling messages. The fixture removes the
  // trace directory beside its development checkout on cleanup.
  const trace = path.join(
    mkdtempSync(path.join(path.dirname(development), "watcher-git-")),
    "events.jsonl",
  );
  writeFileSync(trace, "");
  const command = dashboardCommand(
    development,
    { ...env, GIT_TRACE2_EVENT: trace },
    "watch:dashboard",
    ["--port", "0", "--check-interval", "500"],
  );
  return {
    ...command,
    checks() {
      const reads = new Set<string>();
      let completed = 0;
      // Only complete lines are parsed; Git may currently be appending one.
      for (const line of readFileSync(trace, "utf8").split("\n").slice(0, -1)) {
        const event = JSON.parse(line) as {
          event: string;
          sid: string;
          name?: string;
          code?: number;
        };
        if (event.event === "cmd_name" && event.name === "ls-remote")
          reads.add(event.sid);
        if (event.event === "exit" && event.code === 0 && reads.has(event.sid))
          completed += 1;
      }
      return completed;
    },
    // Sends a terminal's signal to the watcher's whole npm group.
    signal(name: NodeJS.Signals) {
      if (command.child.pid === undefined)
        throw new Error("Missing watcher PID");
      process.kill(-command.child.pid, name);
    },
  };
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

// The served production as the shared boundary helpers address a dashboard:
// its own URL as base and origin, and the machine HOME it shares.
export function productionBoundary(url: string, home: string) {
  return { baseURL: url, origin: url, home } as DashboardServer;
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
    .poll(() => watcher?.output() ?? "", { timeout: 0 })
    .toMatch(expression);
  const match = expression.exec(watcher?.output() ?? "");
  if (!match?.[1] || !match[2]) throw new Error("Missing preview address/PID");
  return { url: match[1], pid: Number(match[2]) };
}

// Waits for the watcher to serve the commit, then opens the page at its URL
// and checks the commit's title.
export async function shownActivation(
  watcher: ProductionWatcher | undefined,
  commit: string,
  page: Page,
  title: string,
): Promise<ProductionActivation> {
  const served = await productionActivation(watcher, commit);
  await page.goto(served.url);
  await expect(page).toHaveTitle(title);
  return served;
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

// Production keeps serving what it served: the same preview still runs, and
// the page, reloaded, still shows that commit's title.
export async function expectStillServing(
  served: ProductionActivation,
  page: Page,
  title: string,
) {
  expect(processRunning(served.pid)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle(title);
}

// Waits for the watcher's first check of main after it reported serving the
// commit. The watcher retires superseded deployment checkouts before it
// checks main again, so by then they are gone, however long that took.
export async function checkedAfterActivation(
  watcher: ProductionWatcher | undefined,
  commit: string,
) {
  expect(watcher?.output()).toMatch(activationPattern(commit));
  const checks = watcher?.checks() ?? 0;
  await expect
    .poll(() => watcher?.checks() ?? 0, { timeout: 0 })
    .toBeGreaterThan(checks);
}

export function outputCount(
  watcher: ProductionWatcher | undefined,
  expression: RegExp,
) {
  return watcher?.output().match(expression)?.length ?? 0;
}

// How often the watcher has begun preparing the commit.
export function preparations(
  watcher: ProductionWatcher | undefined,
  commit: string,
) {
  return outputCount(
    watcher,
    new RegExp(`Preparing production dashboard ${commit}\\.`, "g"),
  );
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
    .poll(() => watcher?.output() ?? "", { timeout: 0 })
    .toContain(`Skipping production update ${commit}: `);
  const checks = watcher?.checks() ?? 0;
  await expect.poll(() => watcher?.checks() ?? 0).toBeGreaterThan(checks + 1);
}

// Production has ended: the preview it served no longer runs or answers, and
// no deployment checkout remains in the machine HOME.
export async function expectProductionEnded(
  request: APIRequestContext,
  served: ProductionActivation,
  home: string,
) {
  expect(processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(productionDeployments(home))).toEqual([]);
}
