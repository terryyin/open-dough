// Progressive range in Recently done sessions: scroll reveals older Done
// entries in batches of 20 without losing earlier ones; refresh reconciles by
// identity and completion order; reload starts at 20 again. Board isolation
// of detail reads lives in recently-done-sessions-sidebar-paging-board.spec.ts.
import {
  agentLaunchEndpoint,
  recentlyDoneSessionsInitialLimit,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { standaloneSessionName, parts } from "./dashboardPage.ts";
import { pausePageClockAt } from "./dashboardTest.ts";
import {
  fortyFiveDoneSessions,
  preferShortRecentlyDoneBody,
  revealRecentlyDoneThrough,
} from "./recentlyDoneSessionsSidebarPaging.ts";
import {
  doneRecord,
  keepProjectLaunchRecords,
  recentlyDoneHeightKey,
  recentlyDoneParts,
  showThreeProjectPage,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { wheelToEnd } from "./runningCursorSessionsPage.ts";
import { holdSessionReads, watchRecordReads } from "./sessionStatePace.ts";
import { openSessionsSidebar } from "./sessionsSidebarPage.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("scrolling Recently done reaches all 45 retained sessions and refresh keeps the reached older range", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(180_000);
  const opened = new Date("2026-10-28T12:00:00.000Z");
  await pausePageClockAt(page, opened);
  const { passOnePace } = await watchRecordReads(page);
  const now = opened.getTime();
  const { titles, byProject, records } = fortyFiveDoneSessions(now);
  await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  await keepProjectLaunchRecords(dashboard, byProject);
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await shown.header.click();

  const titlesOf = () =>
    shown.entries.getByRole("heading", { level: 3 }).allTextContents();

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
    await expect(shown.body).toHaveCount(0);
    await shown.header.click();
    await expect(shown.entries).toHaveCount(45);
    await shown.button.click();
    await expect(shown.sidebar).toBeHidden();
    await shown.button.click();
    await expect(shown.entries).toHaveCount(45);
    await parts(page).project.getByRole("radio", { name: "Doughnut" }).check();
    await expect(parts(page).backlog).toContainText("A Doughnut story");
    await expect(shown.entries).toHaveCount(45);
    await parts(page).project.getByRole("radio", { name: "Pygardon" }).check();
    await expect(parts(page).backlog).toContainText("A Pygardon story");
  });

  // Index 40 → doughnut (sources cycle open-dough, doughnut, pygardon).
  const olderCrossProject = titles[40] ?? "";
  expect(olderCrossProject).not.toBe("");
  await test.step("opening an older cross-project session reaches its destination", async () => {
    await shown.entry(olderCrossProject).click();
    await expect(
      parts(page).project.getByRole("radio", { name: "Doughnut" }),
    ).toBeChecked();
    await expect(
      parts(page).recentlyDone.getByRole("article", {
        name: standaloneSessionName("Ad hoc", olderCrossProject),
      }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
    await openSessionsSidebar(page);
    if ((await shown.header.getAttribute("aria-expanded")) !== "true")
      await shown.header.click();
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
    const newer: LaunchRecord = doneRecord({
      source: "doughnut",
      title: newTitle,
      sessionId: "done-new",
      launchedAt: new Date(now - 90_000).toISOString(),
      doneAt: new Date(now - 30_000).toISOString(),
    });
    const withoutRemoved = records.filter(
      (record) => record.request.title !== removedTitle,
    );
    const refreshed = [newer, ...withoutRemoved];
    const nextByProject: Record<string, LaunchRecord[]> = {
      "open-dough": [],
      doughnut: [],
      pygardon: [],
    };
    for (const record of refreshed) {
      const bucket = nextByProject[record.request.source];
      if (bucket === undefined) {
        throw new Error(`Unexpected project ${record.request.source}`);
      }
      bucket.push(record);
    }
    await shown.entry(removedTitle).focus();
    await expect(shown.entry(removedTitle)).toBeFocused();
    await keepProjectLaunchRecords(dashboard, nextByProject);
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
    await expect(shown.entry(removedTitle)).toHaveCount(0);
    // Focus left the removed control for a nearby entry or the section header.
    await expect(focused).not.toHaveText(removedTitle);
  });

  await test.step("reload restores the initial newest-20 range", async () => {
    await page.reload();
    await parts(page).project.getByRole("radio", { name: "Pygardon" }).check();
    await openSessionsSidebar(page);
    await expect(shown.header).toHaveAttribute("aria-expanded", "false");
    await shown.header.click();
    await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  });
});

test("delayed first session read and a failed refresh keep existing read semantics", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const opened = new Date("2026-10-28T12:00:00.000Z");
  await pausePageClockAt(page, opened);
  const { passOnePace } = await watchRecordReads(page);
  const { byProject, titles } = fortyFiveDoneSessions(opened.getTime());
  await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  const { answer } = await holdSessionReads(page);
  await keepProjectLaunchRecords(dashboard, byProject);
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await shown.header.click();
  await expect(shown.body).toContainText("Reading sessions…");
  await expect(shown.entries).toHaveCount(0);
  answer();
  await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  expect(
    await shown.entries.getByRole("heading", { level: 3 }).allTextContents(),
  ).toEqual(titles.slice(0, recentlyDoneSessionsInitialLimit));

  await revealRecentlyDoneThrough(shown, 40);
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      await (route.request().method() === "GET"
        ? route.abort("connectionrefused")
        : route.continue());
    },
  );
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [],
    doughnut: [],
    pygardon: [],
  });
  await passOnePace();
  // Failed refresh invents no empty list; the reached range stays.
  await expect(shown.entries).toHaveCount(40);
  await expect(shown.body).not.toContainText("No sessions marked done");
});
