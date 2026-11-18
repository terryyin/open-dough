// A project refresh keeps Recently done review state, and another page of the
// same server shows it at its next read. Card mark/unreview UI:
// ../../dashboard/frontend-tests/stories/recently-done-review-state.spec.ts.
// Reload/restart persistence:
// ./recently-done-review-state-persistence.spec.ts.

import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { parts } from "../../dashboard/test-support/dashboardParts.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
  openRecentlyDone,
} from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { expectEntries } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { refreshedTo } from "../../dashboard/test-support/recentlyDoneRefresh.ts";
import {
  doneStories,
  publishDoneStories,
  storyA,
} from "../../dashboard/test-support/recentlyDoneReviewState.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";

const titles = doneStories.map(({ title }) => title);

test("a project refresh keeps the review state, and another page of the same server shows it at its next read", async ({
  page,
  origin,
}) => {
  await page.clock.install();
  const other = await page.context().newPage();
  await other.clock.install();
  const now = Date.now();
  const published = await publishDoneStories(page, origin, now);
  await openRecentlyDone(page);
  await openRecentlyDone(other);
  await expectReviewed(doneCard(other, storyA.title), false);

  await markAsReviewed(doneCard(page, storyA.title)).click();
  await expectReviewed(doneCard(page, storyA.title), true);

  // The other page reads again at its next check.
  await expect(async () => {
    await other.clock.fastForward(checkIntervalMs);
    await expectReviewed(doneCard(other, storyA.title), true);
  }).toPass();

  // A later story is published; the refreshed column keeps A reviewed.
  const later = { identity: "SEED-333#later-story", title: "A later story" };
  const revision = await origin.publishRevision({
    message: "Complete a later story",
    doneRecords: [
      makeMe.aDoneRecord
        .with({ ...later, completedAt: new Date(now).toISOString() })
        .please(),
    ],
  });
  published.advanceTo(revision);
  await refreshedTo(page, revision);
  const recent = parts(page).recentlyDone;
  await expectEntries(recent, [later.title, ...titles]);
  await expect(recent.getByText("4 entries", { exact: true })).toBeVisible();
  await expectReviewed(doneCard(page, storyA.title), true);
  await expectReviewed(doneCard(page, later.title), false);
  await other.close();
});
