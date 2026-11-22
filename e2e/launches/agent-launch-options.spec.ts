// Choosing options in the refinement dialog, on the launch journey's committed
// origin (../../dashboard/test-support/launchJourney.ts): the dialog offers one
// checkbox per entry of the definition the project's installed skill carries,
// behind its closed Refinement options disclosure, with its label and summary,
// and follows a changed definition with no code change; selecting entries
// shows their flags in the command line under Command details and starts the
// session with those flags, which the card reads back after reload. Nothing
// selected is today's dialog and launch. That no other dialog offers options is
// ../../dashboard/frontend-tests/launches/launch-refinement-options.spec.ts.
// The synthetic `claude` (../../dashboard/test-support/fixtures/fake-claude) stands
// in for the real one. How the boundary honors a selection is
// ../../dashboard/backend-tests/launches/agent-launch-options-boundary.spec.ts.

import { writeFileSync } from "node:fs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  installRefinementSkill,
  openTakenBacklog,
  shippedRefinementDefinition,
  showOptions,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"] });

const skill = "dough-story-refinement";

test("the refinement dialog offers the installed definition's entries with label, summary and flag, and a changed definition shows with no code change", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const file = installRefinementSkill(dashboard.home);
  const { refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );
  const real = shippedRefinementDefinition();
  const shipped = [...real.options, ...real.focuses];

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  const group = refinementDialog.getByRole("group", { name: "Options" });
  const command = refinementDialog.locator("code");
  await expect(group.getByRole("checkbox")).toHaveCount(shipped.length);
  for (const { flag, label, summary } of shipped) {
    const box = group.getByRole("checkbox", { name: label, exact: true });
    await expect(box).not.toBeChecked();
    await expect(box).toHaveAccessibleDescription(summary);
    await box.check();
    await expect(command).toHaveText(new RegExp(` ${flag}$`));
    await box.uncheck();
  }
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();

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
  writeFileSync(file, JSON.stringify(changed));
  await page.reload();
  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await expect(group.getByRole("checkbox")).toHaveCount(shipped.length + 1);
  const zoom = group.getByRole("checkbox", { name: "Zoom", exact: true });
  await expect(zoom).toHaveAccessibleDescription("Look closer.");
  await zoom.check();
  await expect(command).toHaveText(/ --zoom$/);
});

test("selecting Explore and Borrow sends those flags and the session's card shows them through reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  installRefinementSkill(dashboard.home);
  const backlog = await openTakenBacklog(page, launchJourney);
  const { refine, refinementDialog } = backlog;
  const sent = `/${skill} ${notRefinedIdentity}`;

  await refine(notRefinedStory).click();
  await expect(refinementDialog).toContainText(`Sent after ${sent}.`);
  await showOptions(refinementDialog);
  // Selected out of definition order, shown in it.
  await refinementDialog.getByRole("checkbox", { name: "Borrow" }).check();
  await refinementDialog.getByRole("checkbox", { name: "Explore" }).check();
  await expect(refinementDialog).toContainText(
    `Sent after ${sent} --explore --borrow.`,
  );
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunches()[0]?.instruction).toBe(
    `${sent} --explore --borrow`,
  );
  const recorded = "Options: --explore --borrow (requested)";
  await backlog.showsRecordedRefinementOptions(notRefinedStory, recorded);
  await reloadUntilRead(page);
  await backlog.showsRecordedRefinementOptions(notRefinedStory, recorded);
});

test("a dialog with nothing selected starts as before, and opens again with nothing selected", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  installRefinementSkill(dashboard.home);
  const { refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );
  const sent = `/${skill} ${notRefinedIdentity}`;

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await refinementDialog.getByRole("checkbox", { name: "Explore" }).check();
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();
  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  await expect(
    refinementDialog.getByRole("checkbox", { name: "Explore" }),
  ).not.toBeChecked();
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunches()[0]?.instruction).toBe(sent);
});
