import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { pygardonRepository } from "../../dashboard/test-support/pygardonProject.ts";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// Cursor reopen from Recently done sessions: held attach keeps membership;
// successful attach clears the Done row; narrow overlay returns focus.
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  pageReadReopened,
  showRecentlyDone,
  showThreeProjectPage,
} from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { expectSessionsSidebar } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { rem } from "../../dashboard/test-support/boardPage.ts";
import {
  expect,
  keptRecord,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";
import { agentTerminalEndpoint } from "../../dashboard/src/agentTerminal.ts";

test.use({
  cursorScreen: "working",
});

test("a held Cursor attach from Recently done keeps Done membership", async ({
  page,
  dashboard,
  afterGitHubStops,
  origin,
  cursor,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const title = "held from recently done";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  keepLaunchStore(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  // Route before navigation: Playwright's WebSocket mock is an init script and
  // only patches pages loaded after registration. A post-load route lets the
  // real attach win the race, clear Done, and flake this assertion.
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  const pygardon = await showThreeProjectPage(page, origin, afterGitHubStops);
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(pygardonRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(pygardon.revisions.published);
  expect(restMembershipAsked(pygardon.requests)).toEqual([]);
  const shown = await showRecentlyDone(page);
  await shown.open(title).click();
  await expect(terminalPanel(page)).toBeVisible();
  await expect(shown.select(title)).toHaveCount(1);
});

test("a successful Cursor attach from Recently done removes the Done row", async ({
  page,
  dashboard,
  afterGitHubStops,
  origin,
  cursor,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const title = "reopen from recently done";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  keepLaunchStore(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await showThreeProjectPage(page, origin, afterGitHubStops);
  const shown = await showRecentlyDone(page);
  await expect(shown.select(title)).toHaveCount(1);
  await shown.open(title).click();
  const panel = terminalPanel(page);
  await expect(terminalScreenParts(panel).rows).toContainText("ctrl+c to stop");
  await expect(shown.select(title)).toHaveCount(0);
  await expect(
    shown.openEntries.getByRole("button", { name: title }),
  ).toHaveCount(1);
});

test("on a narrow window, closing the panel after a successful reopen returns focus to Sessions", async ({
  page,
  dashboard,
  afterGitHubStops,
  origin,
  cursor,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 700, height: 900 });
  const title = "narrow reopen focus return";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  keepLaunchStore(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await showThreeProjectPage(page, origin, afterGitHubStops);
  const shown = await showRecentlyDone(page);
  const reopened = pageReadReopened(page, held);
  await shown.open(title).click();
  // The covering panel hides the banner, so only the sidebar is read here.
  await expect(shown.sidebar).toBeHidden();
  const panel = terminalPanel(page);
  await expect(terminalScreenParts(panel).rows).toContainText("ctrl+c to stop");
  // First paint precedes admission; Close only once the page read the reopen.
  await reopened;
  // Covering hides the banner Sessions control while the panel is open; Close
  // first, then reopen the overlay to observe Done cleared into the open list.
  await closeSidePanel(panel, { using: "mouse" });
  await expect(panel).toHaveCount(0);
  await expect(shown.button).toBeFocused();
  await shown.button.click();
  await expectSessionsSidebar(page, "open");
  await expect(shown.select(title)).toHaveCount(0);
  await expect(
    shown.openEntries.getByRole("button", { name: title }),
  ).toHaveCount(1);
});
