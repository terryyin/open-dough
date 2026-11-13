import { expect, githubFor } from "../dashboardTest.ts";
import { test } from "../storyDependencyFixture.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { expectEntries } from "../recentlyDoneColumn.ts";
import { recordsAsked } from "../recentlyDoneProgressivePage.ts";
import { noConnection } from "../originAnswers.ts";
import { expectReadingTop } from "../readingPlace.ts";
import {
  donePathsThrough,
  doneTitlesThrough,
  farDone,
  nearDone,
  serveDoneReferences,
} from "../storyReferenceDone.ts";
import { storyCard } from "../storyCardControls.ts";
import {
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
} from "../storyReference.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expectCueEnds, expectDestinationCue } from "../destinationCue.ts";

test.use({ hasTouch: true });

test("a Done reference without sessions reveals exactly through its existing destination and keeps a longer range", async ({
  page,
  origin,
  dashboard,
}) => {
  await serveDoneReferences(page, origin);
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(10).toSorted(),
  );
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  const near = storyCard(recent, nearDone.title);
  await followReference(consumer, nearDone.identity);
  await expect(near).toBeFocused();
  await expect(near).toBeInViewport({ ratio: 0.5 });
  await expectReadingTop(near);
  await expectEntries(recent, doneTitlesThrough(10));
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(10).toSorted(),
  );
  await followReference(consumer, farDone.identity);
  const destination = storyCard(recent, farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectEntries(recent, doneTitlesThrough(27));
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
  await followReference(consumer, farDone.identity);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await followReference(consumer, nearDone.identity);
  await expect(near).toBeFocused();
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
  await expect(recent.locator(".session-entry")).toHaveCount(0);
  await expect(referenceNotice(page)).toBeEmpty();
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("a delayed Done detail keeps the destination pending and keyboard activation reaches it at a narrow reduced-motion viewport", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await pausePageClock(page);
  const published = await serveDoneReferences(page, origin);
  const release = published.hold(farDone.path);
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer, "tap");
  await followReference(consumer, farDone.identity, "keyboard");
  const destination = doneDestination(recent, farDone.identity);
  const notice = referenceNotice(page);
  await expect(destination).toContainText("Reading done story…");
  await expect(destination).not.toBeFocused();
  await expect(notice).toContainText(
    `Reading Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  await expect
    .poll(() => recordsAsked(githubFor(page)).toSorted())
    .toEqual(donePathsThrough(27).toSorted());
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectDestinationCue(page, destination, { motion: false });
  await expect(page.locator(".story-card-selected")).toHaveCount(0);
  await expectCueEnds(page, destination);
  await expectSelected(destination, false);
  await expect(notice).toBeEmpty();
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
});

test("a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories", async ({
  page,
  origin,
}) => {
  const published = await serveDoneReferences(page, origin);
  const restore = published.answerWith(farDone.path, noConnection);
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, farDone.identity);
  const destination = doneDestination(recent, farDone.identity);
  await expect(destination).toContainText("This done story could not be read.");
  await expect(destination).toHaveAccessibleName(farDone.identity);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(referenceNotice(page)).toBeEmpty();
  restore();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  await expectEntries(recent, doneTitlesThrough(27));
  await expect(recent).not.toContainText("could not be read");
  expect(
    recordsAsked(githubFor(page)).filter(
      (path) => !donePathsThrough(27).includes(path),
    ),
  ).toEqual([]);
  expect(
    recordsAsked(githubFor(page)).filter((path) => path === farDone.path),
  ).toHaveLength(2);
  await followReference(consumer, farDone.identity);
  await expect(destination).toBeFocused();
});
