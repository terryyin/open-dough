// Recently done sessions in the Sessions sidebar: collapsed by default,
// completion-ordered across configured projects, completion ages, newest 20,
// and opening through PageFrame. Room sharing, reopen, and Board/final-report
// destinations live beside this file. Older paging is the next slice.
import { standaloneSessionName, parts } from "./dashboardPage.ts";
import {
  doneRecord,
  keepProjectLaunchRecords,
  openRecord,
  recentlyDoneParts,
  showThreeProjectPage,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { expectRowShows, expectTooltipLine } from "./sessionsSidebarPage.ts";
import { pausePageClockAt } from "./dashboardTest.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("finds and opens the newest completed sessions across projects from a collapsed Recently done section", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const opened = new Date("2026-10-28T10:00:00.000Z");
  await pausePageClockAt(page, opened);
  const now = opened.getTime();
  const minute = 60_000;

  // Interleaved launch and completion times across three projects. Completion
  // order (newest first) differs from launch order.
  const newestTitle = "Newest completion";
  const middleTitle = "Middle completion";
  const olderTitle = "Older completion";
  const unattachedTitle = "Unattached done session";
  const openTitle = "Still open session";
  const newestDoneAt = new Date(now - minute).toISOString();
  const newest = doneRecord({
    source: "doughnut",
    title: newestTitle,
    sessionId: "done-newest",
    launchedAt: new Date(now - 24 * 60 * minute).toISOString(),
    doneAt: newestDoneAt,
  });
  const middle = doneRecord({
    source: "open-dough",
    title: middleTitle,
    sessionId: "done-middle",
    launchedAt: new Date(now - 2 * minute).toISOString(),
    doneAt: new Date(now - 5 * minute).toISOString(),
    identity: "SEED-900#active-done",
    workflow: "execution",
  });
  const oldestShown = doneRecord({
    source: "pygardon",
    title: olderTitle,
    sessionId: "done-older",
    launchedAt: new Date(now - 10 * minute).toISOString(),
    doneAt: new Date(now - 10 * minute).toISOString(),
  });
  const unattached = doneRecord({
    source: "open-dough",
    title: unattachedTitle,
    sessionId: "done-unattached",
    launchedAt: new Date(now - 3 * minute).toISOString(),
    doneAt: new Date(now - 8 * minute).toISOString(),
  });
  // Still open: must stay out of Recently done and keep launch age.
  const stillOpen = openRecord({
    source: "open-dough",
    title: openTitle,
    sessionId: "open-still",
    launchedAt: new Date(now - 4 * minute).toISOString(),
  });
  const newestId = dashboard.claudeListsSession({
    name: newestTitle,
    cwd: dashboard.home,
    startedAt: Date.parse(newest.launchedAt),
  });
  const openId = dashboard.claudeListsSession({
    name: openTitle,
    cwd: dashboard.home,
    startedAt: Date.parse(stillOpen.launchedAt),
  });
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [
      middle,
      unattached,
      {
        ...stillOpen,
        session: {
          host: "claude",
          sessionId: openId,
          shortId: openId.slice(0, 8),
          name: openTitle,
        },
      },
    ],
    doughnut: [
      {
        ...newest,
        session: {
          host: "claude",
          sessionId: newestId,
          shortId: newestId.slice(0, 8),
          name: newestTitle,
        },
      },
    ],
    pygardon: [oldestShown],
  });

  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();

  await test.step("on a fresh load the section is collapsed and the open list keeps launch ages", async () => {
    await expect(shown.header).toHaveAttribute("aria-expanded", "false");
    await expect(shown.body).toHaveCount(0);
    await expect(shown.entries).toHaveCount(0);
    await expect(shown.openEntries).toHaveCount(1);
    await expectRowShows(shown.openEntries.first(), openTitle, "4m");
    await expectTooltipLine(
      shown.openEntries.first(),
      `Launched ${new Date(stillOpen.launchedAt).toLocaleString()}`,
    );
  });

  await test.step("expanding from Pygardon lists only Done entries by completion, with completion ages", async () => {
    await shown.header.click();
    await expect(shown.header).toHaveAttribute("aria-expanded", "true");
    await expect(shown.entries).toHaveCount(4);
    const titles = shown.entries.getByRole("heading", { level: 3 });
    await expect(titles).toHaveText([
      newestTitle,
      middleTitle,
      unattachedTitle,
      olderTitle,
    ]);
    await expectRowShows(shown.entries.nth(0), newestTitle, "1m");
    await expectRowShows(shown.entries.nth(1), middleTitle, "5m");
    await expectTooltipLine(
      shown.entries.first(),
      `Completed ${new Date(newestDoneAt).toLocaleString()}`,
    );
    // Desktop keeps completion identity in the tooltip; touch disclosure is
    // the coarse-input path below.
    await expect(shown.openEntries).toHaveCount(1);
    await expectRowShows(shown.openEntries.first(), openTitle, "4m");
  });

  await test.step("the clock advances completion ages without changing open-list launch ages", async () => {
    const completed = Date.parse(newestDoneAt);
    // A tick samples somewhere in the 30s it runs; keep each reading in unit.
    await page.clock.setSystemTime(completed + 20_000);
    await page.clock.runFor(30_000);
    await expectRowShows(shown.entries.nth(0), newestTitle, "<1m");
    await page.clock.setSystemTime(completed + 2 * minute);
    await page.clock.runFor(30_000);
    await expectRowShows(shown.entries.nth(0), newestTitle, "2m");
    // Open list still ages from launch (now+1.5m − launchedAt = 5.5m → 5m).
    await expectRowShows(shown.openEntries.first(), openTitle, "5m");
  });

  await test.step("choosing a Done entry in another project opens its destination and switches project", async () => {
    await shown.entry(newestTitle).click();
    const panel = page.getByRole("region", { name: "Terminal" });
    await expect(panel.getByRole("heading")).toHaveText(newestTitle);
    await expect(
      parts(page).project.getByRole("radio", { name: "Doughnut" }),
    ).toBeChecked();
    const local = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Ad hoc", newestTitle),
    });
    await expect(local).toBeVisible();
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
  });

  await test.step("an unavailable Done entry keeps its destination without inventing a terminal", async () => {
    if (!(await shown.sidebar.isVisible())) await shown.button.click();
    if ((await shown.header.getAttribute("aria-expanded")) !== "true")
      await shown.header.click();
    const attaches = dashboard.claudeAttaches().length;
    await shown.entry(olderTitle).click();
    await expect(
      parts(page).project.getByRole("radio", { name: "Pygardon" }),
    ).toBeChecked();
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
    expect(dashboard.claudeAttaches()).toHaveLength(attaches);
  });

  await test.step("reload starts the section collapsed again", async () => {
    await page.reload();
    await parts(page).project.getByRole("radio", { name: "Pygardon" }).check();
    if (!(await shown.sidebar.isVisible())) await shown.button.click();
    await expect(shown.header).toHaveAttribute("aria-expanded", "false");
    await expect(shown.body).toHaveCount(0);
  });
});

test("empty and reading states stay distinct, and fewer than 20 shows every Done session", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [],
    doughnut: [],
    pygardon: [],
  });
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await shown.header.click();
  await expect(shown.body).toContainText("No sessions marked done are kept.");
  await expect(shown.entries).toHaveCount(0);

  const now = Date.now();
  const few = Array.from(Array(3).keys(), (index) =>
    doneRecord({
      source: "open-dough",
      title: `Few done ${String(index + 1)}`,
      sessionId: `few-${String(index)}`,
      launchedAt: new Date(now - (index + 1) * 60_000).toISOString(),
      doneAt: new Date(now - (index + 1) * 30_000).toISOString(),
    }),
  );
  await keepProjectLaunchRecords(dashboard, { "open-dough": few });
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  // Open preference survives reload; do not toggle it closed.
  await expect(shown.sidebar).toBeVisible();
  await expect(shown.header).toHaveAttribute("aria-expanded", "false");
  await shown.header.click();
  await expect(shown.entries).toHaveCount(3);
  await expect(shown.body).not.toContainText("No sessions marked done");
});
