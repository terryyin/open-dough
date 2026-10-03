// Observe the public production watcher through its own reported activations
// and its default machine-home deployment checkouts.
import { expect } from "@playwright/test";
import path from "node:path";
import { dashboardCommand } from "./dashboardCommand.ts";

export type ProductionWatcher = ReturnType<typeof dashboardCommand>;

export function productionDeployments(home: string) {
  return path.join(home, ".open-dough/dashboard/deployments");
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
) {
  const expression = activationPattern(commit, restored);
  await expect
    .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
    .toMatch(expression);
  const match = expression.exec(watcher?.output() ?? "");
  if (!match?.[1] || !match[2]) throw new Error("Missing preview address/PID");
  return { url: match[1], pid: Number(match[2]) };
}

export function outputCount(
  watcher: ProductionWatcher | undefined,
  expression: RegExp,
) {
  return watcher?.output().match(expression)?.length ?? 0;
}
