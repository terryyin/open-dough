// Starting execution or refinement from a Backlog card, on a committed origin
// the production commands published (./launchJourney.ts): two queued stories,
// one Ready for execution and one not refined, and one Taken. The page's own
// dashboard server launches the synthetic `claude` (./fixtures/fake-claude),
// which records what it was asked; the real one is never reached. A launch
// that did not start is ./agent-launch-card-problems.spec.ts; how Started
// lasts and settles is ./agent-launch-settlement.spec.ts.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not marked Ready for execution";

test("every Backlog card offers Start execution, described as not ready unless Ready for execution, then Start refinement, and a Taken card offers neither", async ({
  page,
}) => {
  const { card, takenCard, start, refine } = await openTakenBacklog(
    page,
    journey,
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
  ).toBeVisible();

  await expect(takenCard).toBeVisible();
  await expect(takenCard.getByRole("button", { name: /Start/ })).toHaveCount(0);
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
  }) => {
    const { card } = await openTakenBacklog(page, journey);
    const action = card(launch.story).getByRole("button", {
      name: launch.action,
    });
    const dialog = page.getByRole("dialog", {
      name: `${launch.action} in Claude Code`,
    });
    const instruction = dialog.getByRole("textbox", {
      name: "Instruction (optional)",
    });

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

test("starting sends the instruction after the execution command in the Open Dough folder, and the card shows Started with its session and Open terminal", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine } = await openTakenBacklog(page, journey);
  const own = "refine and plan it first, then execute";

  const before = Date.now();
  await start(notRefinedStory).click();
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(own);
  await dialog.getByRole("button", { name: "Start" }).click();

  const started = card(notRefinedStory).getByRole("region", {
    name: "Execution started",
  });
  await expect(started).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(started).toBeFocused();
  await expect(start(notRefinedStory)).toHaveCount(0);
  await expect(started).toContainText("Execution started in Claude Code");
  await expect(started).toContainText(
    "Local: launched from this dashboard on this machine, not yet published.",
  );
  const launchedAt = Date.parse(
    (await started.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());

  await expect(started).toContainText(/Session [0-9a-f]{8}-/);
  await expect(
    started.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();

  const folder = realpathSync(path.join(dashboard.home, "git", "open-dough"));
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `Open Dough · Execution · ${notRefinedStory}`,
        `/dough-execute-plan ${notRefinedIdentity}\n\n${own}`,
      ],
      cwd: folder,
    },
  ]);
  // Only the launched card's execution changed.
  await expect(start(readyStory)).toBeEnabled();
  await expect(refine(notRefinedStory)).toBeEnabled();
});

test("starting refinement sends its instruction in the Open Dough folder and shows Refinement started beside Start execution, and starting execution too shows both Started records", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine, refinementDialog } =
    await openTakenBacklog(page, journey);
  const own = "Focus on the empty-state wording";

  await refine(notRefinedStory).click();
  await refinementDialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(own);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  const refinementStarted = card(notRefinedStory).getByRole("region", {
    name: "Refinement started",
  });
  await expect(refinementStarted).toBeVisible();
  await expect(refinementDialog).toBeHidden();
  await expect(refinementStarted).toBeFocused();
  await expect(refinementStarted).toContainText(
    "Refinement started in Claude Code",
  );
  await expect(refine(notRefinedStory)).toHaveCount(0);
  await expect(start(notRefinedStory)).toBeEnabled();

  const folder = realpathSync(path.join(dashboard.home, "git", "open-dough"));
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `Open Dough · Refinement · ${notRefinedStory}`,
        `/dough-story-refinement ${notRefinedIdentity}\n\n${own}`,
      ],
      cwd: folder,
    },
  ]);

  await start(notRefinedStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const executionStarted = card(notRefinedStory).getByRole("region", {
    name: "Execution started",
  });
  await expect(executionStarted).toBeFocused();
  await expect(executionStarted).toContainText(
    "Execution started in Claude Code",
  );
  await expect(refinementStarted).toBeVisible();
  await expect(
    card(notRefinedStory).getByRole("button", { name: /^Start / }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()[1]?.argv).toEqual([
    "--bg",
    "--name",
    `Open Dough · Execution · ${notRefinedStory}`,
    `/dough-execute-plan ${notRefinedIdentity}`,
  ]);
  // The other card still offers both.
  await expect(start(readyStory)).toBeEnabled();
  await expect(refine(readyStory)).toBeEnabled();
});
