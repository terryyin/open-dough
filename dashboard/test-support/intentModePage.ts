// Project and story views in Intent (../src/IntentPage.tsx), including the
// Test Optimization Candidates record and the files column.

import { expect, type Locator, type Page } from "@playwright/test";
import { shortRevision } from "./dashboardParts.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { emptyArea, expectSelected } from "./storyCardSelection.ts";

// Open the board, select the named card and enter its initial Intent view.
export async function openStoryIntent(page: Page, title: string) {
  await page.goto("/");
  await expectSettledPage(page);
  const card = parts(page).board.getByRole("article", {
    name: title,
    exact: true,
  });
  await emptyArea(card).click();
  await expectSelected(card, true);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expectStoryTab(intent, "CI comparison");
  return { card, intent };
}

// The candidates record region Intent shows for the selected project.
export function candidatesRecord(intent: Locator) {
  return intent.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
}

// One recorded candidate offering source files in Project Intent.
export const candidateEntry = (intent: Locator, name: string) =>
  candidatesRecord(intent).getByRole("article", { name });

export async function expectCandidatesRevision(
  intent: Locator,
  revision: string,
) {
  const record = candidatesRecord(intent);
  await expect(record).toContainText(
    `Recorded at revision ${shortRevision(revision)}`,
  );
  await expect(
    record.locator("code").filter({ hasText: revision }),
  ).toHaveCount(1);
}

// The shared page roots used by story and Project Intent readers.
export const storySummary = (intent: Locator) =>
  intent.getByRole("region", { name: "Selected story", exact: true });
export const filesColumn = (intent: Locator) =>
  intent.locator(".intent-locations");
export const intentBrowser = (intent: Locator) =>
  intent.locator(".intent-browser");
export const intentPageFrame = (intent: Locator) =>
  intent.locator(".intent-page-frame");
export const projectIntentFrame = (intent: Locator) =>
  intent.locator('.intent-page-frame[data-intent-context="project"]');
export const storyIntentFrame = (intent: Locator) =>
  intent.locator('.intent-page-frame[data-intent-context="story"]');
export const intentModeViews = (intent: Locator) =>
  intent.getByRole("tablist", { name: "Project Intent views" });
export const storyViews = (intent: Locator) =>
  intent.getByRole("tablist", { name: "Selected story views" });

type StoryTabName = "CI comparison" | "Changes" | "Intent coverage";

// One of the selected story's views, in the row under its header.
export const storyTab = (intent: Locator, name: StoryTabName) =>
  storyViews(intent).getByRole("tab", { name, exact: true });

// The panel a selected story's view shows, named by its tab.
export const storyTabPanel = (intent: Locator, name: StoryTabName) =>
  intent.getByRole("tabpanel", { name, exact: true });

export const storyFilesReading = (intent: Locator) =>
  storyTabPanel(intent, "Changes");

export async function expectStoryTab(intent: Locator, name: StoryTabName) {
  await expect(storyTab(intent, name)).toHaveAttribute("aria-selected", "true");
}

export async function chooseStoryTab(intent: Locator, name: StoryTabName) {
  await storyTab(intent, name).click();
  await expectStoryTab(intent, name);
}

// Reach the file browser without selecting a location, folder or file.
export const browseStoryFiles = (intent: Locator) =>
  chooseStoryTab(intent, "Changes");

type IntentModeName = "CI status" | "Optimization Candidates";

// One of Project Intent's views.
export function intentModeTab(intent: Locator, name: IntentModeName) {
  return intentModeViews(intent).getByRole("tab", { name, exact: true });
}

export async function expectIntentModeChosen(
  intent: Locator,
  name: IntentModeName,
) {
  await expect(intentModeTab(intent, name)).toHaveAttribute(
    "aria-selected",
    "true",
  );
}

// Choose Optimization Candidates: the record fills Intent's content area and
// the locations browser is gone.
export async function chooseOptimizationCandidates(intent: Locator) {
  await intentModeTab(intent, "Optimization Candidates").click();
  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expect(filesColumn(intent)).toBeHidden();
}

// Hide files / Show files for the locations column: in Project Intent's strip
// on CI status, or ending a selected story's view row on Changes.
export const filesToggle = (intent: Locator) =>
  intent
    .locator(".intent-page-tabbar")
    .getByRole("button", { name: /^(Hide|Show) files$/ });

// The toggle names what it does and states whether the column is shown.
export async function expectFilesShown(intent: Locator, shown: boolean) {
  const toggle = filesToggle(intent);
  await expect(toggle).toHaveText(shown ? "Hide files" : "Show files");
  await expect(toggle).toHaveAttribute("aria-expanded", String(shown));
  const column = filesColumn(intent);
  await expect(column).toHaveAttribute(
    "id",
    (await toggle.getAttribute("aria-controls")) ?? "",
  );
  if (shown) await expect(column).toBeVisible();
  else await expect(column).toBeHidden();
}
