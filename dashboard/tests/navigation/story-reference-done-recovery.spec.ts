import { expect, githubFor, pausePageClockAt } from "../dashboardTest.ts";
import { test } from "../storyDependencyFixture.ts";
import { columnCountOf, shortRevision, parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { expectEntries, shownEntries } from "../recentlyDoneColumn.ts";
import {
  recordsAsked,
  untilPageRests,
} from "../recentlyDoneProgressivePage.ts";
import { noConnection } from "../originAnswers.ts";
import { passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { passTimeToRecovery } from "../transientRecoveryPage.ts";
import { storyCard } from "../storyCardControls.ts";
import {
  dependencySummary,
  doneDestination,
  followReference,
  openDependencies,
  referenceNotice,
  retryReference,
  storyReference,
} from "../storyReference.ts";
import {
  donePathsWithSuppliersThrough,
  doneTitlesThrough,
  farDone,
  expiredDone,
  unlisted,
  publishDoneReferences,
  serveDoneReferences,
} from "../storyReferenceDone.ts";

test.use({ hasTouch: true });

test("expired and unlisted references remain unavailable without fabricated blocks or history reads", async ({
  page,
  origin,
}) => {
  await serveDoneReferences(page, origin);
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  await expect(storyReference(consumer, expiredDone.title)).toBeVisible();
  const before = githubFor(page).calls.length;
  for (const entry of [expiredDone, unlisted]) {
    await followReference(
      consumer,
      entry === expiredDone ? entry.title : entry.identity,
    );
    await expect(referenceNotice(page)).toContainText(
      `${entry.identity} is unavailable in Open Dough's dashboard`,
    );
    await expect(doneDestination(recent, entry.identity)).toHaveCount(0);
  }
  await untilPageRests(page);
  expect(githubFor(page).calls.slice(before)).toEqual([]);
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsWithSuppliersThrough(10).toSorted(),
  );
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
});

test("Done catalog loading and failure stay distinct from absence and story retry reaches the recovered catalog", async ({
  page,
  origin,
}) => {
  const published = await serveDoneReferences(page, origin);
  const catalog = ".planning/done/.catalog.json";
  const release = published.hold(catalog);
  const restore = published.answerWith(catalog, noConnection);
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
  expect(recordsAsked(githubFor(page))).toEqual([]);
  release();
  await expect(notice).toContainText(
    `Could not read Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  await expect(recent).toContainText("Done stories could not be read.");
  restore();
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
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsWithSuppliersThrough(27).toSorted(),
  );
});

for (const observation of ["unavailable", "failed"] as const) {
  test(`a later inspection supersedes a ${observation} Done reference when its catalog subsequently heals`, async ({
    page,
    origin,
  }) => {
    const published = await serveDoneReferences(page, origin, {
      omitDestination: observation === "unavailable",
      follows: true,
    });
    const restore =
      observation === "failed"
        ? published.answerWith(".planning/done/.catalog.json", noConnection)
        : () => undefined;
    await pausePageClockAt(page, new Date());
    await openUntilRead(page);
    const { backlog, recentlyDone: recent } = parts(page);
    const consumer = storyCard(backlog, "Story A");
    await openDependencies(consumer);
    await followReference(consumer, farDone.identity);
    const notice = referenceNotice(page);
    await expect(notice).toContainText(
      observation === "failed"
        ? "Could not read Open Dough"
        : `${farDone.identity} is unavailable`,
    );
    await consumer.getByRole("button", { name: "Inspect story" }).click();
    const ownChoice = consumer.getByRole("button", { name: "Hide detail" });
    await expect(ownChoice).toBeFocused();
    await expect(notice).toBeEmpty();
    if (observation === "failed") {
      restore();
      await expect(parts(page).problem).toContainText(
        "Reading unanswered detail again",
      );
      await passTimeToRecovery(page);
    } else {
      const healed = await publishDoneReferences(origin);
      await passTimeUntilChecked(page);
      await expect(parts(page).readRevision).toContainText(
        shortRevision(healed),
      );
    }
    await expect(columnCountOf(recent)).toHaveText("35 entries");
    await expect(shownEntries(recent)).toHaveCount(10);
    await expect(doneDestination(recent, farDone.identity)).toHaveCount(0);
    await expect(
      consumer.getByRole("region", { name: "Detail for Story A" }),
    ).toBeVisible();
    await expect(ownChoice).toBeFocused();
    await expect(notice).toBeEmpty();
  });
}
