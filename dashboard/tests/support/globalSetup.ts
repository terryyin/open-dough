// Builds the production dashboard once per suite run into `dashboard/dist`,
// which every page journey's own preview server then serves read-only
// (./dashboardServer.ts), so no run exercises stale assets.

import { buildDashboardTo, builtDashboardDir } from "./dashboardServer.ts";

export default function globalSetup(): void {
  buildDashboardTo(builtDashboardDir);
}
