// Mark as done in the terminal panel closes a session with an unread report
// as it closes any session (./session-unread-report.spec.ts is the unread
// report's journey). Real start, launch, installed reporting command, store
// and page; only the synthetic `claude` and GitHub are fakes.

import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { markDoneAnyway } from "./support/markDone.ts";
import { launchedStory } from "./support/reportedLaunch.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  doneNameOf,
  publishOrigin,
  recordOf,
  shortIdOf,
  sidebarRow,
  takenCard,
  test,
  titleA,
  unreadWords,
} from "./support/unreadReportPage.ts";

test("Mark as done in the terminal panel closes a session with an unread report as any session", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  const { sessionId } = story;
  await story.report();
  await publishOrigin(page, origin);
  await page.goto("/");
  const card = takenCard(page, titleA);
  await sidebarParts(page).button.click();
  const row = sidebarRow(page, titleA);
  await expect(card.locator(".session-unread-report")).toHaveText(unreadWords);
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  const doneName = doneNameOf(dashboard, sessionId);
  const shortId = shortIdOf(dashboard, sessionId);
  await card.getByRole("button", { name: "Open terminal" }).click();
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  const stopsBefore = dashboard.claudeStopCalls().length;

  await markDoneAnyway(terminal);

  await expect(terminal).toHaveCount(0);
  await expect(card.locator(".session-state")).toHaveCount(0);
  await expect(row).toHaveCount(0);
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: titleA });
  await expect(recent.locator(".session-state")).toHaveText("Done");
  await expect(recent.locator(".session-unread-report")).toHaveCount(0);
  await expect(recent).toContainText(`Named ${doneName}`);
  expect(
    dashboard
      .claudeListing()
      .find((listed) => listed["sessionId"] === sessionId)?.["name"],
  ).toBe(doneName);
  expect(dashboard.claudeStopCalls().slice(stopsBefore)).toEqual([
    expect.objectContaining({ argv: ["stop", shortId] }),
  ]);
  const record = await recordOf(dashboard, sessionId);
  expect(record?.doneAt).toBeDefined();
  expect(record?.doneProblem).toBeUndefined();
});
