import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { expectEntries } from "../../test-support/recentlyDoneColumn.ts";
import { storyCard } from "../../test-support/storyCardControls.ts";
import {
  dependencyDisclosure,
  dependencySummary,
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
  storyReference,
} from "../../test-support/storyReference.ts";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../test-support/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  donePathsWithSuppliersThrough,
  doneTitlesThrough,
  farDone,
  laterDone,
  putFrontendDoneReferences,
  replacedStoryAAgreements,
} from "../../test-support/support/frontendDoneReferences.ts";
import {
  eachRecordOnce,
  failDoneRecordReads,
  recordDoneRecordsAsked,
} from "../../test-support/support/frontendDoneBodyReads.ts";
import { preholdRevisionStreamSlots } from "../../test-support/support/revisionStreamSlots.ts";

test.use({ hasTouch: true });

test("a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const unreachable = await failDoneRecordReads(page, farDone.path);
  const recordsAsked = recordDoneRecordsAsked(page);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  // The failed title ask finishes before navigation makes its own ask.
  await expect.poll(unreachable.failed).toBe(1);
  await expect(storyReference(consumer, farDone.identity)).toBeVisible();
  await followReference(consumer, farDone.identity);
  const destination = doneDestination(recent, farDone.identity);
  await expect(destination).toContainText("This done story could not be read.");
  await expect(destination).toHaveAccessibleName(farDone.identity);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(referenceNotice(page)).toBeEmpty();
  expect(unreachable.failed()).toBe(2);
  unreachable.restore();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  await expectEntries(recent, doneTitlesThrough(27));
  await expect(recent).not.toContainText("could not be read");
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(27),
  );
  expect(recordsAsked().filter((path) => path === farDone.path)).toHaveLength(
    3,
  );
  await followReference(consumer, farDone.identity);
  await expect(destination).toBeFocused();
});

test("a dependency disclosure replaced after unavailable facts waits for opening before reading its new supplier title", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const agreements = replacedStoryAAgreements(frontendServices);
  const recordsAsked = recordDoneRecordsAsked(page);
  await pausePageClock(page);
  // With both stream slots held elsewhere, the page checks on its own clock.
  await preholdRevisionStreamSlots(page);
  await page.goto("/");
  const card = storyCard(parts(page).backlog, "Story A");
  await openDependencies(card);
  await expect(storyReference(card, farDone.title)).toBeVisible();
  agreements.publishUnreadable();
  await passTimeUntilChecked(page);
  await expect(card).toContainText("Dependency facts unavailable");
  await expect(dependencyDisclosure(card)).toHaveCount(0);
  agreements.publishReplaced();
  await passTimeUntilChecked(page);
  await expect(dependencySummary(card)).toHaveText("Dependencies · 1 blocking");
  await expect(dependencyDisclosure(card)).not.toHaveAttribute("open", "");
  await untilPageRequestsAnswered(page);
  expect(recordsAsked()).not.toContain(laterDone.path);
  await openDependencies(card);
  await expect(storyReference(card, laterDone.title)).toBeVisible();
  // Asked once by the page; the server sparing a same-revision re-ask is
  // Backend's (authenticated-read-done-catalog.spec.ts).
  expect(recordsAsked().filter((path) => path === laterDone.path)).toHaveLength(
    1,
  );
});
