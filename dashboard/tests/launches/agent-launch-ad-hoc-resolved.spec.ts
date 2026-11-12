// An ad hoc start that launched needs no attention once settled, so the
// machine's sessions overview stops carrying its attempt
// (../../src/launchAttemptSelection.ts). The page that asked for it then reads
// how it settled from the sessions history (../../src/askedLaunches.ts,
// ../../src/retainedHistory.ts) and presents its session as before: started
// with nothing typed, the terminal opens with the keyboard and Start session
// is offered again.

import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
} from "../../src/machineSessionsRevision.ts";
import { attempts } from "../agentLaunchBoundary.ts";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.use({ projectFolders: ["open-dough"] });

test("a launched ad hoc start leaves the overview and its page presents the session from the history", async ({
  page,
  dashboard,
  launchJourney,
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
  await openTakenBacklog(page, launchJourney);
  expect(historyReads).toEqual([]);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Start" }).click();

  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
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
