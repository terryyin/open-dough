// Story review state survives page reload and a real dashboard restart.
// Keyboard Unreview after restart preserves card order, selection, snapshot
// marks and repository bytes. The card-interaction journey remains in
// ../../dashboard/tests/stories/recently-done-review-state.spec.ts.

import { expectEntries } from "../../dashboard/tests/recentlyDoneColumn.ts";
import {
  doneCard,
  doneStories,
  expectReviewed,
  keepSnapshotMark,
  keptReviewStates,
  markAsReviewed,
  openRecentlyDone,
  publishDoneStories,
  repositoryState,
  storyA,
  storyB,
  storyC,
  storyActions,
  unreviewStory,
} from "../../dashboard/tests/recentlyDoneReviewState.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../../dashboard/tests/support/preparationPage.ts";
import { sidePanelContents } from "../../dashboard/tests/support/sidePanelContents.ts";
import {
  emptyArea,
  expectSelected,
} from "../../dashboard/tests/storyCardSelection.ts";

const titles = doneStories.map(({ title }) => title);

test("review state survives reload and restart, with keyboard Unreview preserving the selected story and local snapshot mark", async ({
  page,
  dashboard,
  origin,
}) => {
  const snapshotMark = keepSnapshotMark(dashboard, storyA);
  const marked = snapshotMark();
  await publishDoneStories(page, origin);
  const repository = await repositoryState(origin);
  const recent = await openRecentlyDone(page);
  const a = doneCard(page, storyA.title);
  const b = doneCard(page, storyB.title);
  const c = doneCard(page, storyC.title);
  const count = recent.getByText("3 entries", { exact: true });
  await markAsReviewed(a).click();
  await expectReviewed(a, true);

  await test.step("after a reload A is still reviewed; marking B then keeps both reviewed", async () => {
    await page.reload();
    await expectEntries(recent, titles);
    await expectReviewed(a, true);
    await expectReviewed(b, false);
    await expect(storyActions(a).getByRole("status")).toHaveText("");
    await markAsReviewed(b).click();
    await page.reload();
    await expectReviewed(a, true);
    await expectReviewed(b, true);
  });

  await test.step("after the dashboard restarts the same holds", async () => {
    const port = Number(new URL(dashboard.baseURL).port);
    await dashboard.close();
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      machine: origin.machine,
      github: dashboard.github,
      projectFolders: ["open-dough"],
      port,
    });
    try {
      await page.reload();
      await expectEntries(recent, titles);
      await expectReviewed(a, true);
      await expectReviewed(b, true);
      await expectReviewed(c, false);

      // Unreview restores Mark as reviewed, with the keyboard on it, C
      // selected again.
      await emptyArea(c).click();
      await expectSelected(c, true);
      await unreviewStory(a, "Unreview this story?", "keyboard");
      await expectReviewed(a, false);
      await expect(markAsReviewed(a)).toBeFocused();
      await expect(storyActions(a).getByRole("status")).toHaveText(
        "Marked as not reviewed.",
      );
      await expectEntries(recent, titles);
      await expect(count).toBeVisible();
      await expectSelected(c, true);
      await expectSelected(a, false);
      await expect(sidePanelContents(page)).toHaveCount(0);
      expect(
        Object.keys(keptReviewStates(dashboard)?.["open-dough"] ?? {}),
      ).toEqual([storyB.identity]);

      await page.reload();
      await expectReviewed(a, false);
      await expectReviewed(b, true);
      expect(snapshotMark()).toBe(marked);
      expect(await repositoryState(origin)).toEqual(repository);
    } finally {
      await restarted.close();
    }
  });
});
