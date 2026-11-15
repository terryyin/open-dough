// A session whose start, or whose refinement's preparation, established a
// workspace says "Workspace <folder>" on its card, shown beneath the project
// folder as the server projects it, never the home directory, on the
// committed origin from ../../dashboard/tests/launchJourney.ts. What the
// launch dialogs and pending cards say of a start is
// ../../dashboard/frontend-tests/launches/agent-launch-story-card-dialogs.spec.ts
// and ../../dashboard/frontend-tests/launches/agent-launch-story-card-answers.spec.ts.

import path from "node:path";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  storyCardSessions,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { openTakenBacklog } from "../../dashboard/tests/launchStoryCardPage.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { readyStory } from "../../dashboard/tests/launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

// The kept records are written as ../../backend-tests/launches/agent-launch-start.spec.ts and
// ../../backend-tests/launches/agent-launch-preparation-start.spec.ts show the real starts
// leave them.
test("a session whose start or preparation established a workspace says Workspace <folder> beneath the project folder, never the home directory, one without says none, and none is listed in Recently done", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const workspace = path.join(
    dashboard.home,
    "git",
    "open-dough",
    ".worktrees",
    "story-b",
  );
  // Story B's launch by `workflow` in this session, a minute ago.
  const launched = (sessionId: string, workflow: "execution" | "refinement") =>
    makeMe.aLaunchRecord
      .ofWorkflow(workflow, { identity: "SEED-B#b", title: readyStory })
      .inClaudeSession({ sessionId })
      .launchedAt(new Date(Date.now() - 60_000).toISOString());
  const storyBranch = { workspace, branch: "claude/story-b" };
  keepLaunchStore(dashboard, {
    "open-dough": [
      launched("11111111-aaaa-bbbb-cccc-000000000001", "execution")
        .onStoryBranch({
          ...storyBranch,
          publisherId: "dashboard-test-open-dough",
          publishedSha: "0123456789abcdef0123456789abcdef01234567",
        })
        .please(),
      launched("22222222-aaaa-bbbb-cccc-000000000002", "execution").please(),
      launched("33333333-aaaa-bbbb-cccc-000000000003", "refinement")
        .onStoryBranch(storyBranch)
        .please(),
      launched("44444444-aaaa-bbbb-cccc-000000000004", "refinement").please(),
    ],
  });

  const { card } = await openTakenBacklog(page, launchJourney);
  const entries = storyCardSessions(card(readyStory));
  await expect(entries).toHaveCount(4);
  for (const established of ["11111111", "33333333"]) {
    const entry = entries.filter({ hasText: established });
    await expect(entry).toContainText(
      "Workspace ~/git/open-dough/.worktrees/story-b",
    );
    await expect(entry).not.toContainText(dashboard.home);
  }
  for (const plain of ["22222222", "44444444"]) {
    await expect(entries.filter({ hasText: plain })).not.toContainText(
      "Workspace",
    );
  }
  await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(0);
});
