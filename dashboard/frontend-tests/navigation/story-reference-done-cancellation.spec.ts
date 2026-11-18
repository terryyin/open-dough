// Story A's reference to the far Done story is followed while that story's
// record is held. A move the developer makes meanwhile, Inspect, "Show latest
// 10", a pointer down or Tab away from Dismiss, supersedes the jump: when the
// record arrives the keyboard stays where the developer moved it.

import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  expectEntries,
  showLatestAction,
  shownEntries,
} from "../../test-support/recentlyDoneColumn.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import {
  inspectionToggle,
  pointerDownOn,
  storyCard,
} from "../../test-support/storyCardControls.ts";
import {
  expectInspected,
  storyDetail,
} from "../../test-support/storyCardSelection.ts";
import {
  dismissReference,
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
} from "../../test-support/storyReference.ts";
import {
  expectKeyboardAtMark,
  markKeyboardPlace,
} from "../../test-support/pageShortcutsPage.ts";
import { untilPageRequestsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  doneTitlesThrough,
  farDone,
  putFrontendDoneReferences,
} from "../../test-support/support/frontendDoneReferences.ts";
import { holdDoneRecordReads } from "../../test-support/support/frontendDoneBodyReads.ts";

test.use({ hasTouch: true });

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

// With the latest ten Done stories shown, Story A's reference to the far Done
// story is followed while every ask naming its record is held: its destination
// waits in Recently done, still being read.
async function followHeldFarReference(page: Page) {
  const held = await holdDoneRecordReads(page, farDone.path, releases);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, farDone.identity);
  const destination = doneDestination(recent, farDone.identity);
  await expect(destination).toContainText("Reading done story…");
  return { consumer, recent, destination, release: held.release };
}

test("a developer's later move or latest-ten choice supersedes a pending Done reference", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const { consumer, recent, destination, release } =
    await followHeldFarReference(page);
  const ownChoice = inspectionToggle(consumer);
  await ownChoice.click();
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
  await untilPageRequestsAnswered(page);
  await expectEntries(recent, doneTitlesThrough(10));
  await expect(destination).toHaveCount(0);
  await expect(latest).toHaveCount(0);
  await expect(referenceNotice(page)).toBeEmpty();
  await expect(storyDetail(consumer)).toBeVisible();
});

test("pointer down stops a pending Done jump while its data arrives and the pointer's chosen action still clicks", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const { consumer, destination, release } = await followHeldFarReference(page);
  const ownAction = inspectionToggle(consumer);
  await pointerDownOn(ownAction);
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).not.toBeFocused();
  await expect(ownAction).toBeFocused();
  await expectInspected(consumer, false);
  await page.mouse.up();
  await expect(storyDetail(consumer)).toBeVisible();
  await expect(ownAction).toBeFocused();
  await expect(referenceNotice(page)).toBeEmpty();
});

test("Tab away from a pending reference's Dismiss action supersedes its jump before held Done detail arrives", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const { destination, release } = await followHeldFarReference(page);
  await dismissReference(page).focus();
  await page.keyboard.press("Tab");
  expect(await markKeyboardPlace(page)).not.toBe("");
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expectKeyboardAtMark(page);
  await expect(destination).not.toBeFocused();
  await expect(referenceNotice(page)).toBeEmpty();
});
