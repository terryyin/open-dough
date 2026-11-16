// Start session's optional text goes to the selected project's folder; the
// session reads in Taken and the sidebar without a story card. The real
// boundary launches synthetic Claude (../../dashboard/tests/fixtures/fake-claude);
// naming is ../../dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts.
// Where Start session sits, its availability through read gaps and its dialog
// are ../../dashboard/frontend-tests/launches/agent-launch-ad-hoc.spec.ts.

import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import {
  chooseProject,
  expectMembership,
  parts,
  sessionNamedBy,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "../../dashboard/tests/launchJourney.ts";
import {
  expectTooltipLine,
  sessionsSidebarParts,
} from "../../dashboard/tests/sessionsSidebarPage.ts";
import {
  expectNamedAdHocCall,
  expectNoSessionEstablishment,
} from "../../dashboard/tests/support/unattachedLaunchAssertions.ts";
import { openTerminalControl } from "../../dashboard/tests/terminalScreenPage.ts";

test.use({ projectFolders: ["open-dough", "pygardon"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

test("starting with text sends it in the Open Dough folder, and the session reads in Taken and the sidebar with no card listing it", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);
  const text = "why is the CI slow on main?";
  const dialog = startSessionDialog(page, "Open Dough");
  const { recentlyDone } = parts(page);
  const stories = () =>
    expectMembership(page, {
      taken: [takenStory],
      backlog: [readyStory, notRefinedStory],
    });

  const before = Date.now();
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(`  ${text}  `);
  await dialog.getByRole("button", { name: "Start" }).click();

  const entry = sessionEntriesIn(parts(page).taken);
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
  await expect(entry).toHaveCount(1);
  await expect(dialog).toBeHidden();
  await expect(entry).toHaveAccessibleName(`Ad hoc session for ${text}`);
  await expect(entry.getByRole("heading", { level: 3 })).toHaveText(text);
  await expect(entry).toContainText("Ad hoc session started in Claude Code");
  await expect(entry).toContainText(
    "Local: launched from this dashboard on this machine.",
  );
  await expect(entry).toContainText(`Session ${await sessionNamedBy(entry)}`);
  await expect(openTerminalControl(entry)).toBeVisible();
  await expect(entry.locator(".record-identity")).toHaveCount(0);
  const launchedAt = Date.parse(
    (await entry.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());

  expectNamedAdHocCall(dashboard, "open-dough", "Open Dough", text);
  await expectNoSessionEstablishment(dashboard);

  await stories();
  await expect(
    parts(page).board.getByRole("list", { name: "Sessions" }),
  ).toHaveCount(0);
  for (const start of ["Start execution", "Start refinement"]) {
    await expect(
      parts(page).backlog.getByRole("button", { name: start }),
    ).toHaveCount(2);
  }

  const { button, entries, titles } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(1);
  await expect(titles.first()).toHaveText(text);
  await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
});

for (const [described, blank] of [
  ["an empty field", ""],
  ["only spaces", "   "],
] as const) {
  test(`starting with ${described} sends no instruction`, async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("launched");
    await openJourney(page, launchJourney);
    const dialog = startSessionDialog(page, "Open Dough");

    await startSession(page, "Open Dough").click();
    await startSessionField(dialog).fill(blank);
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
    const [started] = dashboard.claudeLaunches();
    expect(started).not.toHaveProperty("instruction");
    const record = await expectNoSessionEstablishment(dashboard);
    for (const absent of ["instruction", "reporting"])
      expect(record?.request).not.toHaveProperty(absent);
    expect(started?.name).toMatch(
      /^Open Dough · Ad hoc · \d{1,2} \w{3}, \d\d:\d\d$/,
    );
  });
}

test("starting on Pygardon uses Pygardon's folder and lists the session in the sidebar under Pygardon, not in Open Dough's Recently done", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);
  const { recentlyDone } = parts(page);
  await chooseProject(page, "Pygardon");
  const dialog = startSessionDialog(page, "Pygardon");

  await startSession(page, "Pygardon").click();
  await startSessionField(dialog).fill("what changed last week?");
  await dialog.getByRole("button", { name: "Start" }).click();

  // Pygardon publishes no work here, so the sidebar is where it is listed.
  const { button, entries } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(1);
  await expectTooltipLine(entries.first(), "Pygardon · Ad hoc");
  expectNamedAdHocCall(
    dashboard,
    "pygardon",
    "Pygardon",
    "what changed last week?",
  );

  await chooseProject(page, "Open Dough");
  await expect(recentlyDone).toContainText(
    "No sessions launched from this dashboard are kept.",
  );
});
