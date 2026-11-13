// A reader of the collecting server's same private machine history, with
// collection disabled, or of what a machine keeps where no collector ran: it
// takes the provider its reads reach and, of a collector, its build. The
// caller closes it; a collector may finish in parallel but must be closed
// before acquisition-count observations begin.
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";

export function startLandedCiReader(
  dashboard: Pick<DashboardServer, "github"> &
    Partial<Pick<DashboardServer, "outDir">>,
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
