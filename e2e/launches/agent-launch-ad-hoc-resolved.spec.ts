// An ad hoc start that launched needs no attention once settled, so the
// machine's sessions overview stops carrying its attempt
// (../../dashboard/src/launchAttemptSelection.ts). The page that asked for it then reads
// how it settled from the sessions history (../../dashboard/src/askedLaunches.ts,
// ../../dashboard/src/retainedHistory.ts) and presents its session as before: started
// with nothing typed, the terminal opens with the keyboard and Start session
// is offered again.

import { agentLaunchEndpoint } from "../../dashboard/src/agentLaunch.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
} from "../../dashboard/src/machineSessionsRevision.ts";
import { attempts } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  openStartSession,
  startSession,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { rawRequest } from "../../dashboard/test-support/support/rawHttp.ts";
import { setPageVisibility } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";

test("a launched ad hoc start leaves the overview and its page presents the session from the history", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const historyReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.searchParams.get(sessionsAudienceParameter) ===
      sessionsHistoryAudience
    )
      historyReads.push(request.url());
  });
  await openInstalledStoryBoard(page, origin);
  expect(historyReads).toEqual([]);
  let release = () => {};
  const delivery = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() === "GET") await delivery;
      await route.continue();
    },
  );

  try {
    const { dialog, submit } = await openStartSession(page, "Open Dough");
    await expect(startSessionField(dialog)).toHaveValue("");
    await submit();

    // Let the second page reconcile the published story before the first
    // page reads the native launch outcome.
    await expect
      .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
        timeout: launchWaitMs,
      })
      .toBe("launched");
    const other = await page.context().newPage();
    try {
      await other.goto(dashboard.baseURL);
      await expect
        .poll(async () => (await attempts(dashboard))[0]?.reconciledAt, {
          timeout: launchWaitMs,
        })
        .toBeDefined();
    } finally {
      await other.close();
    }
  } finally {
    release();
  }
  await page.bringToFront();

  const panel = terminalPanel(page);
  await expect(terminalScreenParts(panel).input).toBeFocused();
  // The other page reconciled the publication. Let this page see its own
  // published Board again without replacing the page that asked for the start.
  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
  await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
  await expect(startSession(page, "Open Dough")).toBeEnabled();

  // The regular answer no longer carries the settled attempt; the history
  // does, and the page read it to learn how its start settled.
  const regular = await rawRequest({
    url: `${dashboard.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: dashboard.origin },
  });
  expect(
    (JSON.parse(regular.body) as { attempts: unknown[] }).attempts,
  ).toEqual([]);
  const known = await attempts(dashboard);
  expect(known).toHaveLength(1);
  expect(known[0]?.outcome?.kind).toBe("launched");
  expect(historyReads.length).toBeGreaterThanOrEqual(1);
});
