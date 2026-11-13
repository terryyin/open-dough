// A done story card in Recently done carries its story's review state, kept
// per project and story identity on the machine serving the dashboard: an
// unreviewed card, including a story completed on another machine and never
// run here, offers Mark as reviewed among its Story actions; a reviewed card
// offers Reviewed, which asks before undoing review. Either saved change keeps
// the card, its place, its sessions, the column's count, the Selected story
// and the Side panel as they were, keeps the keyboard on the card, and is
// announced once. The state outlives reload, a project refresh and a
// dashboard restart, and every page of that server shows it at its next read.
// Reload/restart persistence is observed in ./recently-done-review-state-persistence.spec.ts.
// It neither reads nor changes the story review's snapshot marks, and writes
// nothing to the project's repository. Cards whose record is not read, and
// touch input: ./recently-done-review-state-offer.spec.ts. Saves that fail:
// ./recently-done-review-state-failed-save.spec.ts. Request refusals:
// ../../backend-tests/review/story-review-state-admission.spec.ts.

import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { parts, storyCardSessions } from "../dashboardParts.ts";
import { readFinalReportControl } from "../finalReportPages.ts";
import { expectEntries } from "../recentlyDoneColumn.ts";
import { refreshedTo } from "../recentlyDoneRefresh.ts";
import {
  cancelUnreview,
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
  reviewedButton,
  unreviewQuestion,
  unreviewStory,
} from "../recentlyDoneReviewState.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { quietStorySessions } from "../support/followUpStories.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { sidePanelContents } from "../support/sidePanelContents.ts";
import { expectSelected, selectStory } from "../storyCardSelection.ts";

const titles = doneStories.map(({ title }) => title);

test("Mark as reviewed keeps the card, selection, snapshot mark and repository as they were", async ({
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

  await test.step("Mark as reviewed on A, by keyboard, with C selected: A says Reviewed with focus on Reviewed, once announced; B, the order, the count, the selection and the Side panel stay", async () => {
    await selectStory(c).click();
    await expectSelected(c, true);
    await expect(sidePanelContents(page)).toHaveCount(0);
    const actionsOfA = await storyActions(a)
      .getByRole("button")
      .allTextContents();
    await markAsReviewed(a).focus();
    await page.keyboard.press("Enter");
    await expectReviewed(a, true);
    await expect(reviewedButton(a)).toBeFocused();
    await expect(storyActions(a).getByRole("status")).toHaveText(
      "Marked as reviewed.",
    );
    await expect(page.getByText("Marked as reviewed.")).toHaveCount(1);
    expect(await storyActions(a).getByRole("button").allTextContents()).toEqual(
      actionsOfA.map((name) =>
        name === "Mark as reviewed" ? "Reviewed" : name,
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

  await test.step("Cancel leaves A reviewed, with focus on Reviewed and C still selected", async () => {
    await reviewedButton(a).click();
    const question = unreviewQuestion(a, "Unreview this story?");
    await expect(cancelUnreview(question)).toBeFocused();
    const saved = keptReviewStates(dashboard);
    await cancelUnreview(question).click();
    await expect(question).toHaveCount(0);
    await expectReviewed(a, true);
    await expect(reviewedButton(a)).toBeFocused();
    await expectSelected(c, true);
    await expectSelected(a, false);
    expect(keptReviewStates(dashboard)).toEqual(saved);
  });

  await test.step("Escape closes the prompt and leaves A reviewed", async () => {
    await reviewedButton(a).press("Enter");
    const question = unreviewQuestion(a, "Unreview this story?");
    await expect(cancelUnreview(question)).toBeFocused();
    await cancelUnreview(question).press("Escape");
    await expect(question).toHaveCount(0);
    await expectReviewed(a, true);
    await expect(reviewedButton(a)).toBeFocused();
  });

  await test.step("the snapshot mark and the project's repository are as they were", async () => {
    expect(snapshotMark()).toBe(marked);
    expect(await repositoryState(origin)).toEqual(repository);
  });
});

test("Marking and unreviewing a story keep the card's sessions as they were", async ({
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
        readFinalReportControl(a.getByRole("article", { name, exact: true })),
      ).toBeVisible();
  };
  await expectSessions();
  await markAsReviewed(a).click();
  await expectReviewed(a, true);
  await expectSessions();
  await unreviewStory(a, "Unreview this story?", "mouse");
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
