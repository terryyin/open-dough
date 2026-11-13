// Development and Intent: two perspectives of the selected project in the one
// dashboard frame (../intentPerspectivePage.ts). Development is the first-visit
// default; Intent keeps the selected project and, when no intent locations are
// published, says so naming the setting and file, never that the project has
// no tests or Proof, even when the published read failed. Changing projects
// keeps the perspective; Back, Forward, reload and System settings return to
// it; Development resumes its stories or roster. Its keys are
// development-intent-frame-keyboard.spec.ts's, its sessions
// development-intent-frame-sessions.spec.ts's, and the banner's geometry
// dashboard-header.spec.ts's.

import { expect, test } from "../dashboardTest.ts";
import { historyLength } from "../sessionNavigationJourney.ts";
import {
  expectBelowBanner,
  expectPinnedShortBanner,
} from "../bannerReading.ts";
import {
  chooseProject,
  expectProblemAndNoSnapshot,
  expectProjectChoice,
  openDirection,
  parts,
  projectTab,
  rosterParts,
  shortRevision,
} from "../dashboardPage.ts";
import {
  expectAddress,
  expectNotConfiguredIntent,
} from "../intentPerspectivePage.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../pageLayout.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { expectPerspectiveMeaningMarks } from "../perspectiveMarks.ts";
import {
  doughnutProject,
  expectCatalogStories,
  openDoughProject,
  publishCatalogProjects,
} from "../projectKeyboardNavigationJourney.ts";
import {
  commitAnswer,
  notFoundAnswer,
  publishOrigin,
} from "../publishedOrigin.ts";
import { back, settings } from "../support/systemSettingsPage.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";

test("Intent keeps the selected project and says no intent locations are configured; project changes, history and reload keep it, and Development resumes the stories", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await publishCatalogProjects(page);
  await openUntilRead(page);
  const { development, intentChoice, perspective, readRevision } = parts(page);
  // Development is the first-visit default, with its stories and direction.
  await expect(development).toBeChecked();
  await expectCatalogStories(page, openDoughProject);
  await openDirection(page);
  await expect(parts(page).direction).toContainText(openDoughProject.direction);
  const before = await historyLength(page);

  await test.step("each perspective keeps its name and shows a distinct decorative meaning mark", async () => {
    await expectPerspectiveMeaningMarks({
      development,
      intentChoice,
      perspective,
    });
  });

  await test.step("choosing Intent keeps Open Dough selected and says no intent locations are configured", async () => {
    await intentChoice.click();
    await expectNotConfiguredIntent(page, "Open Dough");
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expectProjectChoice(page, "Open Dough");
    expect(await historyLength(page)).toBe(before + 1);
    expectAddress(page, { project: null, perspective: "intent" });
  });

  await test.step("choosing Doughnut keeps Intent, with the same not-configured content", async () => {
    await projectTab(page, "Doughnut").check();
    await expectProjectChoice(page, "Doughnut");
    await expectNotConfiguredIntent(page, "Doughnut");
    // The published read status still names what was read of Doughnut.
    await expect(readRevision).toContainText(
      shortRevision(doughnutProject.revision),
    );
    expectAddress(page, { project: "doughnut", perspective: "intent" });
  });

  await test.step("Back returns to Open Dough's Intent, then its Development stories; Forward and reload keep Doughnut's Intent", async () => {
    await page.goBack();
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expectNotConfiguredIntent(page, "Open Dough");
    await page.goBack();
    await expect(development).toBeChecked();
    await expectCatalogStories(page, openDoughProject);
    await expect(parts(page).intent).toHaveCount(0);
    expectAddress(page, { project: null, perspective: null });
    await page.goForward();
    await page.goForward();
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    await expectNotConfiguredIntent(page, "Doughnut");
    await reloadUntilRead(page);
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    await expectNotConfiguredIntent(page, "Doughnut");
  });

  await test.step("Development resumes Doughnut's stories, direction and Start session", async () => {
    await development.click();
    await expect(intentChoice).not.toBeChecked();
    await expectCatalogStories(page, doughnutProject);
    await openDirection(page);
    await expect(parts(page).direction).toContainText(
      doughnutProject.direction,
    );
    await expect(
      page.getByRole("button", { name: "Start session in Doughnut" }),
    ).toBeVisible();
    await expect(parts(page).intent).toHaveCount(0);
    expectAddress(page, { project: "doughnut", perspective: null });
  });
});

test("System settings from Intent returns to the project and Intent with the keyboard on System settings, and Development returns to the roster", async ({
  page,
}) => {
  await publishCatalogProjects(page);
  await page.goto("/?project=doughnut&view=roster");
  const { roster } = rosterParts(page);
  const { development, intentChoice } = parts(page);
  const settingsHeading = page.getByRole("heading", {
    name: "System settings",
    exact: true,
  });
  await expect(roster).toBeVisible();
  await intentChoice.click();
  await expectNotConfiguredIntent(page, "Doughnut");
  await expect(roster).toBeHidden();
  // Intent keeps the roster to return to.
  expectAddress(page, {
    project: "doughnut",
    view: "roster",
    perspective: "intent",
  });

  await test.step("Back from System settings returns to Doughnut's Intent", async () => {
    await settings(page).click();
    await expect(settingsHeading).toBeFocused();
    await back(page).click();
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
    expectAddress(page, {
      project: "doughnut",
      view: "roster",
      perspective: "intent",
    });
  });

  await test.step("a reloaded System settings still returns to Doughnut's Intent", async () => {
    await settings(page).click();
    await expect(settingsHeading).toBeVisible();
    await page.reload();
    await expect(settingsHeading).toBeVisible();
    await back(page).click();
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
  });

  await test.step("Development returns to Doughnut's roster", async () => {
    await development.click();
    await expect(roster).toBeVisible();
    await expect(parts(page).intent).toHaveCount(0);
    expectAddress(page, {
      project: "doughnut",
      view: "roster",
      perspective: null,
    });
  });
});

test("at a phone width the perspective stays reachable under the compact title, and choosing a project there keeps Intent", async ({
  page,
}) => {
  const { portrait } = phoneLaunchTouchViewport;
  await page.setViewportSize(portrait);
  await publishCatalogProjects(page);
  await openUntilRead(page);
  const { intentChoice, perspective, projectCompact } = parts(page);
  await expect(projectCompact).toHaveText("Open Dough");
  await intentChoice.click();
  await expectNotConfiguredIntent(page, "Open Dough");
  await expect(perspective).toBeInViewport({ ratio: 1 });
  await expect(parts(page).intent).toBeInViewport();
  await chooseProject(page, "Doughnut");
  await expect(projectCompact).toHaveText("Doughnut");
  await expect(projectCompact).toBeFocused();
  await expectNotConfiguredIntent(page, "Doughnut");
  expectAddress(page, { project: "doughnut", perspective: "intent" });
  await expectPinnedShortBanner(page, portrait.height);
  await expectBelowBanner(parts(page).intent);
  // Compact project select may ellipsis on the one-line phone banner.
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});

test("with the published read failed, Intent still says only that no intent locations are configured, and Development keeps the read problem", async ({
  page,
}) => {
  const revision = "6f".repeat(20);
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: notFoundAnswer() },
  });
  await page.goto("/");
  const message =
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).";
  await expectProblemAndNoSnapshot(page, message);
  const { development, intentChoice, problem } = parts(page);
  await intentChoice.click();
  await expectNotConfiguredIntent(page, "Open Dough");
  // The read problem keeps its own meaning; Intent claims nothing from it.
  await expect(problem).toContainText(message);
  await development.click();
  await expectProblemAndNoSnapshot(page, message);
});
