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
