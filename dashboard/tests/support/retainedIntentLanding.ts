// A real captured Story Branch landing whose launch workspace stays readable.
// Callers supply committed story facts, then add their later-trunk/local facts
// and observe publication at the boundary their journey needs.
import type { RevisionFacts } from "../../../tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  integratedOntoTrunk,
  storyBranchExecutionAfterRefinement,
} from "./storyBranchLandedReview.ts";

export async function retainedIntentLanding(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
  implementation: RevisionFacts,
) {
  publishIntentTrunk(origin.project);
  const { story } = await storyBranchExecutionAfterRefinement(
    dashboard,
    origin,
    native,
    (workspace) => {
      writeRevisionFiles(workspace, implementation);
    },
  );
  const { accepted } = await integratedOntoTrunk(origin, story);
  return { story, accepted };
}
