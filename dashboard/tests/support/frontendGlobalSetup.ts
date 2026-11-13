// The Dashboard Frontend Test run's setup (../../frontend.playwright.config.ts).
// Its workers may request only what frontend specs serve: the app build
// (./frontendAppServer.ts, ./comparisonRendering.ts) and the comparison
// mount bundle (./comparisonMountPage.ts). It starts no dashboard server,
// synthetic GitHub or agent host. Its run identity and teardown are the
// shared run lifecycle's (./runLifecycle.ts): no process the run starts
// outlives it, and its artifacts are removed however the run ends.

import { comparisonMountArtifact } from "./comparisonMountArtifact.ts";
import { dashboardAppArtifact } from "./dashboardBuild.ts";
import { ownDashboardRun } from "./runLifecycle.ts";
import { identifyRun } from "./runProcesses.ts";

export default async function frontendGlobalSetup(): Promise<
  () => Promise<void>
> {
  return ownDashboardRun(
    identifyRun(),
    new Map([dashboardAppArtifact(), comparisonMountArtifact()]),
  );
}
