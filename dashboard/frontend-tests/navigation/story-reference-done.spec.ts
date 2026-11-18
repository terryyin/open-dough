// Ten of 35 Done stories are shown while Story A waits on a near and a far
// one. Following a reference reveals its Done card through the real range:
// the near one in place, the far one by growing the range, asking only for
// the shown records and the referenced suppliers.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts, sessionEntriesIn } from "../../tests/dashboardPage.ts";
import { expectEntries } from "../../tests/recentlyDoneColumn.ts";
import { expectReadingTop } from "../../tests/readingPlace.ts";
import { storyCard } from "../../tests/storyCardControls.ts";
import { expectSelected } from "../../tests/storyCardSelection.ts";
import {
  dependencyDisclosure,
  dependencySummary,
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
  storyReference,
} from "../../tests/storyReference.ts";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../tests/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../../tests/pageRequestNotes.ts";
import {
  expectCueEnds,
  expectDestinationCue,
} from "../../tests/destinationCue.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import {
  donePathsThrough,
  donePathsWithSuppliersThrough,
  doneTitlesThrough,
  farDone,
  laterDone,
  nearDone,
  putFrontendDoneReferences,
  replacedStoryAAgreements,
} from "../../tests/support/frontendDoneReferences.ts";
import {
  eachRecordOnce,
  failDoneRecordReads,
  recordDoneRecordsAsked,
} from "../../tests/support/frontendDoneBodyReads.ts";
import { recordHostRequests } from "../../tests/support/frontendHostRequests.ts";
import { preholdRevisionStreamSlots } from "../../tests/support/revisionStreamSlots.ts";

test.use({ hasTouch: true });

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

const fileName = (path: string) => path.replace(".planning/done/", "");

test("a Done reference without sessions reveals exactly through its existing destination and keeps a longer range", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const recordsAsked = recordDoneRecordsAsked(page);
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  expect(eachRecordOnce(recordsAsked())).toEqual(donePathsThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await expect(storyReference(consumer, farDone.title)).toBeVisible();
  const near = storyCard(recent, nearDone.title);
  await followReference(consumer, nearDone.title);
  await expect(near).toBeFocused();
  await expect(near).toBeInViewport({ ratio: 0.5 });
  await expectReadingTop(near);
  await expectEntries(recent, doneTitlesThrough(10));
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(10),
  );
  await followReference(consumer, farDone.title);
  const destination = storyCard(recent, farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectEntries(recent, doneTitlesThrough(27));
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(27),
  );
  await followReference(consumer, farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await followReference(consumer, nearDone.title);
  await expect(near).toBeFocused();
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(27),
  );
  await expect(sessionEntriesIn(recent)).toHaveCount(0);
  await expect(referenceNotice(page)).toBeEmpty();
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  expect(hostRequests()).toEqual([]);
});

test("a delayed Done detail keeps the destination pending and keyboard activation reaches it at a narrow reduced-motion viewport", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await pausePageClock(page);
  putFrontendDoneReferences(frontendServices);
  // Every ask naming the far record waits: its supplier title and its card.
  const held = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("done") === "bodies" &&
      params.getAll("file").includes(fileName(farDone.path)),
    releases,
  );
  const recordsAsked = recordDoneRecordsAsked(page);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer, "tap");
  await expect(storyReference(consumer, farDone.identity)).toBeVisible();
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
    .poll(() => eachRecordOnce(recordsAsked()))
    .toEqual(donePathsWithSuppliersThrough(27));
  held.release();
  await expect(storyReference(consumer, farDone.title)).toBeVisible();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectDestinationCue(page, destination, { motion: false });
  await expect(page.locator(".story-card-selected")).toHaveCount(0);
  await expectCueEnds(page, destination);
  await expectSelected(destination, false);
  await expect(notice).toBeEmpty();
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(27),
  );
});

test("a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const unreachable = await failDoneRecordReads(page, fileName(farDone.path));
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
  // Asked once by the page; a count only the server decides is Backend's
  // (authenticated-read-listed-records.spec.ts).
  expect(recordsAsked().filter((path) => path === laterDone.path)).toHaveLength(
    1,
  );
});
