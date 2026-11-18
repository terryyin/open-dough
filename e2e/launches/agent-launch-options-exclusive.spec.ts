// Exclusive groups and unavailable definitions in the refinement dialog, on
// the launch journey's committed origin (../../dashboard/test-support/launchJourney.ts):
// a group the definition declares is radios with a "No <group>" choice,
// options outside it stay checkboxes, and choosing a member replaces the
// group's other, launching in definition order; a project without a usable
// definition says why in one quiet line and Start launches default
// refinement. Clearing a group and a definition still being read are
// ../../dashboard/frontend-tests/launches/agent-launch-options.spec.ts; a
// refused launch's kept selection is ./agent-launch-options-kept.spec.ts. The
// synthetic `claude` (../../dashboard/test-support/fixtures/fake-claude) stands in for
// the real one; the boundary's own rules are
// ../../dashboard/backend-tests/launches/agent-launch-options-boundary.spec.ts.

import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  groupedOptions,
  installRefinementSkill,
  openTakenBacklog,
  showOptions,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

const skill = "dough-story-refinement";
const sent = `/${skill} ${notRefinedIdentity}`;

test("a group is radios with a No choice and other options stay checkboxes, choosing a member replaces another, and the command line and launch follow in definition order", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  writeFileSync(
    installRefinementSkill(dashboard.home),
    JSON.stringify(groupedOptions),
  );
  const { refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );

  await refine(notRefinedStory).click();
  await showOptions(refinementDialog);
  const options = refinementDialog.getByRole("group", { name: "Options" });
  const approach = options.getByRole("group", { name: "Approach" });
  await expect(approach.getByRole("radio")).toHaveCount(3);
  await expect(
    approach.getByRole("radio", { name: "No Approach" }),
  ).toBeChecked();
  await expect(options.getByRole("checkbox")).toHaveCount(1);
  await expect(
    options.getByRole("checkbox", { name: "C", exact: true }),
  ).toBeVisible();
  await expect(
    approach.getByRole("radio", { name: "A", exact: true }),
  ).toHaveAccessibleDescription("--a.");

  await options.getByRole("checkbox", { name: "C", exact: true }).check();
  await approach.getByRole("radio", { name: "A", exact: true }).check();
  await approach.getByRole("radio", { name: "B", exact: true }).check();
  await expect(
    approach.getByRole("radio", { name: "A", exact: true }),
  ).not.toBeChecked();
  await expect(
    approach.getByRole("radio", { name: "B", exact: true }),
  ).toBeChecked();
  await expect(refinementDialog).toContainText(`Sent after ${sent} --b --c.`);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunches()[0]?.instruction).toBe(`${sent} --b --c`);
});

const unavailable = [
  {
    name: "no options file",
    change: (file: string) => {
      rmSync(file);
    },
    line: "the installed dough-story-refinement skill in this project has no options file",
  },
  {
    name: "an invalid options file",
    change: (file: string) => {
      writeFileSync(file, "{");
    },
    line: "the installed dough-story-refinement skill in this project has an options file that is not valid",
  },
  {
    name: "another command's options file",
    change: (file: string) => {
      writeFileSync(
        file,
        JSON.stringify({ ...groupedOptions, command: "other" }),
      );
    },
    line: "the installed dough-story-refinement skill in this project has an options file for another command",
  },
  {
    name: "a skill that is not installed",
    change: (file: string) => {
      rmSync(path.dirname(path.dirname(file)), { recursive: true });
    },
    line: "the installed dough-story-refinement skill in this project has no options file",
  },
];

for (const { name, change, line } of unavailable) {
  test(`${name}: the dialog says why in one quiet line with no options, and Start launches default refinement`, async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("launched");
    change(installRefinementSkill(dashboard.home));
    const { refine, refinementDialog } = await openTakenBacklog(
      page,
      launchJourney,
    );

    await refine(notRefinedStory).click();
    await expect(
      refinementDialog.getByText(`Options are not offered: ${line}.`),
    ).toHaveCount(1);
    await expect(
      refinementDialog.getByText("Refinement starts straightforwardly."),
    ).toBeVisible();
    await expect(
      refinementDialog.getByRole("group", { name: "Options" }),
    ).toHaveCount(0);
    await refinementDialog.getByRole("button", { name: "Start" }).click();

    await expect(refinementDialog).toBeHidden();
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(dashboard.claudeLaunches()[0]?.instruction).toBe(sent);
  });
}
