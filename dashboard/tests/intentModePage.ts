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

type IntentModeName = "CI status" | "Optimization Candidates";

// One of Project Intent's views.
export function intentModeTab(intent: Locator, name: IntentModeName) {
  return intent
    .getByRole("tablist", { name: "Project Intent views" })
    .getByRole("tab", { name, exact: true });
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
  await expect(intent.locator(".intent-locations")).toBeHidden();
}

// From the selected story's header to Project Intent, which shows its
// heading with the keyboard on Back to selected story.
export const projectIntentLink = (intent: Locator) =>
  intent
    .getByRole("region", { name: "Selected story", exact: true })
    .getByRole("button", { name: "Project Intent", exact: true });
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
  intent.locator(
    '.intent-page-frame[data-intent-context="project"] > .intent-page-tabbar',
  );
export const storyViewBar = (intent: Locator) =>
  intent.locator(
    '.intent-page-frame[data-intent-context="story"] > .intent-page-tabbar',
  );
export const filesToggle = (intent: Locator) =>
  intent
    .locator(".intent-page-tabbar")
    .getByRole("button", { name: /^(Hide|Show) files$/ });

// The toggle names what it does and states whether the column is shown.
export async function expectFilesShown(intent: Locator, shown: boolean) {
  const toggle = filesToggle(intent);
  await expect(toggle).toHaveText(shown ? "Hide files" : "Show files");
  await expect(toggle).toHaveAttribute("aria-expanded", String(shown));
  const column = intent.locator(".intent-locations");
  await expect(column).toHaveAttribute(
    "id",
    (await toggle.getAttribute("aria-controls")) ?? "",
  );
  if (shown) await expect(column).toBeVisible();
  else await expect(column).toBeHidden();
}
