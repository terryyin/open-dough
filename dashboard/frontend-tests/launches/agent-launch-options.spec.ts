// Refinement options in the launch dialogs against controlled answers: only
// the refinement dialog offers them; choosing a group's "No" choice clears
// its member and leaves the other options; until the machine's sessions read
// answers, refinement is not offered, and while it reads again the dialog
// says so and Start asks for refinement with no options; a refused launch's
// kept selection is dropped by Cancel. The machine's sessions read answers
// which options a project's installed skill offers; offering them from that
// skill and launching with them is ../../../e2e/launches/agent-launch-options.spec.ts,
// ../../../e2e/launches/agent-launch-options-exclusive.spec.ts and
// ../../../e2e/launches/agent-launch-options-kept.spec.ts.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { machineOffering } from "../../tests/support/frontendServiceState.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import {
  backlogLaunchers,
  groupedOptions,
  shippedRefinementDefinition,
  showOptions,
  startSession,
  startSessionDialog,
} from "../../tests/launchStoryCardPage.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyStory,
} from "../../tests/launchJourney.ts";

const sent = `/dough-story-refinement ${notRefinedIdentity}`;

// Holds the page's reads of the machine's sessions while held; `hold` starts
// holding the next ones and answers their release.
async function holdSessionsReads(page: Page) {
  let held: Promise<void> | undefined;
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() === "GET") await held;
      await route.fallback();
    },
  );
  return () => {
    let release = () => {};
    held = new Promise<void>((resolve) => {
      release = () => {
        held = undefined;
        resolve();
      };
    });
    return release;
  };
}

test("the execution and session dialogs offer no options", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    machineOffering(shippedRefinementDefinition()),
  );
  await openFrontendTakenBacklog(page);
  const { start, dialog } = backlogLaunchers(page);

  await start(readyStory).click();
  await expect(dialog).toContainText(readyStory);
  await expect(dialog.getByRole("group", { name: "Options" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await startSession(page, "Open Dough").click();
  const session = startSessionDialog(page, "Open Dough");
  await expect(session).toBeVisible();
  await expect(session.getByRole("group", { name: "Options" })).toHaveCount(0);
});

test("choosing No Approach clears the group's choice and leaves the others", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(machineOffering(groupedOptions));
  await openFrontendTakenBacklog(page);
  const { refine, refinementDialog } = backlogLaunchers(page);

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await refinementDialog
    .getByRole("checkbox", { name: "C", exact: true })
    .check();
  await refinementDialog.getByRole("radio", { name: "A", exact: true }).check();
  await refinementDialog.getByRole("radio", { name: "No Approach" }).check();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).not.toBeChecked();
  await expect(refinementDialog).toContainText(`Sent after ${sent} --c.`);
});

test("until the sessions read answers, refinement is not offered; while the options are read again, the dialog says so and Start asks for refinement with no options", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    machineOffering(shippedRefinementDefinition()),
  );
  const boundary = await installFrontendLaunchBoundary(page);
  const hold = await holdSessionsReads(page);
  const release = hold();
  await page.goto("/");
  const { refine, refinementDialog } = backlogLaunchers(page);

  // No Start is offered before this machine's launch evidence is read.
  await expect(refine(notRefinedStory)).toBeDisabled();
  release();
  await expect(refine(notRefinedStory)).toBeEnabled();

  const releaseAgain = hold();
  await refine(notRefinedStory).click();
  // The dialog is named after its host, so it is found by role here.
  const host = page.getByRole("dialog").getByRole("combobox", { name: "Host" });
  await host.selectOption("codex");
  await host.selectOption("claude");
  await expect(refinementDialog.getByText("Reading options…")).toBeVisible();
  await expect(
    refinementDialog.getByRole("group", { name: "Options" }),
  ).toHaveCount(0);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => boundary.acceptances.length).toBe(1);
  expect(boundary.acceptances[0]).toMatchObject({
    workflow: "refinement",
    identity: notRefinedIdentity,
    host: "claude",
  });
  expect(boundary.acceptances[0]).not.toHaveProperty("options");
  releaseAgain();
});

test("after a refusal, Cancel drops the kept selection", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(machineOffering(groupedOptions));
  const boundary = await installFrontendLaunchBoundary(page, {
    refusal: "Option --c is not one the installed skill defines.",
  });
  await openFrontendTakenBacklog(page);
  const { refine, refinementDialog } = backlogLaunchers(page);
  const a = refinementDialog.getByRole("radio", { name: "A", exact: true });

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await a.check();
  await refinementDialog
    .getByRole("checkbox", { name: "C", exact: true })
    .check();
  await refinementDialog.getByRole("button", { name: "Start" }).click();
  await expect(refinementDialog).toBeHidden();
  expect(boundary.acceptances).toHaveLength(1);

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await expect(a).toBeChecked();
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();
  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await expect(a).not.toBeChecked();
});
