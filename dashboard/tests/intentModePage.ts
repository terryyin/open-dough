// Intent's reading-mode strip under the banner (../src/IntentModeTabs.tsx)
// and the Test Optimization Candidates record it shows.

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

type IntentModeName = "Intent" | "Optimization Candidates";

// One of Intent's reading-mode tabs under the banner.
export function intentModeTab(intent: Locator, name: IntentModeName) {
  return intent
    .getByRole("tablist", { name: "Intent reading" })
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

// The strip's Hide files / Show files toggle for the locations column.
export const intentModeBar = (intent: Locator) =>
  intent.locator(".intent-mode-bar");
export const filesToggle = (intent: Locator) =>
  intentModeBar(intent).getByRole("button", { name: /^(Hide|Show) files$/ });

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
