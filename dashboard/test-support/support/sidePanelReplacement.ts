// A published session and two Story cards for Side panel replacement and
// perspective changes. Story B's report is recovered from native history.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { addedOnBranch, publishedPairAdding } from "../originatingMachine.ts";
import { sidePanelPages } from "../sidePanelPages.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { test as base } from "./preparationPage.ts";
import { publishReviewSession } from "./publishedReviewSession.ts";
import { openBacklog } from "./sessionDialog.ts";
import {
  retiredCodexSession,
  storyBBranch,
  storyBReport,
  storyBWorktree,
  storyReviewReads,
} from "./sidePanelContents.ts";
import { otherQueuedIdentity } from "./startOrigin.ts";
import { keepPublishedStoryReview } from "./storyLaunchRecord.ts";

export const test = base.extend<{
  storiesAAndB: {
    reviewReads: readonly string[];
    journey: ReturnType<typeof sidePanelPages>;
    storyBSession: string;
    session: string;
  };
}>({
  storiesAAndB: async ({ page, dashboard, origin, codexProtocol }, use) => {
    if (codexProtocol === undefined) throw new Error("Missing native fixture");
    const session = publishReviewSession(
      origin,
      publishedPairAdding(origin, "story-b.txt"),
    );
    const branchA = "codex/intent-review-story-a";
    const { workspace: workspaceA } = addedOnBranch(
      origin,
      branchA,
      "intent-story-a.txt",
    );
    const { record: storyAReview } = keepPublishedStoryReview(
      dashboard,
      origin,
      workspaceA,
    );
    const workspaceB = storyBWorktree(origin.project);
    keepLaunchRecords(dashboard, [
      storyAReview,
      makeMe.aLaunchRecord
        .executing({ identity: otherQueuedIdentity, title: "Story B" })
        .onStoryBranch({ workspace: workspaceB, branch: storyBBranch })
        .inCodexSession(
          retiredCodexSession(codexProtocol, workspaceB, storyBReport),
        )
        .please(),
    ]);
    const reviewReads = storyReviewReads(page);
    await page.setViewportSize({ width: 2400, height: 900 });
    await openBacklog(page, origin);
    await use({
      reviewReads,
      journey: sidePanelPages(page),
      session,
      storyBSession: codexProtocol.threadId,
    });
  },
});
