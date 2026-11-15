// A Backlog card's Start execution and Start refinement against controlled
// answers: one queued story assessed Ready, one not refined, and one
// Taken. Readiness notes come from the published seeds; each dialog names the
// story, Claude Code and its command, and Escape or Cancel send nothing and
// leave the story's actions available. Starting a story launches the
// synthetic host in ../../../e2e/launches/agent-launch-story-card.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import {
  backlogLaunchers,
  instructionField,
} from "../../tests/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyStory,
} from "../../tests/launchJourney.ts";

const notReadyNote = "Not assessed as ready";

test("every Backlog card offers Start execution, described as not assessed as ready unless its assessment is Ready, then Start refinement, and a Taken card offers neither", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const { card, takenStoryCard, start, refine } = backlogLaunchers(page);

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
  }) => {
    const boundary = await installFrontendLaunchBoundary(page);
    await openFrontendTakenBacklog(page);
    const { card } = backlogLaunchers(page);
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

    // Nothing was asked, so none of the story's actions became unavailable.
    await expect(
      card(launch.story).getByRole("button", { disabled: true }),
    ).toHaveCount(0);
    expect(boundary.acceptances).toEqual([]);
  });
}
