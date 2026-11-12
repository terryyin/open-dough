// Project Intent's heading and views (../src/IntentPage.tsx), the
// Test Optimization Candidates record it shows, and the way between Project
// Intent and the selected story (../src/IntentPage.tsx).

import { expect, type Locator } from "@playwright/test";
import { shortRevision } from "./dashboardParts.ts";

// The candidates record region Intent shows for the selected project.
export function candidatesRecord(intent: Locator) {
  return intent.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
}

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
export const filesScroll = (intent: Locator) =>
  filesColumn(intent).evaluate((element) => element.scrollTop);

// Scroll the Files column partway and observe its actual scroll event.
export const scrollFilesHalfway = (intent: Locator) =>
  filesColumn(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({
          top: Math.floor((element.scrollHeight - element.clientHeight) / 2),
        });
      }),
  );

export const storyViews = (intent: Locator) =>
  intent.getByRole("tablist", { name: "Selected story views" });

type StoryTabName = "CI comparison" | "Changed tests" | "Intent coverage";

// One of the selected story's views, in the row under its header.
export const storyTab = (intent: Locator, name: StoryTabName) =>
  storyViews(intent).getByRole("tab", { name, exact: true });

export async function expectStoryTab(intent: Locator, name: StoryTabName) {
  await expect(storyTab(intent, name)).toHaveAttribute("aria-selected", "true");
}

export async function chooseStoryTab(intent: Locator, name: StoryTabName) {
  await storyTab(intent, name).click();
  await expectStoryTab(intent, name);
}

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

// From the selected story's header to Project Intent, which shows its
// heading with the keyboard on Back to selected story.
export const projectIntentLink = (intent: Locator) =>
  storySummary(intent).getByRole("button", {
    name: "Project Intent",
    exact: true,
  });
export const backToStory = (intent: Locator) =>
  intent.getByRole("button", { name: "Back to selected story", exact: true });

export async function openProjectIntent(intent: Locator) {
  await projectIntentLink(intent).click();
  await expect(
    intent.getByRole("heading", { name: "Project Intent", level: 2 }),
  ).toBeVisible();
  await expect(backToStory(intent)).toBeFocused();
}

// Back to the selected story, the keyboard on its way to Project Intent.
export async function returnToStory(intent: Locator) {
  await backToStory(intent).click();
  await expect(projectIntentLink(intent)).toBeFocused();
}

// Hide files / Show files for the locations column: in Project Intent's strip
// on CI status, or ending a selected story's view row on Changed tests.
export const intentModeBar = (intent: Locator) =>
  projectIntentFrame(intent).locator(":scope > .intent-page-tabbar");
export const storyViewBar = (intent: Locator) =>
  storyIntentFrame(intent).locator(":scope > .intent-page-tabbar");
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
