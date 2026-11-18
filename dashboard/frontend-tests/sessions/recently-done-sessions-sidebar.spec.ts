// Recently done sessions in the Sessions sidebar against controlled machine
// answers: collapsed by default, completion-ordered across configured
// projects, completion ages, newest listing, empty/reading states, and Open
// through a terminal substitute. Real Cursor reopen stays in
// ../../../e2e/sessions/recently-done-sessions-sidebar-reopen.spec.ts.
import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";
import {
  chooseProject,
  expectProjectChoice,
  standaloneSessionName,
  parts,
} from "../../test-support/dashboardPage.ts";
import { browserLocaleString } from "../../test-support/browserLocale.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import {
  expectRecentlyDone,
  recentlyDoneParts,
  showRecentlyDone,
} from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import {
  expectRowShows,
  expectSessionsSidebar,
  expectTooltipLine,
  openSessionsSidebar,
} from "../../test-support/sessionsSidebarPage.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendServiceSubstitutes.ts";
import { openFrontendThreeProjects } from "../../test-support/support/frontendRecentlyDoneSidebar.ts";

test("finds and opens the newest completed sessions across projects from a collapsed Recently done section", async ({
  page,
  frontendServices,
}) => {
  const opened = new Date("2026-10-28T10:00:00.000Z");
  await pausePageClockAt(page, opened);
  const now = opened.getTime();
  const minute = 60_000;

  const newestTitle = "Newest completion";
  const middleTitle = "Middle completion";
  const olderTitle = "Older completion";
  const unattachedTitle = "Unattached done session";
  const openTitle = "Still open session";
  const at = (minutes: number) =>
    new Date(now - minutes * minute).toISOString();
  const newestDoneAt = at(1);
  const newestLaunchedAt = at(24 * 60);
  const stillOpenLaunchedAt = at(4);
  const adHoc = (title: string, source = "open-dough") =>
    makeMe.aLaunchRecord.adHoc({ instruction: title, title, source });
  const newest = adHoc(newestTitle, "doughnut")
    .inClaudeSession({ sessionId: "done-newest" })
    .launchedAt(newestLaunchedAt)
    .markedDoneAt(newestDoneAt)
    .please();
  const middle = makeMe.aLaunchRecord
    .executing({ identity: "SEED-900#active-done", title: middleTitle })
    .inClaudeSession({ sessionId: "done-middle" })
    .launchedAt(at(2))
    .markedDoneAt(at(5))
    .please();
  const oldestShown = adHoc(olderTitle, "pygardon")
    .inClaudeSession({ sessionId: "done-older" })
    .launchedAt(at(10))
    .markedDoneAt(at(10))
    .please();
  const unattached = adHoc(unattachedTitle)
    .inClaudeSession({ sessionId: "done-unattached" })
    .launchedAt(at(3))
    .markedDoneAt(at(8))
    .please();
  const stillOpen = adHoc(openTitle)
    .inClaudeSession({ sessionId: "still-open" })
    .launchedAt(stillOpenLaunchedAt)
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingDone(newest, middle)
      .observingUnavailable(oldestShown, unattached)
      .observingOpen(stillOpen)
      .please(),
  );
  await installAttachedTerminalSubstitute(page);
  await openFrontendThreeProjects(page, frontendServices);
  const shown = recentlyDoneParts(page);
  await shown.button.click();

  await test.step("on a fresh load the section is collapsed and the open list keeps launch ages", async () => {
    await expectRecentlyDone(shown, "collapsed");
    await expect(shown.entries).toHaveCount(0);
    await expect(shown.openEntries).toHaveCount(1);
    await expectRowShows(shown.openEntries.first(), openTitle, "4m");
    await expectTooltipLine(
      shown.openEntries.first(),
      `Launched ${await browserLocaleString(page, stillOpen.launchedAt)}`,
    );
  });

  await test.step("expanding from Pygardon lists only Done entries by completion, with completion ages", async () => {
    await shown.header.click();
    await expectRecentlyDone(shown, "expanded");
    await expect(shown.entries).toHaveCount(4);
    await expect(shown.titles).toHaveText([
      newestTitle,
      middleTitle,
      unattachedTitle,
      olderTitle,
    ]);
    await expectRowShows(shown.entries.nth(0), newestTitle, "1m");
    await expectRowShows(shown.entries.nth(1), middleTitle, "5m");
    await expectTooltipLine(
      shown.entries.first(),
      `Completed ${await browserLocaleString(page, newestDoneAt)}`,
    );
    await expect(shown.openEntries).toHaveCount(1);
    await expectRowShows(shown.openEntries.first(), openTitle, "4m");
  });

  await test.step("the clock advances completion ages without changing open-list launch ages", async () => {
    const completed = Date.parse(newestDoneAt);
    await page.clock.setSystemTime(completed + 20_000);
    await page.clock.runFor(30_000);
    await expectRowShows(shown.entries.nth(0), newestTitle, "<1m");
    await page.clock.setSystemTime(completed + 2 * minute);
    await page.clock.runFor(30_000);
    await expectRowShows(shown.entries.nth(0), newestTitle, "2m");
    await expectRowShows(shown.openEntries.first(), openTitle, "5m");
  });

  await test.step("choosing a Done entry in another project opens its destination and switches project", async () => {
    await shown.open(newestTitle).click();
    const panel = terminalPanel(page);
    await expect(panel.getByRole("heading")).toHaveText(newestTitle);
    await expectProjectChoice(page, "Doughnut");
    const local = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Ad hoc", newestTitle),
    });
    await expect(local).toBeVisible();
    await closeSidePanel(panel, { using: "mouse" });
    await expect(panel).toHaveCount(0);
  });

  await test.step("an unavailable Done entry offers no Open, and choosing it selects it and brings its Board entry into view in its project without inventing a terminal", async () => {
    await showRecentlyDone(page);
    await expect(shown.open(newestTitle)).toHaveCount(1);
    await expect(shown.open(olderTitle)).toHaveCount(0);
    await shown.select(olderTitle).click();
    await expect(shown.select(olderTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectProjectChoice(page, "Pygardon");
    const local = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Ad hoc", olderTitle),
    });
    await expect(local).toBeInViewport();
    await expect(local).toHaveClass(/\bselected-session\b/);
    await expect(parts(page).development).toBeChecked();
    await expect(terminalPanel(page)).toHaveCount(0);
  });

  await test.step("reload starts the section collapsed again", async () => {
    await page.reload();
    await chooseProject(page, "Pygardon");
    await openSessionsSidebar(page);
    await expectRecentlyDone(shown, "collapsed");
  });
});

test("empty and reading states stay distinct, and fewer than 20 shows every Done session", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(makeMe.aMachineAnswer.please());
  await openFrontendThreeProjects(page, frontendServices);
  const shown = await showRecentlyDone(page);
  await expect(shown.body).toContainText("No sessions marked done are listed.");
  await expect(shown.entries).toHaveCount(0);

  const now = Date.now();
  const few = Array.from(Array(3).keys(), (index) =>
    makeMe.aLaunchRecord
      .adHoc({
        instruction: `Few done ${String(index + 1)}`,
        title: `Few done ${String(index + 1)}`,
      })
      .inClaudeSession({ sessionId: `few-${String(index)}` })
      .launchedAt(new Date(now - (index + 1) * 60_000).toISOString())
      .markedDoneAt(new Date(now - (index + 1) * 30_000).toISOString())
      .please(),
  );
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingUnavailable(...few).please(),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  await expectSessionsSidebar(page, "open");
  await expectRecentlyDone(shown, "collapsed");
  await shown.header.click();
  await expect(shown.entries).toHaveCount(3);
  await expect(shown.body).not.toContainText("No sessions marked done");
});
