// Progressive range in Recently done sessions: scroll reveals older Done
// entries in batches of 20 without losing earlier ones; refresh reconciles by
// identity and completion order; reload starts at 20 again. Board isolation
// of detail reads lives in recently-done-sessions-sidebar-paging-board.spec.ts.
import {
  agentLaunchEndpoint,
  recentlyDoneSessionsInitialLimit,
  type LaunchRecord,
} from "../../src/agentLaunch.ts";
import {
  expectProjectChoice,
  chooseProject,
  standaloneSessionName,
  parts,
} from "../dashboardPage.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { terminalPanel } from "../terminalScreenPage.ts";
import {
  byProjectOf,
  fortyFiveDoneSessions,
  preferShortRecentlyDoneBody,
  revealRecentlyDoneThrough,
} from "../recentlyDoneSessionsSidebarPaging.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expectRecentlyDone,
  recentlyDoneHeightKey,
  showRecentlyDone,
  showThreeProjectPage,
} from "../recentlyDoneSessionsSidebarPage.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import { wheelToEnd } from "../runningCursorSessionsPage.ts";
import { holdSessionReads, watchRecordReads } from "../sessionStatePace.ts";
import {
  expectSessionsSidebar,
  openSessionsSidebar,
} from "../sessionsSidebarPage.ts";
import { expect, test } from "../support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("scrolling Recently done reaches all 45 retained sessions and refresh keeps the reached older range", async ({
  page,
  dashboard,
  origin,
}) => {
  const opened = new Date("2026-10-28T12:00:00.000Z");
  await pausePageClockAt(page, opened);
  const { passOnePace } = await watchRecordReads(page);
  const now = opened.getTime();
  const { titles, byProject, records } = fortyFiveDoneSessions(now);
  await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  keepLaunchStore(dashboard, byProject);
  await showThreeProjectPage(page, origin);
  const shown = await showRecentlyDone(page);
  const titlesOf = () => shown.titles.allTextContents();

  await test.step("first expansion shows the newest 20 only", async () => {
    await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
    expect(await titlesOf()).toEqual(
      titles.slice(0, recentlyDoneSessionsInitialLimit),
    );
  });

  await test.step("equal completion times keep deterministic session-identity order", async () => {
    // Fixture: Done session 05 and 06 share one doneAt; doneSessionsOf breaks
    // the tie with sessionKey localeCompare (claude:done-05 before done-06).
    const tiedEarlier = records[4];
    const tiedLater = records[5];
    const title05 = titles[4];
    const title06 = titles[5];
    if (
      tiedEarlier === undefined ||
      tiedLater === undefined ||
      title05 === undefined ||
      title06 === undefined
    ) {
      throw new Error("Expected tied Done session 05 and 06 in the fixture");
    }
    expect(tiedEarlier.doneAt).toBe(tiedLater.doneAt);
    expect(tiedEarlier.session.sessionId).toBe("done-05");
    expect(tiedLater.session.sessionId).toBe("done-06");
    const shownTitles = await titlesOf();
    expect(shownTitles.indexOf(title05)).toBeLessThan(
      shownTitles.indexOf(title06),
    );
    expect(shownTitles.slice(4, 6)).toEqual([title05, title06]);
  });

  await test.step("scrolling this section reveals 40, then all 45; a further scroll is inert", async () => {
    await revealRecentlyDoneThrough(shown, 40);
    await expect(shown.entries).toHaveCount(40);
    expect(await titlesOf()).toEqual(titles.slice(0, 40));
    await revealRecentlyDoneThrough(shown, 45);
    await expect(shown.entries).toHaveCount(45);
    expect(await titlesOf()).toEqual([...titles]);
    await wheelToEnd(page, shown.body);
    await expect(shown.entries).toHaveCount(45);
    expect(await titlesOf()).toEqual([...titles]);
  });

  await test.step("scrolling the open list does not change Recently done's range", async () => {
    const before = await titlesOf();
    await wheelToEnd(page, shown.list);
    expect(await titlesOf()).toEqual(before);
  });

  await test.step("collapse, hide, and project change keep the reached range", async () => {
    await shown.header.click();
    await expectRecentlyDone(shown, "collapsed");
    await shown.header.click();
    await expect(shown.entries).toHaveCount(45);
    await shown.button.click();
    await expectSessionsSidebar(page, "closed");
    await shown.button.click();
    await expect(shown.entries).toHaveCount(45);
    await chooseProject(page, "Doughnut");
    await expect(parts(page).backlog).toContainText("A Doughnut story");
    await expect(shown.entries).toHaveCount(45);
    await chooseProject(page, "Pygardon");
    await expect(parts(page).backlog).toContainText("A Pygardon story");
  });

  // Index 40 → doughnut (sources cycle open-dough, doughnut, pygardon).
  const olderCrossProject = titles[40] ?? "";
  expect(olderCrossProject).not.toBe("");
  await test.step("choosing an older cross-project session selects it and brings its Board entry into view in its project", async () => {
    await shown.select(olderCrossProject).click();
    await expect(shown.select(olderCrossProject)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectProjectChoice(page, "Doughnut");
    await expect(
      parts(page).recentlyDone.getByRole("article", {
        name: standaloneSessionName("Ad hoc", olderCrossProject),
      }),
    ).toBeInViewport();
    await expect(terminalPanel(page)).toHaveCount(0);
    await expect(shown.entries).toHaveCount(45);
  });

  const removedTitle = titles[24] ?? "";
  const keptOlder = titles[39] ?? "";
  const oldestReached = titles[44] ?? "";
  expect(removedTitle).not.toBe("");
  expect(keptOlder).not.toBe("");
  expect(oldestReached).not.toBe("");
  await test.step("refresh admits a new completion and drops a removed identity without losing older reached entries", async () => {
    const newTitle = "Brand new completion";
    const newer: LaunchRecord = makeMe.aLaunchRecord
      .adHoc({ instruction: newTitle, title: newTitle, source: "doughnut" })
      .inClaudeSession({ sessionId: "done-new" })
      .launchedAt(new Date(now - 90_000).toISOString())
      .markedDoneAt(new Date(now - 30_000).toISOString())
      .please();
    const withoutRemoved = records.filter(
      (record) => record.request.title !== removedTitle,
    );
    await shown.select(removedTitle).focus();
    await expect(shown.select(removedTitle)).toBeFocused();
    keepLaunchStore(dashboard, byProjectOf([newer, ...withoutRemoved]));
    await passOnePace();

    const shownTitles = await titlesOf();
    expect(shownTitles[0]).toBe(newTitle);
    expect(shownTitles).not.toContain(removedTitle);
    expect(shownTitles).toContain(keptOlder);
    expect(shownTitles).toContain(oldestReached);
    expect(new Set(shownTitles).size).toBe(shownTitles.length);
    // New completion + former reached set minus removed.
    expect(shownTitles).toHaveLength(45);
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    await expect(shown.select(removedTitle)).toHaveCount(0);
    // Focus left the removed control for a nearby entry or the section header.
    await expect(focused).not.toHaveText(removedTitle);
  });

  await test.step("reload restores the initial newest-20 range", async () => {
    await page.reload();
    await chooseProject(page, "Pygardon");
    await openSessionsSidebar(page);
    await expectRecentlyDone(shown, "collapsed");
    await shown.header.click();
    await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  });
});

test("delayed first session read and a failed refresh keep existing read semantics", async ({
  page,
  dashboard,
  origin,
}) => {
  const opened = new Date("2026-10-28T12:00:00.000Z");
  await pausePageClockAt(page, opened);
  const { passOnePace } = await watchRecordReads(page);
  const { byProject, titles } = fortyFiveDoneSessions(opened.getTime());
  await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  const { answer } = await holdSessionReads(page);
  keepLaunchStore(dashboard, byProject);
  await showThreeProjectPage(page, origin);
  const shown = await showRecentlyDone(page);
  await expect(shown.body).toContainText("Reading sessions…");
  await expect(shown.entries).toHaveCount(0);
  answer();
  await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  expect(await shown.titles.allTextContents()).toEqual(
    titles.slice(0, recentlyDoneSessionsInitialLimit),
  );

  await revealRecentlyDoneThrough(shown, 40);
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      await (route.request().method() === "GET"
        ? route.abort("connectionrefused")
        : route.continue());
    },
  );
  keepLaunchStore(dashboard, {
    "open-dough": [],
    doughnut: [],
    pygardon: [],
  });
  await passOnePace();
  // Failed refresh invents no empty list; the reached range stays.
  await expect(shown.entries).toHaveCount(40);
  await expect(shown.body).not.toContainText("No sessions marked done");
});
