// Show latest 10: with more than ten entries shown, the action beside
// Recently done's heading shows only the latest ten again, reading nothing,
// brings the heading into view, and leaves the keyboard at the start of
// Recently done, while an open terminal stays as it was. A held older read
// -- a revealed batch, or a journey's destination -- answering afterwards
// neither extends the list again nor scrolls, and the reveal action and a
// fresh journey onto entry 27 still extend it. Publication, sessions, and the
// held record: ./recentlyDoneProgressiveJourney.ts; the Running Cursor
// sessions row is ./recently-done-progressive-navigation-cursor.spec.ts's.
// The `gh` calls reaching the fake GitHub show which records were read.

import type { Locator, Page } from "@playwright/test";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { standaloneSessionName } from "./dashboardPage.ts";
import { rem, showColumn } from "./dashboardColumnsPage.ts";
import { placedAt } from "./recentlyDoneProgressive.ts";
import { expectEntries, shownEntries } from "./recentlyDoneColumn.ts";
import {
  recordsAsked,
  revealAction,
  settle,
  terminalOf,
} from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import { recordReveals, revealsOf } from "./sessionNavigationJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";

test.use({ projectFolders: ["open-dough"], cursorScreen: "working" });

const showLatest = (recent: Locator) =>
  recent.getByRole("button", { name: "Show latest 10" });

const heading = (recent: Locator) =>
  recent.getByRole("heading", { name: "Recently done" });

// Shows only the latest ten of `total` from the keyboard: ten entries, the
// heading in view, the keyboard at the start of Recently done.
async function collapsedFromKeyboard(
  page: Page,
  recent: Locator,
  total: number,
) {
  await showLatest(recent).focus();
  await page.keyboard.press("Enter");
  await expect(shownEntries(recent)).toHaveCount(10);
  await expect(heading(recent)).toBeInViewport();
  await expect(recent).toBeFocused();
  await expect(showLatest(recent)).toHaveCount(0);
  await expect(recent).toContainText(`Showing 10 of ${String(total)} entries.`);
  await expectEntries(recent, names(10));
}

test("Show latest 10 during a held reveal keeps the terminal open, and the late answer neither extends the list nor scrolls; a fresh reveal and Mark as done on entry 27 extend it again", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithHeldStory(page, dashboard, {
    open: [destination],
  });
  const { github, recent } = view;
  const terminal = terminalOf(page);
  await expect(revealAction(recent)).toHaveText("Show 10 of 24 older entries");
  await expect(showLatest(recent)).toHaveCount(0);

  await view
    .taken(destination)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await showColumn(page, "Recently done");

  await test.step("two reveals ask for entries 11 to 30, holding one record, and Show latest 10 is offered beside the heading", async () => {
    await revealAction(recent).click();
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 14 older entries",
    );
    await revealAction(recent).click();
    await expect(view.heldCard).toContainText("Reading done story…");
    await expect(revealAction(recent)).toHaveText("Reading done stories…");
    await expect(showLatest(recent)).toBeVisible();
    // Entries 21 to 30 are places 21 to 31, the open 27th not among them.
    await expect
      .poll(() => recordsAsked(github).toSorted())
      .toEqual(storiesThrough(31).toSorted());
  });
  const asked = recordsAsked(github).length;

  await test.step("from the keyboard, Show latest 10 shows the first ten with the heading in view, reading nothing, the terminal still open", async () => {
    await collapsedFromKeyboard(page, recent, 34);
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 24 older entries",
    );
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    await expect(view.taken(destination)).toHaveCount(1);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("the held record answering afterwards neither extends the list nor scrolls", async () => {
    await settle(page);
    const scrolled = await page.evaluate(() => window.scrollY);
    view.release();
    await settle(page);
    await expectEntries(recent, names(10));
    await expect(recent).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
    expect(recordsAsked(github)).toHaveLength(asked);
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  });

  await test.step("a fresh reveal shows twenty, reusing what was read", async () => {
    await revealAction(recent).click();
    await expectEntries(recent, names(20));
    await settle(page);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("Mark as done on entry 27's Taken entry extends the list through it and lands on it", async () => {
    await showColumn(page, "Taken");
    await view.markedDone(destination);
    await expect(terminal).toHaveCount(0);
    await expect(view.done(destination)).toBeFocused();
    await expect(view.done(destination)).toBeInViewport();
    await expectEntries(recent, names(destination));
    expect(recordsAsked(github)).toHaveLength(asked);
  });
});

test("Show latest 10 while a Running Cursor sessions row's done entry 27 is still read supersedes the journey; once read nothing reveals it, and choosing the row again does", async ({
  page,
  dashboard,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const instruction = "hold this done session";
  const entryName = standaloneSessionName("Ad hoc", instruction);
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  // The terminal never connects, so the session stays done.
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  await recordReveals(page);
  const view = await openedWithHeldStory(page, dashboard, {
    open: [],
    elsewhere: true,
    also: (now) => [
      {
        ...held,
        launchedAt: placedAt(now, destination),
        doneAt: new Date(now - 10 * 60_000).toISOString(),
      },
    ],
  });
  const { github, recent } = view;
  const entry = recent.getByRole("article", { name: entryName });
  const terminal = terminalOf(page);
  const { sidebar, button } = sidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  const row = region.getByRole("button", { name: /Open Dough/ });
  const choose = async () => {
    if (!(await sidebar.isVisible())) await button.click();
    if ((await row.count()) === 0) {
      await region
        .getByRole("button", { name: "Running Cursor sessions" })
        .click();
    }
    await row.click();
  };

  await choose();
  await expect(terminal).toHaveCount(1);
  await expect(view.heldCard).toContainText("Reading done story…");
  await expect(shownEntries(recent)).toHaveCount(destination);
  await expect
    .poll(() => recordsAsked(github).toSorted())
    .toEqual(storiesThrough(destination).toSorted());
  if (await sidebar.isVisible()) await button.click();

  await test.step("from the keyboard, Show latest 10 shows the first ten with the heading in view, reading nothing, the terminal still open", async () => {
    await collapsedFromKeyboard(page, recent, 35);
    await expect(terminal).toHaveCount(1);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(destination).toSorted(),
    );
  });

  await test.step("the held record answering afterwards neither extends the list nor brings the entry into view", async () => {
    await settle(page);
    const before = (await revealsOf(page)).length;
    const scrolled = await page.evaluate(() => window.scrollY);
    view.release();
    await settle(page);
    await expectEntries(recent, names(10));
    await expect(entry).toHaveCount(0);
    await expect(recent).toBeFocused();
    expect((await revealsOf(page)).slice(before)).toEqual([]);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
    expect(recordsAsked(github)).toHaveLength(
      storiesThrough(destination).length,
    );
    await expect(terminal).toHaveCount(1);
  });

  await test.step("choosing the row again extends the list through entry 27 and brings it into view, reusing what was read", async () => {
    await choose();
    await expect(entry).toBeInViewport();
    await expect(shownEntries(recent)).toHaveCount(destination);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(destination).toSorted(),
    );
  });
});
