// Controlled page-clock setup for terminal journeys while launch outcomes
// remain withheld. Operations and transport observations stay in this harness.
import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { sessionsAudienceParameter } from "../../src/machineSessionsRevision.ts";
import { expect, pausePageClockAt } from "../dashboardTest.ts";
import { parts, sessionNamedBy } from "../dashboardPage.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import { watchRecordReads } from "../sessionStatePace.ts";
import { isTerminalSocket, watchTerminalSockets } from "./terminalSockets.ts";

// While withheld, the page reads every launch attempt of this machine as still
// starting, though its session may already be listed: the window between the
// service keeping a session's record and noting its attempt launched. That
// holds for the sessions history too, where a settled ad hoc attempt goes.
// Releasing lets the next read see the launched outcome.
async function withholdLaunchOutcomes(page: Page) {
  let withheld = true;
  const sessionsRead = (url: URL) => url.pathname === agentLaunchEndpoint;
  await page.route(sessionsRead, async (route) => {
    if (route.request().method() !== "GET" || !withheld) {
      await route.continue();
      return;
    }
    // Fetched outside the page, so its same-origin mark is restated.
    const response = await route.fetch({
      headers: {
        ...route.request().headers(),
        "sec-fetch-site": "same-origin",
      },
    });
    const body = (await response.json()) as {
      attempts?: Record<string, unknown>[];
      revision?: string;
      historyRevision?: string;
    };
    for (const attempt of body.attempts ?? []) {
      delete attempt["outcome"];
      delete attempt["settledAt"];
    }
    // The withheld answer is not the observation it was taken from, so the
    // page holds no revision and every read is answered in full. A withheld
    // history is named apart from the history it was taken from, by the
    // regular answer too: the page keeps it without asking again until the
    // release names the real one.
    const history = new URL(route.request().url()).searchParams.has(
      sessionsAudienceParameter,
    );
    if (history) body.revision = `withheld-${body.revision ?? ""}`;
    else delete body.revision;
    if (body.historyRevision !== undefined)
      body.historyRevision = `withheld-${body.historyRevision}`;
    await route.fulfill({ response, json: body });
  });
  return () => {
    withheld = false;
  };
}

// Starts an ad hoc session with launch outcomes withheld, and opens its
// listed entry's terminal while Start session still says it is starting.
// Page time stands still, so `release` lets exactly one more read of the
// machine's sessions see the launched outcome, and the terminal writes and
// draws what reached it only as page time passes: `shows` lets one steady
// pace pass at a time, each with its read answered, until it shows `text`.
export async function openWhileStarting(
  page: Page,
  launchJourney: LaunchJourney,
) {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const stopWithholding = await withholdLaunchOutcomes(page);
  const release = async () => {
    stopWithholding();
    await passOnePace();
  };
  await openTakenBacklog(page, launchJourney);
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const shows = async (text: string) => {
    for (let pace = 0; pace < 3; pace += 1) {
      await passOnePace();
      if ((await rows.textContent())?.includes(text)) return;
    }
    expect(await rows.textContent()).toContain(text);
  };
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1, { timeout: 20_000 });
  const sessionId = await sessionNamedBy(entry);
  await expect(
    parts(page).projectActions.getByText("Local startup in progress."),
  ).toBeVisible();
  const openTerminal = entry.getByRole("button", { name: "Open terminal" });
  // The browser requests attachment before the synthetic host has necessarily
  // started or written its record. Observe that causal request so an immediate
  // Close never races a later record of the original process.
  const terminalSockets = watchTerminalSockets(page);
  const opening = page.waitForEvent("websocket", isTerminalSocket);
  await openTerminal.click();
  await opening;
  await expect(panel).toHaveCount(1);
  return {
    release,
    panel,
    rows,
    shows,
    sessionId,
    openTerminal,
    terminalSockets,
  };
}
