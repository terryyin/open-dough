// A refresh of the same project keeps Recently done's requested range: the
// newly published list shows in its current order, as many entries as were
// asked for, and more only to keep the entry holding the keyboard, or a
// journey's destination still being read, shown. Only the records the shown
// entries newly need are read, at the new revision; an unchanged record is
// not read again. When the entry holding the keyboard is gone, the keyboard
// goes to the entry in its place, and a shorter page keeps the scroll within
// it. What a refresh and other moves keep or start again:
// ./recently-done-progressive-reset.spec.ts; what it asks again after a
// failed read: ./recently-done-progressive-failed-read-refresh.spec.ts.
// Publications and refreshes: ./recentlyDoneRefresh.ts; the `gh` calls
// reaching the fake GitHub show which records were read, and at which
// revision.

import { expect, test } from "./dashboardTest.ts";
import { rem } from "./dashboardColumnsPage.ts";
import { expectEntries, shownEntries } from "./recentlyDoneColumn.ts";
import { entryName, type ProgressiveEntry } from "./recentlyDoneProgressive.ts";
import {
  opened,
  recordsAsked,
  revealAction,
  settle,
} from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  entries,
  entryAt,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import {
  laterStory,
  movingMain,
  namesOf,
  newest,
  pathOf,
  recordsAskedAt,
  refreshedTo,
  retitled,
} from "./recentlyDoneRefresh.ts";

test.use({ projectFolders: ["open-dough"] });

const newer = laterStory(0.5, "01", "Finish a newer progressive story");

test("a refresh keeps twenty entries in their current order, reading only the new and changed records shown; the entry holding the keyboard stays shown, and once gone the keyboard and scroll stay useful", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const main = movingMain();
  const view = await opened(page, dashboard, entries, {
    answering: main.answering,
  });
  const { github, recent, now } = view;
  const card = (entry: ProgressiveEntry) =>
    recent.getByRole("article", { name: entryName(entry) });
  await revealAction(recent).click();
  await expectEntries(recent, names(20));
  await expect(revealAction(recent)).toBeFocused();
  expect(recordsAsked(github).toSorted()).toEqual(
    storiesThrough(20).toSorted(),
  );

  const atB = [
    newest,
    ...entries
      .filter(({ place }) => place !== 9)
      .map((entry) => (entry.place === 5 ? retitled(entry) : entry)),
  ];
  await test.step("a newer first entry, a changed record, and a removed one: twenty still show in current order, the keyboard stays on the reveal action, and only the new and the changed record are read, at the new revision", async () => {
    const revisionB = main.publish(now, atB);
    await refreshedTo(page, revisionB);
    await expectEntries(recent, namesOf(atB, 20));
    await expect(recent).toContainText("Showing 20 of 35 entries.");
    await expect(revealAction(recent)).toBeFocused();
    expect(recordsAskedAt(github, revisionB).toSorted()).toEqual(
      [newest.path, pathOf(entryAt(5))].toSorted(),
    );
    expect(recordsAsked(github)).toHaveLength(storiesThrough(20).length + 2);
  });

  const atC = [newer, ...atB];
  await test.step("the entry holding the keyboard stays shown as the 21st once a newer entry precedes it", async () => {
    await card(entryAt(20)).focus();
    const revisionC = main.publish(now, atC);
    await refreshedTo(page, revisionC);
    await expectEntries(recent, namesOf(atC, 21));
    await expect(card(entryAt(20))).toBeFocused();
    await expect(recent).toContainText("Showing 21 of 36 entries.");
    expect(recordsAskedAt(github, revisionC)).toEqual([newer.path]);
  });

  const atD = atC.filter(({ place }) => place !== 20);
  await test.step("once it is removed, the keyboard goes to the entry in its place, whose record alone is read", async () => {
    const revisionD = main.publish(now, atD);
    await refreshedTo(page, revisionD);
    await expectEntries(recent, namesOf(atD, 21));
    await expect(card(entryAt(21))).toBeFocused();
    expect(recordsAskedAt(github, revisionD)).toEqual([pathOf(entryAt(21))]);
  });

  // Every story after the tenth expires; this machine's sessions stay.
  const atE = atD.filter(
    ({ place, kind }) => place <= 10 || kind === "session",
  );
  await test.step("with the page scrolled to its end, a shorter list keeps the scroll within the page, and the keyboard on the last entry", async () => {
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await settle(page);
    const before = await page.evaluate(() => window.scrollY);
    const revisionE = main.publish(now, atE);
    await refreshedTo(page, revisionE);
    await expectEntries(recent, namesOf(atE, atE.length));
    await expect(recent).toContainText("All 17 entries are shown.");
    await expect(shownEntries(recent).last()).toBeFocused();
    await settle(page);
    const { scrolled, end } = await page.evaluate(() => ({
      scrolled: window.scrollY,
      end: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(scrolled).toBeLessThan(before);
    expect(scrolled).toBeLessThanOrEqual(end);
    expect(recordsAskedAt(github, revisionE)).toEqual([]);
  });
});

test("a refresh while Mark as done's destination is read keeps it included in its new place, and lands on it once the entries before it are read", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const main = movingMain();
  const view = await openedWithHeldStory(page, dashboard, {
    moving: main.answering,
  });
  const { github, recent, now } = view;
  await view.markedDone(destination);
  await expect(view.done(destination)).toBeVisible();
  await expect(shownEntries(recent)).toHaveCount(destination);

  const revisionB = main.publish(now, [newest, ...entries]);
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
