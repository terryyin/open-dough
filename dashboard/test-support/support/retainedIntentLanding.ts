// A real completed Story Branch execution whose first captured publication is
// its completion. Callers keep their implementation/later/local facts visible.
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { expect } from "./pageTest.ts";
import { commitBacklogCompletion } from "./completedStoryPublication.ts";
import { capturedPublicationSchema } from "./launchLanding.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { claimedLaunchWithStoryCommit } from "./storyBranchIntegration.ts";
import { git } from "./storyReviewWorktree.ts";

export async function retainedIntentLanding(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
  implementation: RevisionFacts,
  { trunkAdvanced = true }: { readonly trunkAdvanced?: boolean } = {},
) {
  publishIntentTrunk(origin.project);
  Object.assign(native, { threadId: "story-branch-execution" });
  const story = await claimedLaunchWithStoryCommit(
    origin,
    dashboard,
    trunkAdvanced,
    {
      host: "codex",
      storyWork(workspace) {
        writeRevisionFiles(workspace, implementation);
        commitBacklogCompletion(
          workspace,
          "complete the captured test execution",
        );
      },
    },
  );
  const captured = capturedPublicationSchema.parse(await story.integrated())
    .landing.receipt;
  expect(captured.base).toBe(story.trunkTip);
  expect(captured.revision).toBe(git(origin.origin, "rev-parse", "main"));
  return { story, accepted: captured.revision };
}
