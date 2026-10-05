// Mark as done on a card's session asks first, in place, unless the session's
// intended work is complete: its latest report is `completed` and it reads
// neither working nor waiting for input. The question names the most
// pressing situation (still working; waiting for your input; reported
// unfinished work; not reported complete, with its reading), starts on Keep
// open, and is a group labelled by its words. Keep open or Escape leaves the
// session, its record and its report's read state as they were and puts the
// keyboard back on Mark as done; the question's Mark as done marks the session
// done as the one-click mark does. The terminal panel's own Mark as done on a
// reported session is ./agent-terminal-done-report.spec.ts. Real start, launch, installed reporting
// command, store and page; only the synthetic `claude` and GitHub are fakes.

import type { Locator, Page } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { cardSessions, parts, sessionStateOf } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  doneQuestion,
  expectAsked,
  markAsDone,
  markDone,
  stillWorking,
  waitingForInput,
} from "./support/markDone.ts";
import {
  doneNameOf,
  launchedStory,
  shortIdOf,
} from "./support/reportedLaunch.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  type StartOrigin,
} from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";
const titleB = "Story B";

// Story A and Story B, each launched in its own Claude session.
async function launchedStories(
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  return {
    storyA: await launchedStory(dashboard, origin, queuedIdentity, titleA),
    storyB: await launchedStory(dashboard, origin, otherQueuedIdentity, titleB),
  };
}

async function openPage(page: Page, origin: StartOrigin) {
  await publishOrigin(page, origin);
  await page.goto("/");
  const entryOf = (title: string) =>
    cardSessions(
      parts(page).taken.getByRole("article", { name: title, exact: true }),
    );
  return { entryOf };
}

const recordOf = async (dashboard: DashboardServer, sessionId: string) =>
  ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === sessionId,
  );

// Expects the question with these words, then answers it by Keep open, or by
// Escape: the question goes, Mark as done is back with the keyboard on it,
// and the session is still listed on its card with the reading it had; no
// session is stopped and no record is marked done.
async function expectAskedThenKept(
  dashboard: DashboardServer,
  entry: Locator,
  statement: string,
  answer: "Keep open" | "Escape" = "Keep open",
) {
  const reading = (await sessionStateOf(entry).textContent())?.trim() ?? "";
  const stopsBefore = dashboard.claudeStopCalls().length;
  const question = await expectAsked(entry, statement);
  if (answer === "Escape") await entry.page().keyboard.press("Escape");
  else await question.getByRole("button", { name: "Keep open" }).click();
  await expect(doneQuestion(entry)).toHaveCount(0);
  await expect(markAsDone(entry)).toBeFocused();
  await expect(entry).toHaveCount(1);
  await expect(sessionStateOf(entry)).toHaveText(reading);
  expect(dashboard.claudeStopCalls()).toHaveLength(stopsBefore);
  const records = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(records.filter((record) => record.doneAt !== undefined)).toEqual([]);
}

test("a session not reported complete asks first with its situation; Keep open and Escape leave it, and confirming marks it done", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(180_000);
  const { storyA, storyB } = await launchedStories(dashboard, origin);
  const { entryOf } = await openPage(page, origin);
  const entryA = entryOf(titleA);
  const entryB = entryOf(titleB);
  const before = dashboard.claudeStopCalls().length;

  await test.step("(b) Working, no report: asks that it is still working; Keep open leaves it running", async () => {
    await expect(sessionStateOf(entryA)).toHaveText("Working");
    await expectAskedThenKept(dashboard, entryA, stillWorking);
  });

  await test.step("(h) Escape on the open question answers Keep open", async () => {
    await expectAskedThenKept(dashboard, entryA, stillWorking, "Escape");
  });

  await test.step("(e) Ready for review, never reported: asks that it has not reported its work complete, with its reading", async () => {
    dashboard.claudeSessionBecomes(storyA.sessionId, "done-live");
    await page.reload();
    await expect(sessionStateOf(entryA)).toHaveText("Ready for review");
    await expectAskedThenKept(
      dashboard,
      entryA,
      "This session has not reported its work complete. It reads Ready for review.",
    );
  });

  await test.step("(g) Session unavailable, never reported: asks with that reading", async () => {
    dashboard.claudeSessionBecomes(storyB.sessionId, "forgotten");
    await page.reload();
    await expect(sessionStateOf(entryB)).toHaveText("Session unavailable");
    await expectAskedThenKept(
      dashboard,
      entryB,
      "This session has not reported its work complete. It reads Session unavailable.",
    );
  });

  await test.step("(d) Needs input: asks that it is waiting for your input; confirming renames and stops it as Mark as done does", async () => {
    dashboard.claudeSessionBecomes(storyA.sessionId, "blocked");
    await page.reload();
    await expect(sessionStateOf(entryA)).toHaveText("Needs input");
    const doneName = doneNameOf(dashboard, storyA.sessionId);
    const shortId = shortIdOf(dashboard, storyA.sessionId);
    const question = await expectAsked(entryA, waitingForInput);
    await markAsDone(question).click();

    await expect(entryA).toHaveCount(0);
    const recentA = parts(page)
      .recentSessions.getByRole("article")
      .filter({ hasText: titleA });
    await expect(sessionStateOf(recentA)).toHaveText("Done");
    await expect(recentA).toContainText(`Named ${doneName}`);
    expect(dashboard.claudeStopCalls().slice(before)).toEqual([
      expect.objectContaining({ argv: ["stop", shortId] }),
    ]);
    expect((await recordOf(dashboard, storyA.sessionId))?.doneAt).toBeDefined();
  });
});

test("a completed report marks done at once only while the session neither works nor waits; an unfinished report asks and Keep open leaves it read", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(180_000);
  const { storyA, storyB } = await launchedStories(dashboard, origin);
  await storyA.report();
  await storyB.report("unfinished");
  dashboard.claudeSessionBecomes(storyB.sessionId, "done-live");
  const { entryOf } = await openPage(page, origin);
  const entryA = entryOf(titleA);
  const entryB = entryOf(titleB);
  const before = dashboard.claudeStopCalls().length;

  await test.step("(c) reported completed, read, then Working: asks that it is still working", async () => {
    await entryA.getByRole("button", { name: "Mark as read" }).click();
    await expect(sessionStateOf(entryA)).toHaveText("Working");
    await expectAskedThenKept(dashboard, entryA, stillWorking);
  });

  await test.step("(f) reported unfinished, read, Ready for review: asks that it reported unfinished work; Keep open leaves the report read", async () => {
    await expect(entryB.locator(".session-unread-report")).toHaveText(
      "Unread report: Unfinished work",
    );
    await entryB.getByRole("button", { name: "Mark as read" }).click();
    await expect(sessionStateOf(entryB)).toHaveText("Ready for review");
    await expectAskedThenKept(
      dashboard,
      entryB,
      "This session reported unfinished work.",
    );
    await expect(entryB.locator(".session-unread-report")).toHaveCount(0);
    const record = await recordOf(dashboard, storyB.sessionId);
    expect(record?.reportRead).toBe(record?.completion?.receipt);
  });

  await test.step("(a) reported completed with a reminder, read, Ready for review: one click marks it done", async () => {
    dashboard.claudeSessionBecomes(storyA.sessionId, "done-live");
    await page.reload();
    await expect(sessionStateOf(entryA)).toHaveText("Ready for review");
    const shortId = shortIdOf(dashboard, storyA.sessionId);

    await markDone(entryA);

    await expect(entryA).toHaveCount(0);
    const recentA = parts(page)
      .recentSessions.getByRole("article")
      .filter({ hasText: titleA });
    await expect(sessionStateOf(recentA)).toHaveText("Done");
    expect(dashboard.claudeStopCalls().slice(before)).toEqual([
      expect.objectContaining({ argv: ["stop", shortId] }),
    ]);
  });
});
