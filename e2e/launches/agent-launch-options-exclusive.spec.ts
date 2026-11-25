// Committed variants of the installed refinement options and the default
// launch when the selected host offers no options.
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import path from "node:path";
import { realpathSync } from "node:fs";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
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
  claudeRefinementOptions,
  claudeRefinementRepository,
  claudeRefinementSkill,
  noRefinementOptions,
  refinementOptionsRevision,
} from "../../dashboard/test-support/support/claudeRefinementRepository.ts";
import {
  expectInstalledClaudeStory,
  readClaudeLaunch,
} from "./claudeLaunchObservation.ts";
import { expectReportingBlock } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";

test.use({ projectFolders: ["open-dough"] });

const sent = `/dough-story-refinement ${notRefinedIdentity}`;

test.describe("exclusive refinement choices", () => {
  test.use({
    originRepository: claudeRefinementRepository(
      refinementOptionsRevision(groupedOptions),
    ),
  });

  test("a group is radios with a No choice and other options stay checkboxes, choosing a member replaces another, and the command line and launch follow in definition order", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("launched");
    const board = await openInstalledStoryBoard(page, origin);
    const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
    const choices = storyLaunchChoices(dialog);
    await showOptions(dialog);
    await expect(
      choices.optionGroup("Approach").getByRole("radio"),
    ).toHaveCount(3);
    await expect(choices.groupChoice("Approach", "No Approach")).toBeChecked();
    await expect(choices.options.getByRole("checkbox")).toHaveCount(1);
    await expect(choices.option("C")).toBeVisible();
    await expect(
      choices.groupChoice("Approach", "A"),
    ).toHaveAccessibleDescription("--a.");

    await choices.chooseOption("C");
    await choices.groupChoice("Approach", "A").check();
    await choices.groupChoice("Approach", "B").check();
    await expect(choices.groupChoice("Approach", "A")).not.toBeChecked();
    await expect(choices.groupChoice("Approach", "B")).toBeChecked();
    await expect(dialog).toContainText(`Sent after ${sent} --b --c.`);

    const before = dashboard.claudeLaunches().length;
    const acceptance = nextAcceptedAttemptId(page);
    await submit();
    const outcome = await settledOutcome(dashboard, await acceptance);
    const launch = readClaudeLaunch(dashboard, outcome, before);
    await expect(dialog).toBeHidden();
    expectInstalledClaudeStory(dashboard, launch, {
      invocation: `${sent} --b --c`,
      handoff: "Established preparation:",
      workspace: path.join(origin.project, ".worktrees", "story-c"),
      publishedSha: await originMain(origin),
    });
    expect(launch.record.request.options).toEqual(["--b", "--c"]);
  });
});

const unavailable = [
  {
    name: "no options file",
    revision: noRefinementOptions,
    line: "the installed dough-story-refinement skill in this project has no options file",
  },
  {
    name: "an invalid options file",
    revision: {
      message: "Install malformed options",
      files: { [claudeRefinementOptions]: "{" },
    },
    line: "the installed dough-story-refinement skill in this project has an options file that is not valid",
  },
  {
    name: "another command's options file",
    revision: refinementOptionsRevision({
      ...groupedOptions,
      command: "other",
    }),
    line: "the installed dough-story-refinement skill in this project has an options file for another command",
  },
];

for (const { name, revision, line } of unavailable) {
  test.describe(name, () => {
    test.use({ originRepository: claudeRefinementRepository(revision) });

    test("the dialog says why in one quiet line with no options, and Start launches default refinement", async ({
      page,
      dashboard,
      origin,
    }) => {
      dashboard.claudeScenario("launched");
      const board = await openInstalledStoryBoard(page, origin);
      const { dialog, submit } = await board.open(
        notRefinedStory,
        "Refinement",
      );
      await expect(
        dialog.getByText(`Options are not offered: ${line}.`),
      ).toHaveCount(1);
      await expect(
        dialog.getByText("Refinement starts straightforwardly."),
      ).toBeVisible();
      await expect(storyLaunchChoices(dialog).options).toHaveCount(0);

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
  });
}

test.describe("a skill that is not installed", () => {
  test.use({
    originRepository: claudeRefinementRepository({
      message: "Remove the Claude refinement skill",
      remove: [claudeRefinementSkill],
    }),
  });

  test("the dialog says why in one quiet line with no options, and Start launches default refinement", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("launched");
    const board = await openInstalledStoryBoard(page, origin);
    const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
    await expect(
      dialog.getByText(
        "Options are not offered: the installed dough-story-refinement skill in this project has no options file.",
      ),
    ).toHaveCount(1);
    await expect(
      dialog.getByText("Refinement starts straightforwardly."),
    ).toBeVisible();
    await expect(storyLaunchChoices(dialog).options).toHaveCount(0);
    const main = await originMain(origin);

    const before = dashboard.claudeLaunches().length;
    const acceptance = nextAcceptedAttemptId(page);
    await submit();
    const outcome = await settledOutcome(dashboard, await acceptance);
    const { record, started } = readClaudeLaunch(dashboard, outcome, before);
    await expect(dialog).toBeHidden();
    const [invocation, reporting, ...extra] = (started.instruction ?? "").split(
      "\n\n",
    );
    expect(invocation).toBe(sent);
    expect(extra).toEqual([]);
    expectReportingBlock(reporting, record.request, dashboard);
    expect(started.cwd).toBe(realpathSync(origin.project));
    expect(record).not.toHaveProperty("preparation");
    expect(record.request).not.toHaveProperty("options");
    expect(await originMain(origin)).toBe(main);
  });
});
