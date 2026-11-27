// Start session's optional text goes to the selected project's execution checkout; the
// session reads under its Taken story card and in the sidebar. The real
// boundary launches synthetic Claude (../../dashboard/test-support/fixtures/fake-claude);
// titles are ../../dashboard/backend-tests/launches/ad-hoc-start-labels.spec.ts.
// Start session placement and availability are covered by
// ../../dashboard/frontend-tests/launches/ad-hoc-start-session-answer.spec.ts.
// Its dialog is covered by ../../dashboard/frontend-tests/launches/ad-hoc-start-session.spec.ts.

import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  chooseProject,
  expectMembership,
  parts,
  sessionNamedBy,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  notRefinedStory,
  queuedDashboardRepository,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectTooltipLine,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  expectNamedAdHocCall,
  expectBorrowedLaunch,
  launchStoryIdentity,
} from "../../dashboard/test-support/support/unattachedLaunchAssertions.ts";
import { test as installedTest } from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { admittedStory } from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { serveInstalledCatalogProject } from "../../dashboard/test-support/installedCatalogPublication.ts";

test.use({
  projectFolders: ["open-dough", "pygardon"],
});

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

installedTest.describe("installed catalog", () => {
  installedTest.use({ originRepository: queuedDashboardRepository().please() });
  installedTest(
    "starting with text sends it in the Open Dough folder and lists the session under its story and in the sidebar",
    async ({ page, dashboard, origin }) => {
      dashboard.claudeScenario("launched");
      await origin.takenByAnotherAgent();
      await openBacklog(page, origin, true);
      const text = "why is the CI slow on main?";
      const dialog = startSessionDialog(page, "Open Dough");
      const { recentlyDone } = parts(page);
      const stories = () =>
        expectMembership(page, {
          taken: [takenStory, text],
          backlog: [readyStory, notRefinedStory],
        });

      const before = Date.now();
      await startSession(page, "Open Dough").click();
      await startSessionField(dialog).fill(`  ${text}  `);
      await dialog.getByRole("button", { name: "Start" }).click();

      const card = storyCard(parts(page).taken, text);
      const entry = sessionEntriesIn(card);
      await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
      await expect(entry).toHaveCount(1);
      await expect(dialog).toBeHidden();
      await expect(entry).toHaveAccessibleName("Ad hoc session");
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(text);
      await expect(entry).toContainText("Ad hoc session");
      await expect(entry).toContainText(
        "Local: launched from this dashboard on this machine.",
      );
      await expect(entry).toContainText(
        `Session ${await sessionNamedBy(entry)}`,
      );
      await expect(openTerminalControl(entry)).toBeVisible();
      await expect(entry.locator(".record-identity")).toHaveCount(0);
      const launchedAt = Date.parse(
        (await entry.locator("time").getAttribute("datetime")) ?? "",
      );
      expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
      expect(launchedAt).toBeLessThanOrEqual(Date.now());

      expectNamedAdHocCall(dashboard, "open-dough", "Open Dough", text);
      expect(await admittedStory(origin, text)).toMatchObject({
        identity: launchStoryIdentity(await expectBorrowedLaunch(dashboard)),
      });

      await stories();
      await expect(
        parts(page).board.getByRole("list", { name: "Sessions" }),
      ).toHaveCount(1);
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
    },
  );

  installedTest(
    "starting with an empty field sends no instruction",
    async ({ page, dashboard, origin }) => {
      dashboard.claudeScenario("launched");
      await openBacklog(page, origin, true);
      const dialog = startSessionDialog(page, "Open Dough");

      await startSession(page, "Open Dough").click();
      await dialog.getByRole("button", { name: "Start" }).click();

      await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
      const [started] = dashboard.claudeLaunches();
      expect(started).not.toHaveProperty("instruction");
      const record = await expectBorrowedLaunch(dashboard);
      expect(record?.request).not.toHaveProperty("instruction");
      const reporting = record?.request.reporting;
      if (reporting === undefined) throw new Error("Missing reporting.");
      expect(reporting.landingContext).toBe(
        path.join(
          dashboard.home,
          ".open-dough/dashboard/reporting",
          reporting.reference,
          "landing-context.json",
        ),
      );
      expect(started?.name).toMatch(
        /^Open Dough · Ad hoc · Ad hoc work — \d{1,2} \w{3}, \d\d:\d\d$/,
      );
    },
  );
});

test("starting on Pygardon uses Pygardon's folder and lists the session in the sidebar under Pygardon, not in Open Dough's Recently done", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);
  const { recentlyDone } = parts(page);
  await serveInstalledCatalogProject(dashboard, "pygardon");
  await chooseProject(page, "Pygardon");
  const dialog = startSessionDialog(page, "Pygardon");

  await startSession(page, "Pygardon").click();
  await startSessionField(dialog).fill("what changed last week?");
  await dialog.getByRole("button", { name: "Start" }).click();

  const { button, entries } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(1, { timeout: launchWaitMs });
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
