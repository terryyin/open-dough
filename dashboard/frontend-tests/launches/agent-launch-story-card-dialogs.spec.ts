// What a Backlog card's launch dialogs offer and say against controlled
// answers: both offer the same Attach images control, and only the execution
// dialog of a project whose installed skill establishes a start (the
// machine's sessions read names it) says Start also publishes the Take and
// creates a workspace. Starting with attached images is
// ../../../e2e/launches/agent-launch-story-attachments.spec.ts; the real
// start is ../../backend-tests/launches/agent-launch-start.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { openDoughSource } from "../../test-support/support/frontendServiceState.ts";
import { backlogLaunchers } from "../../test-support/launchStoryCardPage.ts";
import {
  notRefinedStory,
  readyStory,
} from "../../test-support/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const establishingSentence =
  "Start also publishes this story's Take to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.";

test("Start execution and Start refinement dialogs offer the same Attach images control", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const { start, dialog, refine, refinementDialog } = backlogLaunchers(page);

  await start(readyStory).click();
  await expect(
    dialog.getByRole("button", { name: "Attach images" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await refine(readyStory).click();
  await expect(
    refinementDialog.getByRole("button", { name: "Attach images" }),
  ).toBeVisible();
});

test("the execution dialog of a project that establishes a start says Start also publishes the Take to the trunk on origin and creates a workspace under .worktrees/, and the refinement dialog does not", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .establishing({
        source: openDoughSource.id,
        workflow: "execution",
        host: "claude",
      })
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const { start, dialog, refine, refinementDialog } = backlogLaunchers(page);

  await start(readyStory).click();
  await expect(dialog).toContainText(establishingSentence);
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await refine(notRefinedStory).click();
  await expect(refinementDialog).toContainText(notRefinedStory);
  await expect(refinementDialog).not.toContainText("publishes");
  await expect(refinementDialog).not.toContainText(".worktrees/");
});

test("the execution dialog of a project whose installed skill cannot continue from a start adds no sentence about a Take or a workspace", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const { start, dialog } = backlogLaunchers(page);

  await start(readyStory).click();
  await expect(dialog).toContainText(readyStory);
  await expect(dialog).not.toContainText("publishes");
  await expect(dialog).not.toContainText(".worktrees/");
});
