// The umbrella run's setup (../../playwright.config.ts). Workers request the
// app build, server bundle, an installed origin layout, the comparison mount
// or the story-columns history when they need it. Each completed artifact is
// shared read-only across the run. The run removes its own directories.
//
// The run's fixture executables, GitHub request root and Git are prepared as
// for any run whose workers start servers and hosts (./serviceRunSetup.ts).
//
// No process a run starts outlives it. The run's identity is set here, before
// any worker starts, so every process of the run carries it, and the teardown
// runs after every worker has exited: whatever of the run is still running
// then is ended and named, and the run fails (./runLifecycle.ts,
// ./runProcesses.ts).

import {
  storyColumnsPrefixArtifact,
  storyColumnsPrefixArtifactKey,
} from "../launchJourney.ts";
import { comparisonMountArtifact } from "./comparisonMountArtifact.ts";
import { dashboardAppArtifact } from "./dashboardBuild.ts";
import { publishedMainSourceArtifact } from "./publishedMainSource.ts";
import { requestRunArtifact } from "./runArtifacts.ts";
import { serverBundleArtifact } from "./serverBundle.ts";
import { ownServiceRun } from "./serviceRunSetup.ts";
import { startOriginArtifacts } from "./startOriginPreparation.ts";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const teardown = await ownServiceRun(
    new Map([
      dashboardAppArtifact(),
      serverBundleArtifact(),
      ...startOriginArtifacts(),
      comparisonMountArtifact(),
      publishedMainSourceArtifact(),
      publishedMainSourceArtifact(undefined, "application"),
      storyColumnsPrefixArtifact(),
    ]),
  );
  // The story-columns history is built now, overlapping the workers' start and
  // the app build, so the first page journeys find it ready instead of waiting
  // for one cold build. A failure here is kept for the workers that ask: each
  // receives it as its own setup failure.
  void requestRunArtifact(storyColumnsPrefixArtifactKey).catch(() => {});
  return teardown;
}
