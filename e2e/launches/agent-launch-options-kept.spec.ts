// A refused launch retains the chosen flags until the next dialog rereads
// the definition. Changes are committed to the installed project's origin.
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import {
  expect,
  pausePageClockAt,
} from "../../dashboard/test-support/dashboardTest.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  groupedOptions,
  showOptions,
  storyLaunchChoices,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  claudeRefinementRepository,
  noRefinementOptions,
  refinementOptionsRevision,
} from "../../dashboard/test-support/support/claudeRefinementRepository.ts";
import {
  expectInstalledClaudeStory,
  readClaudeLaunch,
} from "./claudeLaunchObservation.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";

test.use({
  projectFolders: ["open-dough"],
  originRepository: claudeRefinementRepository(
    refinementOptionsRevision(groupedOptions),
  ),
});

const sent = `/dough-story-refinement ${notRefinedIdentity}`;

async function refuseAWithC(
  page: Page,
  origin: StartOrigin,
  { dialog, submit }: { dialog: Locator; submit: () => Promise<void> },
) {
  const choices = storyLaunchChoices(dialog);
  await showOptions(dialog);
  await choices.groupChoice("Approach", "A").check();
  await choices.chooseOption("C");
  await origin.publishRevision(
    refinementOptionsRevision({
      ...groupedOptions,
      options: groupedOptions.options.slice(0, 2),
    }),
  );
  // The next periodic read is scheduled from the refusal's refreshed offer.
  await whileNotingChecks(page, async () => {
    await submit();
    await expect(dialog).toBeHidden();
    await untilPageRequestsAnswered(page);
  });
}

test("a launch the boundary refuses says Launch failed naming the option, and the next opening keeps the selection", async ({
  page,
  dashboard,
  origin,
}) => {
  await pausePageClockAt(page, new Date());
  const board = await openInstalledStoryBoard(page, origin);
  const first = await board.open(notRefinedStory, "Refinement");
  await refuseAWithC(page, origin, first);
  await expect(board.launchProblem(notRefinedStory)).toContainText(
    "Launch failed: Option --c is not one the installed dough-story-refinement skill",
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  await page.clock.runFor(checkIntervalMs);
  dashboard.claudeScenario("launched");
  const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
  const choices = storyLaunchChoices(dialog);
  await showOptions(dialog);
  await expect(choices.groupChoice("Approach", "A")).toBeChecked();
  await expect(
    dialog.getByText("Not offered any more, so not sent: --c.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(dialog).toContainText(`Sent after ${sent} --a.`);

  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const launch = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expectInstalledClaudeStory(dashboard, launch, {
    invocation: `${sent} --a`,
    handoff: "Established preparation:",
    workspace: path.join(origin.project, ".worktrees", "story-c"),
    publishedSha: await originMain(origin),
  });
  expect(launch.record.request.options).toEqual(["--a"]);
});

test("a kept selection the project no longer offers at all is named, and Start launches default refinement", async ({
  page,
  dashboard,
  origin,
}) => {
  await pausePageClockAt(page, new Date());
  const board = await openInstalledStoryBoard(page, origin);
  const first = await board.open(notRefinedStory, "Refinement");
  await refuseAWithC(page, origin, first);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  await origin.publishRevision(noRefinementOptions);
  await page.clock.runFor(checkIntervalMs);

  dashboard.claudeScenario("launched");
  const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
  await expect(
    dialog.getByText("Not offered any more, so not sent: --a, --c.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(dialog).toContainText(`Sent after ${sent}.`);

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
