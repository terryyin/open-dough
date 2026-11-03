// A page reads the machine's sessions history only when a developer opens or
// acts on a retained session or expands Recently done sessions: once per such
// opening, and again only once the overview names a newer history revision.
// Polls while nothing retained is opened never ask it. A history read that
// fails leaves every retained session showing as before, and the next opening
// asks again.

import type { Page, Request } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../src/machineSessionsRevision.ts";
import { parts } from "./dashboardPage.ts";
import { pausePageClockAt } from "./dashboardTest.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";
import {
  doneRecord,
  keepProjectLaunchRecords,
  recentlyDoneParts,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { showPage } from "./runningCursorSessionsPage.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import { expect, test } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

test.use({ projectFolders: ["open-dough"], cursorScreen: "working" });

const minute = 60_000;

const isHistoryUrl = (url: URL) =>
  url.pathname === agentLaunchEndpoint &&
  url.searchParams.get(sessionsAudienceParameter) === sessionsHistoryAudience;

const isHistoryRead = (request: Request) =>
  request.method() === "GET" && isHistoryUrl(new URL(request.url()));

// Every history read the page asks, with the history revision it named.
function historyReads(page: Page) {
  const asked: (string | undefined)[] = [];
  page.on("request", (request) => {
    if (isHistoryRead(request))
      asked.push(request.headers()[sessionsRevisionHeader]);
  });
  return asked;
}

function retained(dashboard: DashboardServer, now: number, title: string) {
  const launchedAt = now - 30 * minute;
  const sessionId = dashboard.claudeListsSession({
    name: title,
    cwd: dashboard.home,
    startedAt: launchedAt,
  });
  return doneRecord({
    source: "open-dough",
    title,
    sessionId,
    launchedAt: new Date(launchedAt).toISOString(),
    doneAt: new Date(now - 5 * minute).toISOString(),
  });
}

async function showRetained(
  page: Page,
  dashboard: DashboardServer,
  origin: Parameters<typeof showPage>[1],
  records: readonly LaunchRecord[],
) {
  const opened = new Date("2026-10-28T10:00:00.000Z");
  await pausePageClockAt(page, opened);
  const { passOnePace } = await watchRecordReads(page);
  await keepProjectLaunchRecords(dashboard, { "open-dough": records });
  const asked = historyReads(page);
  await showPage(page, origin);
  const onBoard = (title: string) =>
    parts(page).recentlyDone.getByRole("article").filter({ hasText: title });
  return { passOnePace, asked, onBoard };
}

test("one history read per opening, none while nothing retained is opened, and again only once its revision moves", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const now = Date.parse("2026-10-28T10:00:00.000Z");
  const first = retained(dashboard, now, "First retained session");
  const { passOnePace, asked, onBoard } = await showRetained(
    page,
    dashboard,
    origin,
    [first],
  );
  const entry = onBoard("First retained session");
  const details = entry.getByRole("button", { name: "Session details" });
  const sidebar = recentlyDoneParts(page);

  await test.step("polls while nothing retained is opened ask no history", async () => {
    await expect(entry).toBeVisible();
    await passOnePace();
    await givePageItsTurns(page);
    expect(asked).toEqual([]);
  });

  await test.step("expanding Recently done sessions reads it once", async () => {
    await sidebar.button.click();
    await sidebar.header.click();
    await expect(sidebar.entries).toHaveCount(1);
    await expect.poll(() => asked).toEqual([undefined]);
  });

  await test.step("opening again while its revision stands reads nothing", async () => {
    await sidebar.header.click();
    await sidebar.header.click();
    await expect(sidebar.entries).toHaveCount(1);
    await sidebar.button.click();
    await details.click();
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await givePageItsTurns(page);
    expect(asked).toHaveLength(1);
  });

  await test.step("a moved history is read again only at the next opening", async () => {
    const second = retained(dashboard, now, "Second retained session");
    await keepProjectLaunchRecords(dashboard, {
      "open-dough": [first, second],
    });
    await passOnePace();
    await expect(onBoard("Second retained session")).toBeVisible();
    await givePageItsTurns(page);
    expect(asked).toHaveLength(1);
    await details.click();
    await expect.poll(() => asked).toHaveLength(2);
    expect(asked[1]).toEqual(expect.any(String));
  });
});

test("a failed history read leaves retained sessions as shown and the next opening asks again", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const now = Date.parse("2026-10-28T10:00:00.000Z");
  const record = retained(dashboard, now, "Retained through a failure");
  let failures = 1;
  await page.route(isHistoryUrl, async (route) => {
    if (failures > 0) {
      failures -= 1;
      await route.fulfill({ status: 503, body: "" });
      return;
    }
    await route.continue();
  });
  const { asked, onBoard } = await showRetained(page, dashboard, origin, [
    record,
  ]);
  const entry = onBoard("Retained through a failure");
  const details = entry.getByRole("button", { name: "Session details" });
  const summary = entry.locator(".session-entry-summary");
  await expect(summary).toBeVisible();
  const shown = await summary.textContent();

  await details.click();
  await expect.poll(() => asked).toHaveLength(1);
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(summary).toHaveText(shown ?? "");

  await details.click();
  await expect.poll(() => asked).toEqual([undefined, undefined]);
  await expect(summary).toHaveText(shown ?? "");
});
