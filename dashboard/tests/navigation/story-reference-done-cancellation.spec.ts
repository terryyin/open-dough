import type { Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { test } from "../storyDependencyFixture.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  expectEntries,
  showLatestAction,
  shownEntries,
} from "../recentlyDoneColumn.ts";
import { untilPageRests } from "../recentlyDoneProgressivePage.ts";
import { showColumn } from "../boardPage.ts";
import { pointerDownOn, storyCard } from "../storyCardControls.ts";
import {
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
} from "../storyReference.ts";
import {
  doneTitlesThrough,
  farDone,
  serveDoneReferences,
} from "../storyReferenceDone.ts";

test.use({ hasTouch: true });

// With the latest ten Done stories shown, Story A's reference to the far Done
// story is followed while that story's record is held: its destination waits
// in Recently done, still being read.
async function followHeldFarReference(page: Page) {
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, farDone.identity);
  const destination = doneDestination(recent, farDone.identity);
  await expect(destination).toContainText("Reading done story…");
  return { consumer, recent, destination };
}

test("a developer's later move or latest-ten choice supersedes a pending Done reference", async ({
  page,
  origin,
}) => {
  const published = await serveDoneReferences(page, origin);
  const release = published.hold(farDone.path);
  const { consumer, recent, destination } = await followHeldFarReference(page);
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  const ownChoice = consumer.getByRole("button", { name: "Hide detail" });
  await expect(ownChoice).toBeFocused();
  await expect(referenceNotice(page)).toBeEmpty();
  // A repeated reference is a new destination; explicitly returning to ten
  // supersedes it too, even when the old record subsequently answers.
  await followReference(consumer, farDone.identity);
  await expect(referenceNotice(page)).toContainText("Reading Open Dough");
  await showColumn(page, "Recently done");
  const latest = showLatestAction(recent);
  await latest.click();
  await expect(shownEntries(recent)).toHaveCount(10);
  release();
  await untilPageRests(page);
  await expectEntries(recent, doneTitlesThrough(10));
  await expect(destination).toHaveCount(0);
  await expect(latest).toHaveCount(0);
  await expect(referenceNotice(page)).toBeEmpty();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
});

test("pointer down stops a pending Done jump while its data arrives and the pointer's chosen action still clicks", async ({
  page,
  origin,
}) => {
  const published = await serveDoneReferences(page, origin);
  const release = published.hold(farDone.path);
  const { consumer, destination } = await followHeldFarReference(page);
  const ownAction = consumer.getByRole("button", { name: "Inspect story" });
  await pointerDownOn(ownAction);
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).not.toBeFocused();
  await expect(ownAction).toBeFocused();
  await page.mouse.up();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  await expect(
    consumer.getByRole("button", { name: "Hide detail" }),
  ).toBeFocused();
  await expect(referenceNotice(page)).toBeEmpty();
});

test("Tab away from a pending reference's Dismiss action supersedes its jump before held Done detail arrives", async ({
  page,
  origin,
}) => {
  const published = await serveDoneReferences(page, origin);
  const release = published.hold(farDone.path);
  const { destination } = await followHeldFarReference(page);
  const dismiss = referenceNotice(page).getByRole("button", {
    name: "Dismiss story reference",
  });
  await dismiss.focus();
  await page.keyboard.press("Tab");
  const moved = await page.locator(":focus").elementHandle();
  expect(await moved.evaluate((element) => element.tagName)).not.toBe("BODY");
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  expect(
    await moved.evaluate((element) => element === document.activeElement),
  ).toBe(true);
  await expect(destination).not.toBeFocused();
  await expect(referenceNotice(page)).toBeEmpty();
});
