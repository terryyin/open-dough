// Story A waits on Done stories the page cannot reach yet: one outside the
// retained window, one never listed, and the far one while the Done catalog is
// held, fails or omits it. Each reads as its own state, story retry waits out
// the announced recovery, and an Inspect chosen meanwhile stays when the
// catalog heals.

import type { Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  columnCountOf,
  parts,
  shortRevision,
} from "../../tests/dashboardParts.ts";
import { expectEntries, shownEntries } from "../../tests/recentlyDoneColumn.ts";
import { inspectionToggle, storyCard } from "../../tests/storyCardControls.ts";
import { storyDetail } from "../../tests/storyCardSelection.ts";
import {
  dependencySummary,
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
  retryReference,
  storyReference,
} from "../../tests/storyReference.ts";
import { passTimeUntilChecked } from "../../tests/autoRefreshJourney.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { passTimeToRecovery } from "../../tests/transientRecoveryPage.ts";
import { untilPageRequestsAnswered } from "../../tests/pageRequestNotes.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import {
  controlFrontendAuthenticatedRead,
  countAuthenticatedReads,
  isRevisionCheck,
} from "../../tests/support/frontendAuthenticatedReadControl.ts";
import {
  donePathsWithSuppliersThrough,
  doneTitlesThrough,
  expiredDone,
  farDone,
  putFrontendDoneReferences,
  putHealedFrontendDoneReferences,
  unlisted,
} from "../../tests/support/frontendDoneReferences.ts";
import {
  eachRecordOnce,
  recordDoneRecordsAsked,
} from "../../tests/support/frontendDoneBodyReads.ts";
import { preholdRevisionStreamSlots } from "../../tests/support/revisionStreamSlots.ts";

test.use({ hasTouch: true });

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

const isCatalog = (params: URLSearchParams) => params.get("done") === "catalog";

test("expired and unlisted references remain unavailable without fabricated blocks or history reads", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const recordsAsked = recordDoneRecordsAsked(page);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await expect(storyReference(consumer, expiredDone.title)).toBeVisible();
  await untilPageRequestsAnswered(page);
  // The expired story's record names it; the unlisted one has only its identity.
  for (const [entry, label] of [
    [expiredDone, expiredDone.title],
    [unlisted, unlisted.identity],
  ] as const) {
    const reads = countAuthenticatedReads(
      page,
      (params) => !isRevisionCheck(params),
    );
    await followReference(consumer, label);
    await expect(referenceNotice(page)).toContainText(
      `${entry.identity} is unavailable in Open Dough's dashboard`,
    );
    await expect(doneDestination(recent, entry.identity)).toHaveCount(0);
    await untilPageRequestsAnswered(page);
    expect(reads(), `${entry.identity} asks no read`).toBe(0);
  }
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(10),
  );
  await inspectionToggle(consumer).click();
  await expect(storyDetail(consumer)).toBeVisible();
});

test("Done catalog loading and failure stay distinct from absence and story retry reaches the recovered catalog", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const catalog = await controlFrontendAuthenticatedRead(page, isCatalog);
  catalog.unreachable();
  // Every catalog ask waits, then fails once released.
  const held = await holdAuthenticatedReadsWhere(page, isCatalog, releases);
  const recordsAsked = recordDoneRecordsAsked(page);
  await pausePageClockAt(page, new Date());
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  const consumer = storyCard(backlog, "Story A");
  await expect(dependencySummary(consumer)).toBeVisible();
  await openDependencies(consumer);
  await followReference(consumer, farDone.identity);
  const notice = referenceNotice(page);
  await expect(notice).toContainText(
    `Reading Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  expect(recordsAsked()).toEqual([]);
  held.release();
  await expect(notice).toContainText(
    `Could not read Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  await expect(recent).toContainText("Done stories could not be read.");
  catalog.pass();
  await retryReference(page);
  // The existing published-observation owner retains its announced recovery
  // wait; story navigation neither resets nor bypasses that read policy.
  await expect(parts(page).problem).toContainText(
    "Reading unanswered detail again",
  );
  await passTimeToRecovery(page);
  const destination = storyCard(recent, farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(notice).toBeEmpty();
  expect(eachRecordOnce(recordsAsked())).toEqual(
    donePathsWithSuppliersThrough(27),
  );
});

// Story A's far reference reads `reads`; the Inspect chosen next takes focus
// and clears the notice.
async function inspectAfterFarReference(page: Page, reads: string) {
  await pausePageClockAt(page, new Date());
  // With both stream slots held elsewhere, the page checks on its own clock.
  await preholdRevisionStreamSlots(page);
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, farDone.identity);
  const notice = referenceNotice(page);
  await expect(notice).toContainText(reads);
  const ownChoice = inspectionToggle(consumer);
  await ownChoice.click();
  await expect(ownChoice).toBeFocused();
  await expect(notice).toBeEmpty();
  return { consumer, recent, notice, ownChoice };
}

// The healed catalog lists every retained Done story, ten shown and the far
// one not revealed, while the chosen inspection keeps its detail and focus.
async function expectInspectionKeptOverHealedCatalog({
  consumer,
  recent,
  notice,
  ownChoice,
}: Awaited<ReturnType<typeof inspectAfterFarReference>>) {
  await expect(columnCountOf(recent)).toHaveText("35 entries");
  await expect(shownEntries(recent)).toHaveCount(10);
  await expect(doneDestination(recent, farDone.identity)).toHaveCount(0);
  await expect(storyDetail(consumer)).toBeVisible();
  await expect(ownChoice).toBeFocused();
  await expect(notice).toBeEmpty();
}

test("a later inspection supersedes a unavailable Done reference when its catalog subsequently heals", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices, { omitDestination: true });
  const inspected = await inspectAfterFarReference(
    page,
    `${farDone.identity} is unavailable`,
  );
  const healed = putHealedFrontendDoneReferences(frontendServices);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(shortRevision(healed));
  await expectInspectionKeptOverHealedCatalog(inspected);
});

test("a later inspection supersedes a failed Done reference when its catalog subsequently heals", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneReferences(frontendServices);
  const catalog = await controlFrontendAuthenticatedRead(page, isCatalog);
  catalog.unreachable();
  const inspected = await inspectAfterFarReference(
    page,
    "Could not read Open Dough",
  );
  catalog.pass();
  await expect(parts(page).problem).toContainText(
    "Reading unanswered detail again",
  );
  await passTimeToRecovery(page);
  await expectInspectionKeptOverHealedCatalog(inspected);
});
