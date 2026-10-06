// While Mark as done's question is open (./agent-launch-done-question.spec.ts
// on a card, ./agent-terminal-done.spec.ts in the terminal panel), its
// statement follows the session as the page reads it again: a Working session
// that comes to wait for input is asked about as waiting, with the question
// still open; a session with a read `completed` report that comes to read
// Ready for review is complete, so the question goes away and Mark as done is
// back, marking it done in one click. The page reads again on becoming
// visible (./autoRefreshJourney.ts), so an open question or panel stays. Real
// start, launch, installed reporting command, store and page; only the
// synthetic `claude` and GitHub are fakes.

import type { Locator, Page } from "@playwright/test";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { cardSessions, parts, sessionStateOf } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  doneQuestion,
  expectAsked,
  expectQuestion,
  markAsDone,
  stillWorking,
  waitingForInput,
} from "./support/markDone.ts";
import { launchedStory, shortIdOf } from "./support/reportedLaunch.ts";
import { queuedIdentity, type StartOrigin } from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";
import { markReportRead } from "./support/sessionMessagePart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";

// Story A launched in Claude, reported `completed`, its report read on its
// card entry while it reads Working.
async function reportedWorkingEntry(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  await story.report();
  await publishOrigin(page, origin);
  await page.goto("/");
  const entry = cardSessions(
    parts(page).taken.getByRole("article", { name: titleA, exact: true }),
  );
  await markReportRead(entry);
  await expect(sessionStateOf(entry)).toHaveText("Working");
  return { sessionId: story.sessionId, entry };
}

// The session's native state changes and the page reads it again in place.
async function becomesAndReads(
  page: Page,
  dashboard: DashboardServer,
  sessionId: string,
  state: "blocked" | "done-live",
) {
  dashboard.claudeSessionBecomes(sessionId, state);
  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
}

// Asks about the Working session in this scope, then follows two readings:
// waiting, with the question still open and the keyboard on Keep open; then
// Ready for review, with the question gone and Mark as done back.
async function questionFollowsReadings(
  page: Page,
  dashboard: DashboardServer,
  sessionId: string,
  entry: Locator,
  scope: Locator,
) {
  await expectAsked(scope, stillWorking);

  await becomesAndReads(page, dashboard, sessionId, "blocked");
  await expect(sessionStateOf(entry)).toHaveText("Needs input");
  await expectQuestion(scope, waitingForInput);

  await becomesAndReads(page, dashboard, sessionId, "done-live");
  await expect(sessionStateOf(entry)).toHaveText("Ready for review");
  await expect(doneQuestion(scope)).toHaveCount(0);
  await expect(markAsDone(scope)).toHaveCount(1);
  await expect(markAsDone(scope)).toBeEnabled();
}

async function expectDone(page: Page, entry: Locator) {
  await expect(entry).toHaveCount(0);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: titleA });
  await expect(sessionStateOf(recent)).toHaveText("Done");
}

test("on a card, the open question follows the session's reading and goes away once it is complete", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const { sessionId, entry } = await reportedWorkingEntry(
    page,
    dashboard,
    origin,
  );
  const shortId = shortIdOf(dashboard, sessionId);
  const before = dashboard.claudeStopCalls().length;

  await questionFollowsReadings(page, dashboard, sessionId, entry, entry);
  expect(dashboard.claudeStopCalls()).toHaveLength(before);

  await markAsDone(entry).click();

  await expectDone(page, entry);
  expect(dashboard.claudeStopCalls().slice(before)).toEqual([
    expect.objectContaining({ argv: ["stop", shortId] }),
  ]);
});

test("in the terminal panel, the open question follows the session's reading and goes away once it is complete", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const { sessionId, entry } = await reportedWorkingEntry(
    page,
    dashboard,
    origin,
  );
  await entry.getByRole("button", { name: "Open terminal" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  const before = dashboard.claudeStopCalls().length;

  await questionFollowsReadings(page, dashboard, sessionId, entry, panel);
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  expect(dashboard.claudeStopCalls()).toHaveLength(before);

  await markAsDone(panel).click();

  await expect(panel).toHaveCount(0);
  await expectDone(page, entry);
});
