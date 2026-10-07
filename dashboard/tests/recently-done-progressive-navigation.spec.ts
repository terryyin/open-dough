// A journey that lands on a done entry beyond Recently done's shown entries
// extends the list exactly through that entry, reading only the records of
// the stories before it; the entry shows in its place at once, and the
// keyboard, or a sidebar choice's reveal, reaches it once the entries before
// it are read, by the page's usual return and reveal rules. A longer list is
// kept, a destination already shown or not in Recently done reads nothing
// more, and the developer's own move or another project meanwhile keeps the
// keyboard where they put it. The journeys are Mark as done on a Taken
// entry, in its terminal, and on the entry while its terminal shows; a
// Running Cursor sessions row is ./recently-done-progressive-navigation-cursor.spec.ts.
// Publication, sessions, and held record: ./recentlyDoneProgressiveJourney.ts.
// The synthetic `claude` takes the done marks (./fixtures/fake-claude); the
// `gh` calls reaching the fake GitHub show which records were read.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { rem, showColumn } from "./dashboardColumnsPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import {
  recordsAsked,
  revealAction,
  settle,
} from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  expectThroughDestination,
  expectThroughDestinationPending,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";

test.use({ projectFolders: ["open-dough", "pygardon"] });

const terminalOf = (page: Parameters<typeof parts>[0]) =>
  page.getByRole("region", { name: "Terminal" });

test("Mark as done on a Taken entry lands on it as entry 27 once entries 1 to 27 are read, after a choice of it while open and a done entry already shown read nothing more", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithHeldStory(page, dashboard, {
    open: [2, destination],
  });
  const { github, recent } = view;

  await test.step("choosing the open session in the Sessions sidebar reveals its Taken entry, which Recently done does not hold, reading no older record", async () => {
    const { button, entry } = sidebarParts(page);
    await button.click();
    await entry("Ad hoc work 27").click();
    await expect(terminalOf(page)).toHaveCount(1);
    await expect(view.taken(destination)).toBeInViewport();
    await terminalOf(page).getByRole("button", { name: "Close" }).click();
    await expect(terminalOf(page)).toHaveCount(0);
    await button.click();
    await expect
      .poll(() => recordsAsked(github).toSorted())
      .toEqual(storiesThrough(11).toSorted());
  });

  await test.step("a session that lands among the first ten takes the keyboard there, reading nothing more", async () => {
    await view.markedDone(2);
    await expect(view.done(2)).toBeFocused();
    await expectEntries(recent, names(10));
    await settle(page);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(11).toSorted(),
    );
  });

  await test.step("Mark as done on entry 27's Taken entry shows it in place at once, asking for exactly the records before it, and gives it the keyboard only once the held one is read", async () => {
    await view.markedDone(destination);
    await expectThroughDestinationPending(
      github,
      recent,
      view.heldCard,
      view.done(destination),
    );
    view.release();
    await expect(view.done(destination)).toBeFocused();
    await expect(view.done(destination)).toBeInViewport();
    await expectThroughDestination(github, recent);
    await expect(revealAction(recent)).toHaveText("Show the 8 older entries");
  });

  await test.step("with every entry shown, reopening it and marking it done in its terminal again lands on it, keeping the longer list and reading nothing again", async () => {
    await revealAction(recent).click();
    await expectEntries(recent, names(35));
    const asked = recordsAsked(github).length;
    await view
      .done(destination)
      .getByRole("button", { name: "Open terminal" })
      .click();
    const terminal = terminalOf(page);
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    await expect(view.taken(destination)).toHaveCount(1);
    await view.markedDone(destination, terminal);
    await expect(terminal).toHaveCount(0);
    await expect(view.done(destination)).toBeFocused();
    await expectEntries(recent, names(35));
    expect(recordsAsked(github)).toHaveLength(asked);
  });
});

test("Mark as done in its terminal closes the panel and lands on entry 27 once entries 1 to 27 are read", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithHeldStory(page, dashboard);
  const terminal = terminalOf(page);
  await view
    .taken(destination)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await view.markedDone(destination, terminal);
  await expect(terminal).toHaveCount(0);
  await expectThroughDestinationPending(
    view.github,
    view.recent,
    view.heldCard,
    view.done(destination),
  );
  view.release();
  await expect(view.done(destination)).toBeFocused();
  await expect(view.done(destination)).toBeInViewport();
  await expectThroughDestination(view.github, view.recent);
});

test("marking the session done on its Taken entry while its terminal shows closes the terminal and, with Recently done paged out of view, lands on entry 27 there", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 40 * rem, height: 800 });
  const view = await openedWithHeldStory(page, dashboard);
  const terminal = terminalOf(page);
  await showColumn(page, "Taken");
  await view
    .taken(destination)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await expect(view.recent).not.toBeInViewport();
  await view.markedDone(destination);
  await expect(terminal).toHaveCount(0);
  await expectThroughDestinationPending(
    view.github,
    view.recent,
    view.heldCard,
    view.done(destination),
  );
  view.release();
  await expect(view.done(destination)).toBeFocused();
  await expect(view.done(destination)).toBeInViewport();
  await expectThroughDestination(view.github, view.recent);
});

test("the developer's own move before the entries before it are read keeps the keyboard where it went", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithHeldStory(page, dashboard);
  await view.markedDone(destination);
  await expect(view.done(destination)).toBeVisible();
  const card = parts(page).backlog.getByRole("article").first();
  await card.click();
  await expect(card).toBeFocused();
  view.release();
  await expectEntries(view.recent, names(destination));
  await settle(page);
  await expect(card).toBeFocused();
});

test("choosing another project before the entries before it are read shows that project, which nothing pulls back, and Open Dough starts again at ten", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(
    "e6".repeat(20),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
  );
  const view = await openedWithHeldStory(page, dashboard);
  const { project, backlog } = parts(page);
  await view.markedDone(destination);
  await expect(view.done(destination)).toBeVisible();
  const pygardonChoice = project.getByRole("radio", { name: "Pygardon" });
  await pygardonChoice.check();
  await expect(backlog).toContainText("A Pygardon story");
  view.release();
  await settle(page);
  await expect(pygardonChoice).toBeFocused();
  await project.getByRole("radio", { name: "Open Dough", exact: true }).check();
  await expectEntries(view.recent, names(10));
  expect(recordsAsked(view.github).toSorted()).toEqual(
    storiesThrough(destination).toSorted(),
  );
});
