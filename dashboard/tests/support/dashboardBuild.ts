// The production dashboard build a preview server serves (./dashboardServer.ts).

import path from "node:path";
import { ownedProcess } from "../../server/productionProcess.mjs";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";

export const dashboardAppArtifactKey = "app";

// The preview or static server calls this when it is about to serve the app.
// Custom configurations without a run owner can still serve dashboard/dist.
export async function sharedDashboardBuild(): Promise<string> {
  return (
    (await requestRunArtifact(dashboardAppArtifactKey)) ??
    process.env["OPEN_DOUGH_DASHBOARD_BUILD"] ??
    path.join(repoRoot, "dashboard", "dist")
  );
}

// Builds into `outDir` rather than the run's shared build, which other tests'
// preview servers may be serving concurrently (`fullyParallel: true`).
export async function buildDashboardTo(
  outDir: string,
  signal?: AbortSignal,
): Promise<void> {
  const build = ownedProcess(
    "npm",
    ["run", "build:dashboard", "--", "--outDir", outDir],
    { cwd: repoRoot, ...(signal === undefined ? {} : { signal }) },
  );
  const result = await build.exited;
  signal?.throwIfAborted();
  if (result.code !== 0) {
    throw new Error(
      `npm run build:dashboard failed (${result.signal ?? String(result.code)}):\n${build.output()}`,
    );
  }
}
