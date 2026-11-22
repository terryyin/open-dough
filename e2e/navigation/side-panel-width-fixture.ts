import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { wideWindow } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { listed } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  expect,
  test as base,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import {
  branch,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

export { expect };

export const test = base.extend<{
  storyA: { title: string; sessionId: string };
}>({
  storyA: async ({ dashboard, origin }, use) => {
    const title = "Story A";
    const { workspace } = storyWorktree(origin);
    const sessionId = dashboard.claudeListsSession({
      name: title,
      cwd: workspace,
      startedAt: Date.now(),
    });
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .executing({ identity: queuedIdentity, title })
        .onStoryBranch({ workspace, branch })
        .inClaudeSession(listed(sessionId))
        .please(),
    ]);
    await use({ title, sessionId });
  },
});

test.use({ viewport: wideWindow });
