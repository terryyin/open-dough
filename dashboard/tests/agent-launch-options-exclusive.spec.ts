// Exclusive groups and unavailable definitions in the refinement dialog, on
// the committed origin of ./agent-launch-card.spec.ts (./launchJourney.ts): a
// group the definition declares is radios with a "No <group>" choice, options
// outside it stay checkboxes, and choosing a member replaces the group's
// other; a project without a usable definition (or one still being read) says
// so in one quiet line and Start launches default refinement; a refused
// launch says "Launch failed:" naming the option and keeps the selection for
// the next opening. The synthetic `claude` (./fixtures/fake-claude) stands in
// for the real one; the boundary's own rules are
// ./agent-launch-options-boundary.spec.ts.

import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { installRefinementSkill, openTakenBacklog } from "./launchCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const skill = "dough-story-refinement";
const sent = `/${skill} ${notRefinedIdentity}`;
const entry = (flag: string) => ({
  flag,
  label: flag.slice(2).toUpperCase(),
  summary: `${flag}.`,
  instruction: `${flag}.`,
});
// Options A and B in the group "Approach", and C outside any group.
const grouped = {
  command: skill,
  options: [entry("--a"), entry("--b"), entry("--c")],
  groups: [
    {
      id: "approach",
      label: "Approach",
      selection: "exclusive",
      flags: ["--a", "--b"],
    },
  ],
};

test("a group is radios with a No choice and other options stay checkboxes, choosing a member replaces another, and the command line and launch follow in definition order", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  writeFileSync(
    installRefinementSkill(dashboard.home),
    JSON.stringify(grouped),
  );
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);

  await refine(notRefinedStory).click();
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
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(`${sent} --b --c`);
});

test("choosing No Approach clears the group's choice and leaves the others", async ({
  page,
  dashboard,
}) => {
  writeFileSync(
    installRefinementSkill(dashboard.home),
    JSON.stringify(grouped),
  );
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);

  await refine(notRefinedStory).click();
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
    line: "the installed dough-story-refinement skill in this project options file is not valid",
  },
  {
    name: "another command's options file",
    change: (file: string) => {
      writeFileSync(file, JSON.stringify({ ...grouped, command: "other" }));
    },
    line: "the installed dough-story-refinement skill in this project options file defines another command",
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
  }) => {
    dashboard.claudeScenario("launched");
    change(installRefinementSkill(dashboard.home));
    const { refine, refinementDialog } = await openTakenBacklog(page, journey);

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
    expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(sent);
  });
}

test("until the sessions read answers, the dialog says options are being read and Start launches default refinement", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  installRefinementSkill(dashboard.home);
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/__agent-launch", async (route) => {
    if (route.request().method() === "GET") await held;
    await route.continue();
  });
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);

  await refine(notRefinedStory).click();
  await expect(refinementDialog.getByText("Reading options…")).toBeVisible();
  await expect(
    refinementDialog.getByRole("group", { name: "Options" }),
  ).toHaveCount(0);
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(sent);
  release();
});

test("a launch the boundary refuses says Launch failed naming the option, and the next opening keeps the selection", async ({
  page,
  dashboard,
}) => {
  const file = installRefinementSkill(dashboard.home);
  writeFileSync(file, JSON.stringify(grouped));
  const { card, refine, refinementDialog } = await openTakenBacklog(
    page,
    journey,
  );

  await refine(notRefinedStory).click();
  await refinementDialog.getByRole("radio", { name: "A", exact: true }).check();
  await refinementDialog
    .getByRole("checkbox", { name: "C", exact: true })
    .check();
  // The project's definition drops --c after the dialog offered it.
  writeFileSync(
    file,
    JSON.stringify({ ...grouped, options: grouped.options.slice(0, 2) }),
  );
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect(card(notRefinedStory).locator(".launch-problem")).toContainText(
    "Launch failed: Option --c is not one the installed dough-story-refinement skill",
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).toBeChecked();
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();
  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("radio", { name: "A", exact: true }),
  ).not.toBeChecked();
});
