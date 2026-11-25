// A refresh of the same project keeps Recently done's requested range: the
// newly published list shows in its current order, as many entries as were
// asked for, and more only to keep the entry holding the keyboard, or a
// journey's destination still being read, shown. Only the records the shown
// entries newly need are read, at the new revision; an unchanged record is
// not read again. When the entry holding the keyboard is gone, the keyboard
// goes to the entry in its place, and a shorter Board keeps the scroll within
// it. What a refresh and other moves keep or start again:
// ./recently-done-progressive-reset.spec.ts; what it asks again after a
// failed read: ./recently-done-progressive-failed-read-refresh.spec.ts.
// Publications and refreshes: ../recentlyDoneRefresh.ts; the `gh` calls
// reaching the fake GitHub show which records were read, and at which
// revision.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  bottomOf,
  rem,
  scrollYOf,
  wheelToBoardEnd,
} from "../../dashboard/test-support/boardPage.ts";
import {
  expectEntries,
  revealAction,
  shownEntries,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  entryName,
  progressiveStories,
  repository,
  type ProgressiveEntry,
} from "../../dashboard/test-support/recentlyDoneProgressive.ts";
import {
  opened,
  recordsAsked,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  destination,
  entries as sessionEntries,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";
import {
  laterStory,
  namesOf,
  newest,
  pathOf,
  recordsAskedAt,
  refreshedTo,
  retitled,
} from "../../dashboard/test-support/recentlyDoneRefresh.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

test.use({ projectFolders: ["open-dough"] });

const entries = progressiveStories(35);
const newer = laterStory(0.5, "01", "Finish a newer progressive story");

test("a refresh keeps twenty entries in their current order, reading only the new and changed records shown; the entry holding the keyboard stays shown, and once gone the keyboard and scroll stay useful", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const atB = [
    newest,
    ...entries
      .filter(({ place }) => place !== 9)
      .map((entry) => (entry.place === 5 ? retitled(entry) : entry)),
  ];
  const atC = [newer, ...atB];
  const atD = atC.filter(({ place }) => place !== 20);
  const atE = atD.slice(0, 17);
  const firstTwentyPaths = entries.slice(0, 20).map(({ path }) => path);
  const retitledStory = atB.find(({ place }) => place === 5);
  const focusedStory = entries[19];
  const nextStory = entries[20];
  if (!retitledStory || !focusedStory || !nextStory) {
    throw new Error("Missing a published story used by the refresh.");
  }
  const view = await opened(page, dashboard, entries, {
    history: { afterGitHubStops, later: { B: atB, C: atC, D: atD, E: atE } },
  });
  const { github, recent, main } = view;
  if (main === undefined) throw new Error("No progressive publication history");
  const routedTrunk = () =>
    remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routedTrunk()).toBe(main.firstRevision);
  const card = (entry: ProgressiveEntry) =>
    recent.getByRole("article", { name: entryName(entry) });
  await revealAction(recent).click();
  await expectEntries(recent, namesOf(entries, 20));
  await expect(revealAction(recent)).toBeFocused();
  expect(recordsAsked(github).toSorted()).toEqual(firstTwentyPaths.toSorted());

  await test.step("a newer first entry, a changed record, and a removed one: twenty still show in current order, the keyboard stays on the reveal action, and only the new and the changed record are read, at the new revision", async () => {
    const revisionB = main.publish("B");
    expect(await routedTrunk()).toBe(revisionB);
    await refreshedTo(page, revisionB);
    await expectEntries(recent, namesOf(atB, 20));
    await expect(recent).toContainText("Showing 20 of 35 entries.");
    await expect(revealAction(recent)).toBeFocused();
    expect(recordsAskedAt(github, revisionB).toSorted()).toEqual(
      [newest.path, pathOf(retitledStory)].toSorted(),
    );
    expect(recordsAsked(github)).toHaveLength(firstTwentyPaths.length + 2);
  });

  await test.step("the entry holding the keyboard stays shown as the 21st once a newer entry precedes it", async () => {
    await card(focusedStory).focus();
    const revisionC = main.publish("C");
    expect(await routedTrunk()).toBe(revisionC);
    await refreshedTo(page, revisionC);
    await expectEntries(recent, namesOf(atC, 21));
    await expect(card(focusedStory)).toBeFocused();
    await expect(recent).toContainText("Showing 21 of 36 entries.");
    expect(recordsAskedAt(github, revisionC)).toEqual([newer.path]);
  });

  await test.step("once it is removed, the keyboard goes to the entry in its place, whose record alone is read", async () => {
    const revisionD = main.publish("D");
    expect(await routedTrunk()).toBe(revisionD);
    await refreshedTo(page, revisionD);
    await expectEntries(recent, namesOf(atD, 21));
    await expect(card(nextStory)).toBeFocused();
    expect(recordsAskedAt(github, revisionD)).toEqual([nextStory.path]);
  });

  await test.step("with the Board scrolled to its end, a shorter list keeps the scroll within the Board, and the keyboard on the last entry", async () => {
    await wheelToBoardEnd(page);
    const before = await scrollYOf(page);
    const revisionE = main.publish("E");
    expect(await routedTrunk()).toBe(revisionE);
    await refreshedTo(page, revisionE);
    await expectEntries(recent, namesOf(atE, atE.length));
    await expect(recent).toContainText("All 17 entries are shown.");
    await expect(shownEntries(recent).last()).toBeFocused();
    await untilPageRests(page);
    const scrolled = await scrollYOf(page);
    expect(scrolled).toBeLessThan(before);
    expect(scrolled).toBeLessThanOrEqual(await bottomOf(page));
    expect(recordsAskedAt(github, revisionE)).toEqual([]);
  });
});

test("a refresh while Mark as done's destination is read keeps it included in its new place, and lands on it once the entries before it are read", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const view = await openedWithHeldStory(page, dashboard, {
    history: { afterGitHubStops, later: { B: [newest, ...sessionEntries] } },
  });
  const { github, recent, main } = view;
  if (main === undefined) throw new Error("No progressive publication history");
  await view.markedDone(destination);
  await expect(view.done(destination)).toBeVisible();
  await expect(shownEntries(recent)).toHaveCount(destination);

  const revisionB = main.publish("B");
  await refreshedTo(page, revisionB);
  await expect(shownEntries(recent)).toHaveCount(destination + 1);
  await expect(view.done(destination)).toBeVisible();
  await expect(view.done(destination)).not.toBeFocused();
  view.release();
  await expect(view.done(destination)).toBeFocused();
  await expect(view.done(destination)).toBeInViewport();
  await expectEntries(recent, [entryName(newest), ...names(destination)]);
  await expect(recent).toContainText("Showing 28 of 36 entries.");
  const allowed = new Set([...storiesThrough(destination), newest.path]);
  expect(recordsAsked(github).filter((path) => !allowed.has(path))).toEqual([]);
});
