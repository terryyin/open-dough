// Starting execution or refinement from a Backlog card, on a committed origin
// the production commands published (./launchJourney.ts): two queued stories,
// one Ready for execution and one not refined, and one Taken. The page's own
// dashboard server launches the synthetic `claude` (./fixtures/fake-claude),
// which records what it was asked; the real one is never reached. A launch
// that did not start is ./agent-launch-story-card-problems.spec.ts; how a card's
// sessions stay listed, two launches as two entries newest first, is
// ./agent-launch-story-card-sessions.spec.ts. A noted Start's tooltip and look are
// ./agent-launch-story-card-noted-start.spec.ts. On a phone, only an explicit
// Start sends the draft, and the card tells accepted startup from a launched
// session.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  storyCardSessionName,
  storyCardSessions,
  sessionStateOf,
} from "./dashboardPage.ts";
import { instructionField, openTakenBacklog } from "./launchStoryCardPage.ts";

import {
  notRefinedIdentity,
  notRefinedStory,
  readyStory,
} from "./launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not assessed as ready";

// The one launch the synthetic `claude` records for a Start of Story C: the
// session's name and its command with the instruction, in the Open Dough
// folder.
const launched = (home: string, workflow: string, command: string) => [
  {
    argv: [
      "--bg",
      "--name",
      `Open Dough · ${workflow} · ${notRefinedStory}`,
      command,
    ],
    cwd: realpathSync(path.join(home, "git", "open-dough")),
  },
];

test("every Backlog card offers Start execution, described as not assessed as ready unless its assessment is Ready, then Start refinement, and a Taken card offers neither", async ({
  page,
  launchJourney,
}) => {
  const { card, takenStoryCard, start, refine } = await openTakenBacklog(
    page,
    launchJourney,
  );

  for (const title of [readyStory, notRefinedStory]) {
    await expect(
      card(title).getByRole("button", { name: /^Start / }),
    ).toHaveText(["Start execution", "Start refinement"]);
    await expect(refine(title)).toBeEnabled();
    await expect(refine(title)).toHaveAccessibleDescription("");
  }

  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await expect(start(readyStory)).toBeEnabled();
  await expect(start(readyStory)).toHaveAccessibleDescription("");
  await expect(card(readyStory)).not.toContainText(notReadyNote);

  await expect(start(notRefinedStory)).toBeEnabled();
  await expect(start(notRefinedStory)).toHaveAccessibleDescription(
    notReadyNote,
  );
  await expect(
    card(notRefinedStory).getByText(notReadyNote, { exact: true }),
  ).toBeHidden();

  await expect(takenStoryCard).toBeVisible();
  await expect(
    takenStoryCard.getByRole("button", { name: /Start/ }),
  ).toHaveCount(0);
});

for (const launch of [
  {
    action: "Start execution",
    story: readyStory,
    command: "/dough-execute-plan SEED-B#b",
  },
  {
    action: "Start refinement",
    story: notRefinedStory,
    command: `/dough-story-refinement ${notRefinedIdentity}`,
  },
]) {
  test(`the ${launch.action} dialog names the story, Claude Code, and its command, takes focus to its instruction, and Escape or Cancel sends nothing`, async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    const { card } = await openTakenBacklog(page, launchJourney);
    const action = card(launch.story).getByRole("button", {
      name: launch.action,
    });
    const dialog = page.getByRole("dialog", {
      name: `${launch.action} in Claude Code`,
    });
    const instruction = instructionField(dialog);

    await action.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(launch.story);
    await expect(dialog).toContainText("Claude Code");
    await expect(dialog).toContainText(launch.command);
    await expect(instruction).toBeFocused();
    await instruction.fill("never sent");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(action).toBeFocused();

    await action.click();
    // A dialog opened again starts without the abandoned instruction.
    await expect(instruction).toHaveValue("");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(action).toBeFocused();

    expect(dashboard.claudeCalls()).toEqual([]);
  });
}

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
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();

  expect(dashboard.claudeLaunchCalls()).toEqual(
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

  expect(dashboard.claudeLaunchCalls()).toEqual(
    launched(
      dashboard.home,
      "Refinement",
      `/dough-story-refinement ${notRefinedIdentity}\n\n${own}`,
    ),
  );
});

import "./storyCardTouchStartCases.ts";
