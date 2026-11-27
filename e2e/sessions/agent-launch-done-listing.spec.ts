// A page whose regular sessions answer lists retained done sessions by their
// listing facts shows them as the full answer showed them: the Board's
// columns -- Recently done's heading count and entries, among them the done
// session of a Backlog story -- the expanded Recently done sessions, and an
// opened done session's details and report read the same as on a page served
// every done session in full (the history's entries put back into each
// regular answer). Retained sessions here carry everything the overview
// leaves to the history: the reporting handoff, the first input's text, and
// the landing evidence (../../dashboard/src/sessionListing.ts).

import type { Page, Route } from "@playwright/test";
import {
  agentLaunchEndpoint,
  launchRecordSchema,
  type LaunchRecord,
} from "../../dashboard/src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../../dashboard/src/machineSessionsRevision.ts";
import {
  expandStoryCardDoneHistory,
  parts,
  storyCardSessions,
  storyCardDoneDisclosure,
} from "../../dashboard/test-support/dashboardPage.ts";
import { sessionDetailsControl } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { givePageItsTurns } from "../../dashboard/test-support/pageRequestNotes.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { showRecentlyDone } from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { showPage } from "../../dashboard/test-support/runningCursorSessionsPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import { replayRecords } from "../../dashboard/test-support/support/sessionsReplayRecords.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";

const backlogStoryTitle = "Story A";

test.use({ projectFolders: ["open-dough"], cursorScreen: "working" });

const minute = 60_000;
// The server's real clock, which its launch retention measures Done marks by.
const opened = Date.now();
const retainedStory = (index: number) => ({
  identity: `SEED-900#retained-${String(index)}`,
  title: `Retained story ${String(index + 1)}`,
});

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
        identity: index === 0 ? queuedIdentity : retainedStory(index).identity,
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
  const recent = board.recentlyDone;
  await expect(
    storyCardSessions(storyCard(recent, retainedStory(4).title)),
  ).toContainText("Retained session 5");
  const backlogCard = storyCard(board.backlog, backlogStoryTitle);
  await expect(storyCardDoneDisclosure(backlogCard)).toContainText("1");
  await expect(
    (await expandStoryCardDoneHistory(backlogCard))
      .getByRole("article")
      .filter({ hasText: "Retained session 1" }),
  ).toBeVisible();
  await expect(board.backlog).not.toContainText("Reading preparation");
  await givePageItsTurns(page);
  const columns = await Promise.all(
    [board.backlog, board.taken, board.recentlyDone].map((column) =>
      column.innerText(),
    ),
  );
  const sidebar = await showRecentlyDone(page);
  await expect(sidebar.entries).toHaveCount(5);
  const expanded = await sidebar.body.innerText();
  await sidebar.header.click();
  await sidebar.button.click();
  const entry = storyCardSessions(storyCard(recent, retainedStory(1).title));
  const details = sessionDetailsControl(entry);
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
  await origin.publishRevision({
    message: "Publish the stories owning the retained sessions",
    doneRecords: [1, 2, 3, 4].map((index) =>
      makeMe.aDoneRecord
        .completed({
          ...retainedStory(index),
          completedAt: new Date(opened - index * 60 * minute).toISOString(),
        })
        .please(),
    ),
  });
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
  expect(listed.columns[2]).toContain("Recently done\n\n4 entries");
  expect(listed.opened).toContain(message);
});
