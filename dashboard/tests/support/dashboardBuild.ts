// The production dashboard build a preview server serves (./dashboardServer.ts).

import { spawnSync } from "node:child_process";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

// Built once per suite run by ./globalSetup.ts into the run's own temporary
// directory, whose path reaches workers in this variable; every preview server
// that is not asked to build its own serves it read-only. Workers import this
// module after global setup, so they read the run's build; only the runner,
// which imports it for global setup before the variable is set and serves
// nothing, sees the `dashboard/dist` fallback.
export const builtDashboardVariable = "OPEN_DOUGH_DASHBOARD_BUILD";
export const builtDashboardDir =
  process.env[builtDashboardVariable] ??
  path.join(repoRoot, "dashboard", "dist");

// Builds into `outDir` rather than the run's shared build, which other tests'
// preview servers may be serving concurrently (`fullyParallel: true`).
export function buildDashboardTo(outDir: string): void {
  const result = spawnSync(
    "npm",
    ["run", "build:dashboard", "--", "--outDir", outDir],
    {
      cwd: repoRoot,
      stdio: "pipe",
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `npm run build:dashboard failed:\n${result.stdout}\n${result.stderr}`,
    );
  }
}
