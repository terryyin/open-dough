// The Dashboard Backend Test run's setup (../../backend.playwright.config.ts).
// Its workers start dashboard servers, real Git origins and synthetic hosts,
// prepared as for any such run (./serviceRunSetup.ts), and may request only
// what backend specs serve from: the server bundle, the app build a preview
// or static server serves, the installed start origins, the published main
// sources and the story-columns history. It builds no comparison mount; a
// spec requesting an artifact this run does not register fails naming it
// (./runArtifacts.ts). Its run identity and teardown are the shared run
// lifecycle's (./runLifecycle.ts).

import { storyColumnsPrefixArtifact } from "../launchJourney.ts";
import { dashboardAppArtifact } from "./dashboardBuild.ts";
import { publishedMainSourceArtifact } from "./publishedMainSource.ts";
import { serverBundleArtifact } from "./serverBundle.ts";
import { ownServiceRun } from "./serviceRunSetup.ts";
import { startOriginArtifacts } from "./startOriginPreparation.ts";

export default function backendGlobalSetup(): Promise<() => Promise<void>> {
  return ownServiceRun(
    new Map([
      serverBundleArtifact(),
      dashboardAppArtifact(),
      ...startOriginArtifacts(),
      publishedMainSourceArtifact(),
      publishedMainSourceArtifact(undefined, "application"),
      storyColumnsPrefixArtifact(),
    ]),
  );
}
