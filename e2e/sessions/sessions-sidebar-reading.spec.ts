// Before the machine's sessions are first read, the Sessions sidebar says so,
// as Recently done does, instead of claiming none are kept; once read with
// none kept it says so, and with all kept ones marked done it says none is
// open. Before that first read answers, no card offers Start while the lists
// keep reading; once read, a launch lists its session on the card, keyboard
// on its entry, and in the open sidebar, without a Recently done duplicate. The page's
// own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude).

import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";
import {
  columnCountOf,
  storyCardSessions,
  parts,
  sessionEntryShowing,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { readyStory } from "../../dashboard/test-support/launchJourney.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { markDone } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { holdSessionReads } from "../../dashboard/test-support/sessionStatePace.ts";
import {
  expectSessionsSidebar,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  columnPagingControl,
  showColumn,
} from "../../dashboard/test-support/boardPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "100" },
});

test.describe("the Sessions sidebar's reading", () => {
  test("says it is reading until the machine's sessions are first read, then that none are kept, then none open", async ({
    page,
    dashboard,
    origin,
  }) => {
    await page.setViewportSize({ width: 1000, height: 1000 });
    const { answer } = await holdSessionReads(page);
    const { settled } = await openInstalledStoryBoard(page, origin);
    const { sidebar, button, entries, badge, workingBadge } =
      sessionsSidebarParts(page);
    const { recentlyDone, taken } = parts(page);
    await settled();
    // Before the first sessions read answers, the closed toggle shows no badge.
    await expect(badge).toHaveCount(0);
    await expect(workingBadge).toHaveCount(0);
    await button.click();
    await expect(columnCountOf(taken)).toHaveText("0 entries");
    await expect(taken).toContainText("No Taken entries are recorded.");
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText("Reading sessions…");
      await expect(place).not.toContainText("No sessions launched");
    }
    await expect(columnPagingControl(page, "Taken")).toHaveText(
      "Taken 0 entries",
    );
    await showColumn(page, "Taken");
    await expect(taken.locator(".column-header")).toBeInViewport({
      ratio: 0.999,
    });
    await expect(columnPagingControl(page, "Recently done")).toHaveText(
      "Recently done Entry count incomplete",
    );
    await showColumn(page, "Recently done");
    await expect(recentlyDone.locator(".column-header")).toBeInViewport({
      ratio: 0.999,
    });
    await showColumn(page, "Taken");

    answer();
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText(
        "No sessions launched from this dashboard are kept.",
      );
      await expect(place).not.toContainText("Reading sessions…");
    }
    await expect(columnCountOf(taken)).toHaveText("0 entries");
    await expect(taken).toContainText("No Taken entries are recorded.");
    await expect(entries).toHaveCount(0);
    await expect(badge).toHaveCount(0);

    // Kept, but all marked done: none is open.
    const { sessionId } = await composeSession(dashboard, "doughnut");
    await markDone(dashboard, { source: "doughnut", session: sessionId });
    await page.reload();
    // Open as it was left.
    await expectSessionsSidebar(page, "open");
    await expect(sidebar).toContainText(
      "No sessions launched from this dashboard are open.",
    );
    await expect(entries).toHaveCount(0);
  });

  test("no Start is offered before the first read while the lists keep reading; once read, a launch's session joins what was read", async ({
    page,
    dashboard,
    origin,
  }) => {
    // Kept before the page opens, so the first read answers it too.
    await composeSession(dashboard, "doughnut");
    dashboard.claudeScenario("launched");
    const { answer } = await holdSessionReads(page);
    const boardPage = await openInstalledStoryBoard(page, origin, {
      keepsOpenedTrunk: true,
    });
    const { sidebar, button, entries } = sessionsSidebarParts(page);
    const { recentlyDone, board } = parts(page);
    await boardPage.settled();
    await button.click();

    const own = storyCardSessions(boardPage.card(readyStory));
    await expect(boardPage.action(readyStory, "Execution")).toBeDisabled();
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText("Reading sessions…");
    }
    await expect(entries).toHaveCount(0);

    answer();
    await expect(entries).toHaveCount(1);
    await (await boardPage.open(readyStory, "Execution")).submit();
    await expect(own).toHaveCount(1, { timeout: launchWaitMs });
    await expect(own).toBeFocused();
    await expect(sidebar).not.toContainText("Reading sessions…");
    await expect(recentlyDone).not.toContainText("Reading sessions…");
    await expect(entries).toHaveCount(2);
    await expect(
      recentlyDone.getByRole("article", {
        name: standaloneSessionName("Execution", readyStory),
      }),
    ).toHaveCount(0);
    await expect(own).toHaveCount(1);
    const key = (await own.getAttribute("data-shows-session")) ?? "?";
    await expect(sessionEntryShowing(board, key)).toHaveCount(1);
    await expect(recentlyDone).toContainText(
      "No sessions are listed in Recently done.",
    );
    await boardPage.showPublished();
    await boardPage.settled();
    await expect(entries).toHaveCount(2);
    await expect(own).toHaveAttribute("data-shows-session", key);
    await expect(sessionEntryShowing(board, key)).toHaveCount(1);
  });
});
