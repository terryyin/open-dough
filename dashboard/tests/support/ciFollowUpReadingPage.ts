// The retained original feeds the existing Summary and file Proof navigation.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./pageTest.ts";
import { parts } from "../dashboardPage.ts";
import { chooseStoryTab, intentFile, storyOnly } from "./intentStoryPage.ts";
import {
  expandIntentGroup,
  intentLocationName,
  fileReadingTab,
  proofRegion,
} from "../intentPerspectivePage.ts";
import { attemptLink, evidenceLabels } from "../ciEvidenceLabelsPage.ts";
import { summaryRegion } from "../intentScopeProofPage.ts";
import { priorBuildReferenceReading } from "../priorBuildReferencePage.ts";

export const ciFollowUpCard = (page: Page, title: string) =>
  page.getByRole("article", { name: title, exact: true });
export const ciFollowUpWarning = (card: Locator) =>
  card.getByLabel("CI timing follow-up");
const followUpLink = (card: Locator) =>
  card.getByRole("link", {
    name: "Review original, repeat and saved reference",
  });

// Pointer and keyboard are alternative entries; the scenario names its input.
export async function openCiFollowUp(
  card: Locator,
  using: "pointer" | "keyboard",
) {
  const route = followUpLink(card);
  if (using === "keyboard") {
    await route.focus();
    await card.page().keyboard.press("Enter");
  } else await route.click();
}

// Read retained evidence without selecting or refreshing it.
export function retainedCiFollowUpReading(page: Page) {
  const { intent, development, intentChoice } = parts(page);
  const comparison = page.getByRole("region", {
    name: "Retained CI follow-up comparison",
  });
  return {
    intent,
    development,
    intentChoice,
    comparison,
    original: comparison.getByRole("region", { name: "Original CI attempt" }),
    repeat: comparison.getByRole("region", { name: "Repeat CI attempt" }),
    reference: priorBuildReferenceReading(comparison),
    referenceDisclosure: comparison.locator("summary"),
    refresh: page.getByRole("button", { name: "Refresh retained follow-up" }),
  };
}

export async function expectOriginalProofNavigation(
  page: Page,
  expected: {
    readonly location: string;
    readonly file: string;
    readonly originalAttempt: string;
    readonly repeatAttempt: string;
    readonly originalUrl: string;
    readonly passedCases: string;
    readonly absentFraming: string;
  },
) {
  const { intent } = parts(page);
  await chooseStoryTab(intent, "Changed tests");
  if (await storyOnly(intent).isChecked()) await storyOnly(intent).uncheck();
  await intentLocationName(intent, expected.location).click();
  const summary = summaryRegion(intent);
  await expect(
    attemptLink(evidenceLabels(summary), expected.originalAttempt),
  ).toHaveAttribute("href", expected.originalUrl);
  await expect(attemptLink(summary, expected.repeatAttempt)).toHaveCount(0);
  await expect(summary).toContainText(expected.passedCases);
  await expect(evidenceLabels(summary)).not.toContainText(
    expected.absentFraming,
  );
  await expandIntentGroup(intent, expected.location);
  await intentFile(intent, expected.file).click();
  await fileReadingTab(intent, "Proof").click();
  await expect(
    attemptLink(evidenceLabels(proofRegion(intent)), expected.originalAttempt),
  ).toBeVisible();
  await expect(
    attemptLink(proofRegion(intent), expected.repeatAttempt),
  ).toHaveCount(0);
  for (const link of await attemptLink(
    proofRegion(intent),
    expected.originalAttempt,
    { exact: true },
  ).all())
    await expect(link).toHaveAttribute("href", expected.originalUrl);
  await chooseStoryTab(intent, "CI comparison");
}
