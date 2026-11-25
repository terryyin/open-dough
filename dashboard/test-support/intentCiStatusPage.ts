// Intent's CI status homepage journeys (../../e2e/intent/intent-ci-status.spec.ts,
// ../../e2e/intent/intent-ci-status-reads.spec.ts, ../frontend-tests/intent/intent-ci-status-homepage.spec.ts): a
// published project whose trunk the launch's base-CI rule judges
// (../server/baseCiJudgment.ts) from served CI answers, the homepage region
// in Intent's empty-selection reading, and the judgment's observed GitHub
// calls.

import { expect } from "./dashboardTest.ts";
import { type CatalogPublication } from "./catalogProjectRecords.ts";
import {
  intentModeTab,
  projectIntentFrame,
  storyTab,
} from "./intentModePage.ts";
import { publishCommittedFiles } from "./committedFiles.ts";
import type { Locator, Page } from "@playwright/test";

// The trunk's served CI and the judgment's calls live page-free beside the
// fake GitHub; journeys keep importing them from here.
export {
  judged,
  judgmentCalls,
  runUrl,
  trunkCi,
} from "./support/trunkCiAnswers.ts";

export function publishProject(
  page: Page,
  project: CatalogPublication,
  extra: Readonly<Record<string, string>> = {},
) {
  return publishCommittedFiles(page, {
    repository: project.repository,
    ref: project.ref,
    files: { ...project.files, ...extra },
  });
}

// CI status as Intent's homepage region (empty selection / beside location
// explanations).
export function ciPanel(intent: Locator) {
  return intent.getByRole("region", { name: "CI status", exact: true });
}

// The answer, freshness and outstanding read currently visible in a CI region.
export function ciStatusReading(panel: Locator) {
  return {
    state: panel.locator(".intent-ci-state"),
    freshness: panel.getByRole("status"),
    checkedTime: panel.locator("time"),
    checking: panel.locator(".intent-ci-checking"),
    gap: panel.locator(".intent-ci-gap"),
  };
}

export async function expectCiAnswer(
  panel: Locator,
  state: string,
  message?: string,
) {
  await expect(ciStatusReading(panel).state, message).toHaveText(state);
}

export async function checkCiAgain(panel: Locator) {
  await panel.getByRole("button", { name: "Check again", exact: true }).click();
}

export async function expectCiScope(panel: Locator, scope: string) {
  await expect(
    panel.getByRole("heading", { name: `CI status of ${scope}`, exact: true }),
  ).toBeVisible();
}

// Expected retained facts stay in the scenario; this performs no read or release.
export async function expectKeptCiAnswer(
  panel: Locator,
  answer: {
    readonly state: string;
    readonly freshness: string;
    readonly checking: string | true;
    readonly checkedAt?: string;
  },
) {
  const shown = ciStatusReading(panel);
  await expectCiAnswer(panel, answer.state);
  await expect(shown.freshness).toContainText(answer.freshness);
  if (answer.checkedAt !== undefined)
    await expect(shown.checkedTime).toHaveAttribute(
      "datetime",
      answer.checkedAt,
    );
  if (answer.checking === true) await expect(shown.checking).toBeVisible();
  else await expect(shown.checking).toContainText(answer.checking);
}

// The tab showing the CI status Intent reads: Project Intent's CI status
// while it shows, else the selected story's CI comparison view.
async function ciTab(intent: Locator) {
  const project = intentModeTab(intent, "CI status");
  return (await projectIntentFrame(intent).count()) > 0
    ? project
    : storyTab(intent, "CI comparison");
}

// Show the CI status Intent reads: with a selected story its CI comparison
// view, else Project Intent's CI status, so the empty-selection homepage (or
// explanation+status) shows; returns that region.
export async function chooseCiStatus(intent: Locator) {
  const tab = await ciTab(intent);
  if ((await tab.getAttribute("aria-selected")) !== "true") {
    await tab.click();
  }
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const panel = ciPanel(intent);
  await expect(panel).toBeVisible();
  return panel;
}

// Return home by directly activating the CI tab, even while it is chosen: by
// click, or by Enter or Space with it focused. In Project Intent the browsing
// selection clears; with a selected story its CI comparison shows, its
// Changes reading kept. CI status shows; returns that region.
export async function activateIntentHome(
  intent: Locator,
  how: "click" | "Enter" | "Space" = "click",
) {
  const tab = await ciTab(intent);
  if (how === "click") {
    await tab.click();
  } else {
    await tab.focus();
    await tab.press(how);
  }
  // Already chosen, so the homepage check below never clicks for us.
  await expect(tab).toHaveAttribute("aria-selected", "true");
  return chooseCiStatus(intent);
}

export async function expectChecked(panel: Locator) {
  await expect(ciStatusReading(panel).freshness).toContainText("Checked at");
  await expect(ciStatusReading(panel).checkedTime).toHaveAttribute(
    "datetime",
    /^\d{4}-\d\d-\d\dT/,
  );
}
