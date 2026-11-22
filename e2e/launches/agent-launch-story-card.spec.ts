// Starting execution or refinement from a Backlog card, on a committed origin
// from ../../dashboard/test-support/launchJourney.ts: two queued stories, one Ready
// for execution and one not refined, and one Taken. The page's own dashboard
// server launches the synthetic `claude`
// (../../dashboard/test-support/fixtures/fake-claude), which records what it was
// asked; the real one is never reached. Starts and readiness notes are in
// ../../dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts.
// Dialogs are in ../../dashboard/frontend-tests/launches/story-card-launch-dialogs.spec.ts.
// a launch that did not start is ./agent-launch-story-card-problems.spec.ts;
// how a card's sessions stay listed is
// ../sessions/agent-launch-story-card-sessions.spec.ts. On a phone, only an
// explicit Start sends the draft, and the card tells accepted startup from a
// launched session.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  storyCardSessionName,
  storyCardSessions,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  instructionField,
  openTakenBacklog,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { tapWhereShown } from "../../dashboard/test-support/pageLayout.ts";

test.use({ projectFolders: ["open-dough"] });

// The one launch the synthetic `claude` records for a Start of Story C: the
// session's name and its command with the instruction, in the Open Dough
// folder.
const launched = (home: string, workflow: string, command: string) => [
  {
    name: `Open Dough · ${workflow} · ${notRefinedStory}`,
    instruction: command,
    cwd: realpathSync(path.join(home, "git", "open-dough")),
  },
];

test("starting sends the instruction after the execution command in the Open Dough folder, and the card lists the session, with the keyboard on it, beside Start execution", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine } = await openTakenBacklog(
    page,
    launchJourney,
  );
  const own = "refine and plan it first, then execute";

  const before = Date.now();
  await start(notRefinedStory).click();
  await instructionField(dialog).fill(own);
  await dialog.getByRole("button", { name: "Start" }).click();

  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveAccessibleName(storyCardSessionName("Execution"));
  await expect(dialog).toBeHidden();
  await expect(entry).toBeFocused();
  await expect(start(notRefinedStory)).toBeDisabled();
  await expect(refine(notRefinedStory)).toBeDisabled();
  await expect(start(notRefinedStory)).toHaveAccessibleDescription(
    /Not assessed as ready/,
  );
  await expect(sessionStateOf(entry)).toHaveText("Working");
  await expect(entry).toContainText("Execution started in Claude Code");
  await expect(entry).toContainText(
    "Local: launched from this dashboard on this machine.",
  );
  const launchedAt = Date.parse(
    (await entry.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());

  await expect(entry).toContainText(/Session [0-9a-f]{8}-/);
  await expect(openTerminalControl(entry)).toBeVisible();

  expect(dashboard.claudeLaunches()).toMatchObject(
    launched(
      dashboard.home,
      "Execution",
      `/dough-execute-plan ${notRefinedIdentity}\n\n${own}`,
    ),
  );
  // Only the launched card lists a session; the other's Starts stay offered.
  await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
  await expect(start(readyStory)).toBeEnabled();
});

test("starting refinement sends its instruction in the Open Dough folder and lists its session beside both Start actions", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );
  const own = "Focus on the empty-state wording";

  await refine(notRefinedStory).click();
  await instructionField(refinementDialog).fill(own);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveAccessibleName(storyCardSessionName("Refinement"));
  await expect(refinementDialog).toBeHidden();
  await expect(entry).toBeFocused();
  await expect(entry).toContainText("Refinement started in Claude Code");
  await expect(refine(notRefinedStory)).toBeDisabled();
  await expect(start(notRefinedStory)).toBeDisabled();

  expect(dashboard.claudeLaunches()).toMatchObject(
    launched(
      dashboard.home,
      "Refinement",
      `/dough-story-refinement ${notRefinedIdentity}\n\n${own}`,
    ),
  );
});

test.describe("phone touch submission", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("only explicit Start sends the exact multiline draft and the card distinguishes accepted startup from a launched session", async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("held");
    const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
    const launcher = start(notRefinedStory);
    await launcher.scrollIntoViewIfNeeded();
    await tapWhereShown(launcher);
    const field = instructionField(dialog);
    const draft =
      "Refine this story first.\n\nKeep the exact next steps 日本語.\nThen execute.";
    await field.fill(draft);
    for (const viewport of [
      { width: 844, height: 390 },
      { width: 390, height: 300 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(field).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
    }
    await tapWhereShown(
      dialog.getByRole("button", { name: "Start", exact: true }),
    );
    await expect(dialog).toBeHidden();
    await expect(card(notRefinedStory)).toContainText(
      "Local startup in progress",
    );
    await expect(start(notRefinedStory)).toBeDisabled();
    await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(0);
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(dashboard.claudeLaunches()[0]?.instruction).toBe(
      `/dough-execute-plan ${notRefinedIdentity}\n\n${draft}`,
    );
    await page.setViewportSize({ width: 844, height: 390 });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    dashboard.releaseHeldClaude();
    const session = storyCardSessions(card(notRefinedStory));
    await expect(session).toHaveCount(1);
    await expect(session).toContainText("Execution started in Claude Code");
    await expect(sessionStateOf(session)).toHaveText("Working");
    await expect(session).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
