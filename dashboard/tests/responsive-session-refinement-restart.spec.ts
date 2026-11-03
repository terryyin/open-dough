// A refinement settling on its Backlog card leaves a task begun meanwhile
// focused; starting the card again after Mark as done shows its startup marks
// and protection without a current-session mark, and Recently done keeps the
// done session outside the card's protected frame. Uses the real bare origin
// of ./responsiveStart.ts.

import { storyCardSessions, parts, sessionNamedBy } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { inspectByKeyboard, marksOf } from "./responsiveAccess.ts";
import { startExecution } from "./responsiveRecovery.ts";
import {
  openStories,
  startupUnavailable as unavailable,
  test,
} from "./responsiveStart.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough"],
  launchTimeoutMs: 60_000,
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

test("a refinement settling on its card leaves a task begun meanwhile focused; starting the card again keeps its Shown in terminal mark beside its own, its session's actions unavailable and said why, while the terminal works", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  dashboard.claudeScenario("held");
  const { story, other } = await openStories(page, origin);
  await story.getByRole("button", { name: "Start refinement" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(story).toBeFocused();
  // The card stays in the Backlog, where its session is listed on settling.
  const otherHide = await inspectByKeyboard(page, other);
  dashboard.releaseHeldClaude();
  const entry = storyCardSessions(story);
  await expect(entry).toHaveCount(1, { timeout: 30_000 });
  await expect(
    story.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(otherHide).toBeFocused();
  await entry.getByRole("button", { name: "Open terminal" }).click();
  await expect(entry).toContainText("Shown in terminal");

  idleBetweenSteps(dashboard, await sessionNamedBy(entry));
  await markDoneAnyway(entry);
  await expect(storyCardSessions(story)).toHaveCount(0);

  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  await startExecution(page, story);
  await expect(story).toContainText(unavailable);
  const marks = await marksOf(story);
  expect(marks.classes).toEqual(
    expect.arrayContaining(["story-card-starting"]),
  );
  expect(marks.edge).toBe("dashed");
  // The terminal closed with Mark as done; no current-session mark on a new start.
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toHaveCount(0);
  // Recently done lists the done session outside the frame.
  await expect(
    parts(page).recentlyDone.getByRole("button", { disabled: true }),
  ).toHaveCount(0);

  push.release();
  dashboard.releaseHeldClaude();
  const { taken } = parts(page);
  const takenStory = taken.getByRole("article", { name: "Story A" });
  await expect(storyCardSessions(takenStory)).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
});
