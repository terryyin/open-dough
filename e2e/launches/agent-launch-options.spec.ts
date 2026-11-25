// The installed refinement definition reaches the dialog, the actual Claude
// launch and the record shown on the story card.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import {
  expect,
  pausePageClockAt,
} from "../../dashboard/test-support/dashboardTest.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  shippedRefinementDefinition,
  showOptions,
  showsRecordedRefinementOptions,
  storyLaunchChoices,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  passCheckPace,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  claudeRefinementRepository,
  refinementOptionsRevision,
} from "../../dashboard/test-support/support/claudeRefinementRepository.ts";
import {
  expectInstalledClaudeStory,
  readClaudeLaunch,
} from "./claudeLaunchObservation.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";

test.use({
  projectFolders: ["open-dough"],
  originRepository: claudeRefinementRepository(),
});

const sent = `/dough-story-refinement ${notRefinedIdentity}`;

test("the refinement dialog offers the installed definition's entries with label, summary and flag, and a changed definition shows with no code change", async ({
  page,
  origin,
}) => {
  const board = await openInstalledStoryBoard(page, origin);
  const real = shippedRefinementDefinition();
  const shipped = [...real.options, ...real.focuses];
  const { dialog } = await board.open(notRefinedStory, "Refinement");
  const choices = storyLaunchChoices(dialog);
  await showOptions(dialog);

  await expect(choices.options.getByRole("checkbox")).toHaveCount(
    shipped.length,
  );
  for (const { flag, label, summary } of shipped) {
    const box = choices.option(label);
    await expect(box).not.toBeChecked();
    await expect(box).toHaveAccessibleDescription(summary);
    await box.check();
    await expect(choices.command).toHaveText(new RegExp(` ${flag}$`));
    await box.uncheck();
  }
  await choices.cancel();

  const changed = {
    ...real,
    options: [
      ...real.options,
      makeMe.anOptionsEntry
        .with({
          flag: "--zoom",
          label: "Zoom",
          summary: "Look closer.",
          instruction: ".",
        })
        .please(),
    ],
  };
  await origin.publishRevision(refinementOptionsRevision(changed));
  await reloadUntilRead(page);
  await board.open(notRefinedStory, "Refinement");
  await showOptions(dialog);
  await expect(choices.options.getByRole("checkbox")).toHaveCount(
    shipped.length + 1,
  );
  const zoom = choices.option("Zoom");
  await expect(zoom).toHaveAccessibleDescription("Look closer.");
  await zoom.check();
  await expect(choices.command).toHaveText(/ --zoom$/);
});

test("selecting Explore and Borrow sends those flags and the session's card shows them through reload", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  await pausePageClockAt(page, new Date());
  const board = await openInstalledStoryBoard(page, origin);
  const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
  const choices = storyLaunchChoices(dialog);
  await expect(dialog).toContainText(`Sent after ${sent}.`);
  await choices.chooseOption("Borrow");
  await choices.chooseOption("Explore");
  await expect(dialog).toContainText(`Sent after ${sent} --explore --borrow.`);

  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const launch = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expectInstalledClaudeStory(dashboard, launch, {
    invocation: `${sent} --explore --borrow`,
    handoff: "Established preparation:",
    workspace: path.join(origin.project, ".worktrees", "story-c"),
    publishedSha: await originMain(origin),
  });
  expect(launch.record.request.options).toEqual(["--explore", "--borrow"]);
  const card = board.card(notRefinedStory);
  const recorded = "Options: --explore --borrow (requested)";
  await passCheckPace(page);
  await showsRecordedRefinementOptions(card, recorded);
  await reloadUntilRead(page);
  await showsRecordedRefinementOptions(card, recorded);
});

test("a dialog with nothing selected starts as before, and opens again with nothing selected", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const board = await openInstalledStoryBoard(page, origin);
  const { dialog } = await board.open(notRefinedStory, "Refinement");
  const choices = storyLaunchChoices(dialog);
  await choices.chooseOption("Explore");
  await choices.cancel();
  const { submit } = await board.open(notRefinedStory, "Refinement");
  await showOptions(dialog);
  await expect(choices.option("Explore")).not.toBeChecked();

  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const launch = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expectInstalledClaudeStory(dashboard, launch, {
    invocation: sent,
    handoff: "Established preparation:",
    workspace: path.join(origin.project, ".worktrees", "story-c"),
    publishedSha: await originMain(origin),
  });
  expect(launch.record.request).not.toHaveProperty("options");
});
