// A reader of the collecting server's same private machine history, with
// collection disabled. The caller closes it; a collector may finish in parallel
// but must be closed before acquisition-count observations begin.
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";

export function startLandedCiReader(
  dashboard: DashboardServer,
  origin: Pick<StartOrigin, "machine">,
  mode: "boundary" | "preview",
  prebuilt = dashboard.outDir ?? sharedDashboardBuild,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode,
    ...(mode === "preview" ? { prebuilt } : {}),
    github: dashboard.github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    extraEnv: { DOUGH_TEST_LANDED_CI_COLLECTION: "off" },
  });
}
