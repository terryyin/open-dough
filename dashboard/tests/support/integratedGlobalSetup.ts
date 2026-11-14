// The Dashboard Integrated UI Test run's setup
// (../../integrated.playwright.config.ts). Its detailed UI checks start
// dashboard servers, real Git origins and synthetic hosts, prepared as for any
// such run (./serviceRunSetup.ts), and may request what those serve from: the
// app build, the server bundle, the installed start origins, the published
// main sources and the story-columns history. It builds no comparison mount,
// which only Dashboard Frontend Test renders; a spec requesting an artifact
// this run does not register fails naming it (./runArtifacts.ts). Its run
// identity and teardown are the shared run lifecycle's (./runLifecycle.ts).

import {
  storyColumnsPrefixArtifact,
  storyColumnsPrefixArtifactKey,
} from "../launchJourney.ts";
import { dashboardAppArtifact } from "./dashboardBuild.ts";
import { publishedMainSourceArtifact } from "./publishedMainSource.ts";
import { requestRunArtifact } from "./runArtifacts.ts";
import { serverBundleArtifact } from "./serverBundle.ts";
import { ownServiceRun } from "./serviceRunSetup.ts";
import { startOriginArtifacts } from "./startOriginPreparation.ts";

export default async function integratedGlobalSetup(): Promise<
  () => Promise<void>
> {
  const teardown = await ownServiceRun(
    new Map([
      dashboardAppArtifact(),
      serverBundleArtifact(),
      ...startOriginArtifacts(),
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
