// Choosing options in the refinement dialog, on the committed origin of
// ./agent-launch-card.spec.ts (./launchJourney.ts): the dialog offers one
// checkbox per entry of the definition the project's installed skill carries,
// with its label, flag and summary, and follows a changed definition with no
// code change; selecting entries shows them in the command line the
// instruction follows and starts the session with those flags, and nothing
// selected is today's dialog and launch. No other dialog offers options. The
// definition this repository ships is checked against the shared schema here.
// The synthetic `claude` (./fixtures/fake-claude) stands in for the real one.
// How the boundary honors a selection is ./agent-launch-options-boundary.spec.ts.

import { cpSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { optionsDefinitionSchema } from "../src/commandOptions.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
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
const definitionPath = path.join("src", "skills", skill, "references");
const realDefinition = path.join(definitionPath, "refinement-options.json");

// Installs the real skill in the project the dashboard reads, and answers its
// definition file.
function installSkill(home: string) {
  const installed = path.join(home, "git", "open-dough", ".claude", "skills");
  cpSync(path.join("src", "skills", skill), path.join(installed, skill), {
    recursive: true,
  });
  return path.join(installed, skill, "references", "refinement-options.json");
}

test("the shipped definition is valid and gives every option and focus a summary", () => {
  const definition = optionsDefinitionSchema.parse(
    JSON.parse(readFileSync(realDefinition, "utf8")),
  );
  const entries = [...definition.options, ...(definition.focuses ?? [])];
  expect(entries.length).toBeGreaterThan(0);
  for (const { flag, summary } of entries) {
    expect(summary, flag).toMatch(/\S/);
  }
});

test("the refinement dialog offers the installed definition's entries with label, flag and summary, and a changed definition shows with no code change", async ({
  page,
  dashboard,
}) => {
  const file = installSkill(dashboard.home);
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);
  const real = JSON.parse(readFileSync(realDefinition, "utf8")) as {
    options: { flag: string; label: string; summary: string }[];
    focuses: { flag: string; label: string; summary: string }[];
  };
  const shipped = [...real.options, ...real.focuses];

  await refine(notRefinedStory).click();
  const group = refinementDialog.getByRole("group", { name: "Options" });
  await expect(group.getByRole("checkbox")).toHaveCount(shipped.length);
  for (const { flag, label, summary } of shipped) {
    const box = group.getByRole("checkbox", { name: label, exact: true });
    await expect(box).not.toBeChecked();
    await expect(box).toHaveAccessibleDescription(summary);
    await expect(group.getByText(flag, { exact: true })).toBeVisible();
  }
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();

  const changed = {
    ...real,
    options: [
      ...real.options,
      {
        flag: "--zoom",
        label: "Zoom",
        summary: "Look closer.",
        instruction: ".",
      },
    ],
  };
  writeFileSync(file, JSON.stringify(changed));
  await page.reload();
  await refine(notRefinedStory).click();
  await expect(group.getByRole("checkbox")).toHaveCount(shipped.length + 1);
  await expect(
    group.getByRole("checkbox", { name: "Zoom", exact: true }),
  ).toHaveAccessibleDescription("Look closer.");
  await expect(group.getByText("--zoom", { exact: true })).toBeVisible();
});

test("selecting Explore and Borrow shows them in the command line and starts the session with those flags", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  installSkill(dashboard.home);
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);
  const sent = `/${skill} ${notRefinedIdentity}`;

  await refine(notRefinedStory).click();
  await expect(refinementDialog).toContainText(`Sent after ${sent}.`);
  // Selected out of definition order, shown in it.
  await refinementDialog.getByRole("checkbox", { name: "Borrow" }).check();
  await refinementDialog.getByRole("checkbox", { name: "Explore" }).check();
  await expect(refinementDialog).toContainText(
    `Sent after ${sent} --explore --borrow.`,
  );
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(
    `${sent} --explore --borrow`,
  );
});

test("a dialog with nothing selected starts as before, and opens again with nothing selected", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  installSkill(dashboard.home);
  const { refine, refinementDialog } = await openTakenBacklog(page, journey);
  const sent = `/${skill} ${notRefinedIdentity}`;

  await refine(notRefinedStory).click();
  await refinementDialog.getByRole("checkbox", { name: "Explore" }).check();
  await refinementDialog.getByRole("button", { name: "Cancel" }).click();
  await refine(notRefinedStory).click();
  await expect(
    refinementDialog.getByRole("checkbox", { name: "Explore" }),
  ).not.toBeChecked();
  await refinementDialog.getByRole("button", { name: "Start" }).click();

  await expect(refinementDialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv[3]).toBe(sent);
});

test("the execution and session dialogs offer no options", async ({
  page,
  dashboard,
}) => {
  installSkill(dashboard.home);
  const { start, dialog } = await openTakenBacklog(page, journey);

  await start(readyStory).click();
  await expect(dialog).toContainText(readyStory);
  await expect(dialog.getByRole("group", { name: "Options" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await startSession(page, "Open Dough").click();
  const session = startSessionDialog(page, "Open Dough");
  await expect(session).toBeVisible();
  await expect(session.getByRole("group", { name: "Options" })).toHaveCount(0);
});
