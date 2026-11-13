// A done story card in Recently done carries its story's review state, kept
// per project and story identity on the machine serving the dashboard: an
// unreviewed card, including a story completed on another machine and never
// run here, offers Mark as reviewed among its Story actions; a reviewed card
// says Reviewed in words and offers Unreview beside it. Either action keeps
// the card, its place, its sessions, the column's count, the Selected story
// and the Side panel as they were, keeps the keyboard on the card, and is
// announced once. The state outlives reload, a project refresh and a
// dashboard restart, and every page of that server shows it at its next read.
// It neither reads nor changes the story review's snapshot marks, and writes
// nothing to the project's repository. Cards whose record is not read, and
// touch input: ./recently-done-review-state-offer.spec.ts. Saves that fail:
// ../../../e2e/stories/recently-done-review-state-failed-save.spec.ts. Request refusals:
// ../../backend-tests/review/story-review-state-admission.spec.ts.

import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { parts, storyCardSessions } from "../dashboardParts.ts";
import { expectEntries } from "../recentlyDoneColumn.ts";
import { refreshedTo } from "../recentlyDoneRefresh.ts";
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
  storyActions,
  storyB,
  storyC,
  unreview,
} from "../recentlyDoneReviewState.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../support/dashboardServer.ts";
import { quietStorySessions } from "../support/followUpStories.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";
import { sidePanelContents } from "../support/sidePanelContents.ts";
import { expectSelected, selectStory } from "../storyCardSelection.ts";

const titles = doneStories.map(({ title }) => title);

test("Mark as reviewed and Unreview keep each story's state on this machine, through reload and restart, leaving the card, the selection, the snapshot mark and the repository as they were", async ({
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

  await test.step("stories completed elsewhere, one holding a snapshot mark, are all unreviewed", async () => {
    await expectEntries(recent, titles);
    for (const card of [a, b, c]) await expectReviewed(card, false);
    expect(keptReviewStates(dashboard)).toBeUndefined();
    // Only done story cards carry a review state; the queued story's Backlog
    // card offers none.
    await expect(parts(page).backlog.getByRole("article")).not.toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Mark as reviewed", exact: true }),
    ).toHaveCount(3);
  });

  await test.step("Mark as reviewed on A, by keyboard, with C selected: A says Reviewed with focus on Unreview, once announced; B, the order, the count, the selection and the Side panel stay", async () => {
    await selectStory(c).click();
    await expectSelected(c, true);
    await expect(sidePanelContents(page)).toHaveCount(0);
    const actionsOfA = await storyActions(a)
      .getByRole("button")
      .allTextContents();
    await markAsReviewed(a).focus();
    await page.keyboard.press("Enter");
    await expectReviewed(a, true);
    await expect(unreview(a)).toBeFocused();
    await expect(storyActions(a).getByRole("status")).toHaveText(
      "Marked as reviewed.",
    );
    await expect(page.getByText("Marked as reviewed.")).toHaveCount(1);
    expect(await storyActions(a).getByRole("button").allTextContents()).toEqual(
      actionsOfA.map((name) =>
        name === "Mark as reviewed" ? "Unreview" : name,
      ),
    );
    await expectReviewed(b, false);
    await expectReviewed(c, false);
    await expectEntries(recent, titles);
    await expect(count).toBeVisible();
    await expectSelected(c, true);
    await expectSelected(a, false);
    await expect(sidePanelContents(page)).toHaveCount(0);
    expect(
      Object.keys(keptReviewStates(dashboard)?.["open-dough"] ?? {}),
    ).toEqual([storyA.identity]);
  });

  await test.step("the snapshot mark and the project's repository are as they were", async () => {
    expect(snapshotMark()).toBe(marked);
    expect(await repositoryState(origin)).toEqual(repository);
  });

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
      await selectStory(c).click();
      await expectSelected(c, true);
      await unreview(a).focus();
      await page.keyboard.press("Enter");
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

test("Mark as reviewed and Unreview keep the card's sessions as they were", async ({
  page,
  dashboard,
  origin,
}) => {
  const now = Date.now();
  keepLaunchRecords(
    dashboard,
    quietStorySessions(dashboard.home, storyA, new Date(now - 30 * 60_000)),
  );
  await publishDoneStories(page, origin, now);
  await openRecentlyDone(page);
  const a = doneCard(page, storyA.title);
  const sessions = storyCardSessions(a);
  const names = [
    `Execution session for ${storyA.title}`,
    `Refinement session for ${storyA.title}`,
  ];
  const expectSessions = async () => {
    await expect(sessions).toHaveCount(names.length);
    for (const name of names)
      await expect(
        a.getByRole("article", { name, exact: true }).getByRole("button", {
          name: "Read final report",
        }),
      ).toBeVisible();
  };
  await expectSessions();
  await markAsReviewed(a).click();
  await expectReviewed(a, true);
  await expectSessions();
  await unreview(a).click();
  await expectReviewed(a, false);
  await expectSessions();
});

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
