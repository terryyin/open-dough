// A page whose regular sessions answer lists retained done sessions by their
// listing facts shows them as the full answer showed them: the Board's
// columns -- Recently done's heading count and entries, among them the done
// session of a Backlog story -- the expanded Recently done sessions, and an
// opened done session's details and report read the same as on a page served
// every done session in full (the history's entries put back into each
// regular answer). Retained sessions here carry everything the overview
// leaves to the history: the reporting handoff, the first input's text, and
// the landing evidence (../../src/sessionListing.ts).

import type { Page, Route } from "@playwright/test";
import {
  agentLaunchEndpoint,
  launchRecordSchema,
  type LaunchRecord,
} from "../../src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import { parts } from "../dashboardPage.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { givePageItsTurns } from "../pageRequestNotes.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import { showPage } from "../runningCursorSessionsPage.ts";
import { expect, test } from "../support/cursorStart.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { replayRecords } from "../support/sessionsReplayRecords.ts";
import { queuedIdentity } from "../support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], cursorScreen: "working" });

const minute = 60_000;
const opened = Date.parse("2026-10-28T10:00:00.000Z");

// Retained done sessions at several ages, one of them a Backlog story's,
// each with a report and every part of the detail the history keeps.
function retainedSessions(dashboard: DashboardServer): LaunchRecord[] {
  const detailed = replayRecords(dashboard.home, "unix://unused", opened)
    .records.filter(
      ({ doneAt, session }) =>
        doneAt !== undefined && session.host === "claude",
    )
    .slice(0, 5);
  return detailed.map((detail, index) => {
    const title = `Retained session ${String(index + 1)}`;
    const launchedAt = opened - (index * 3 + 1) * 60 * minute;
    const sessionId = dashboard.claudeListsSession({
      name: title,
      cwd: dashboard.home,
      startedAt: launchedAt,
    });
    const listed = makeMe.aLaunchRecord
      .executing({
        identity:
          index === 0 ? queuedIdentity : `SEED-900#retained-${String(index)}`,
        title,
      })
      .inClaudeSession({ sessionId })
      .launchedAt(new Date(launchedAt).toISOString())
      .markedDoneAt(new Date(launchedAt + 30 * minute).toISOString())
      .please();
    return launchRecordSchema.parse({
      ...listed,
      request: { ...listed.request, reporting: detail.request.reporting },
      firstInput: detail.firstInput,
      completion: detail.completion,
      landing: detail.landing,
      landingReporting: detail.landingReporting,
    });
  });
}

const isOverviewRead = (url: URL) =>
  url.pathname === agentLaunchEndpoint &&
  !url.searchParams.has(sessionsAudienceParameter);

type Entry = { session: { host: string; sessionId: string } };
const keyOf = ({ session }: Entry) => `${session.host}:${session.sessionId}`;

// The landing evidence of each full answer served.
const servedLandings: number[] = [];

// Answers every regular read in full: the done sessions as the history gives
// them, in the regular answer's places.
async function answerInFull(route: Route) {
  const request = route.request();
  if (request.method() !== "GET") return route.continue();
  // Same-origin reads, asked by the test instead of the page.
  const headers = {
    ...Object.fromEntries(
      Object.entries(request.headers()).filter(
        ([name]) => name !== sessionsRevisionHeader,
      ),
    ),
    origin: new URL(request.url()).origin,
  };
  const regular = await route.fetch({ headers });
  const history = new URL(request.url());
  history.searchParams.set(sessionsAudienceParameter, sessionsHistoryAudience);
  const full = (await (
    await route.fetch({ url: history.toString(), headers })
  ).json()) as { records: Entry[] };
  const byKey = new Map(full.records.map((entry) => [keyOf(entry), entry]));
  const answer = (await regular.json()) as { records: Entry[] };
  const records = answer.records.map(
    (entry) => byKey.get(keyOf(entry)) ?? entry,
  );
  servedLandings.push(records.filter((entry) => "landing" in entry).length);
  await route.fulfill({ response: regular, json: { ...answer, records } });
}

// What the page shows of the retained sessions, closed and then opened.
async function shownRetained(page: Page) {
  const board = parts(page);
  const recent = board.recentlyDone.getByRole("article");
  await expect(recent.filter({ hasText: "Retained session 5" })).toBeVisible();
  await expect(board.backlog).not.toContainText("Reading preparation");
  await givePageItsTurns(page);
  const columns = await Promise.all(
    [board.backlog, board.taken, board.recentlyDone].map((column) =>
      column.innerText(),
    ),
  );
  const sidebar = recentlyDoneParts(page);
  await sidebar.button.click();
  await sidebar.header.click();
  await expect(sidebar.entries).toHaveCount(5);
  const expanded = await sidebar.body.innerText();
  await sidebar.header.click();
  await sidebar.button.click();
  const entry = recent.filter({ hasText: "Retained session 2" });
  const details = entry.getByRole("button", { name: "Session details" });
  await details.click();
  await expect(details).toHaveAttribute("aria-expanded", "true");
  const report = entry.getByRole("button", {
    name: "Completed with attention",
  });
  await report.click();
  await expect(report).toHaveAttribute("aria-expanded", "true");
  await givePageItsTurns(page);
  const shown = { columns, expanded, opened: await entry.innerText() };
  await report.click();
  await details.click();
  return shown;
}

test("retained sessions listed by their listing facts show as the full answer showed them", async ({
  page,
  dashboard,
  origin,
}) => {
  const retained = retainedSessions(dashboard);
  const message = retained[1]?.completion?.message ?? "";
  expect(message).not.toBe("");
  keepLaunchStore(dashboard, { "open-dough": retained });
  await pausePageClockAt(page, new Date(opened));
  await showPage(page, origin);
  const listed = await shownRetained(page);

  await page.route(isOverviewRead, answerInFull);
  await page.goto("/");
  const full = await shownRetained(page);

  expect(servedLandings.length).toBeGreaterThan(0);
  expect(servedLandings.every((count) => count === 5)).toBe(true);
  expect(listed).toEqual(full);
  expect(listed.columns[2]).toContain("Recently done\n\n5 entries");
  expect(listed.opened).toContain(message);
});
