// What a page reads of automatic CI follow-up: a landing's Done card and its
// warning, the retained comparison the card opens, and the original's proof
// in the existing Summary and file Proof navigation.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./pageTest.ts";
import { ciFollowUpEndpoint } from "../../src/ciFollowUp.ts";
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
import { showColumn } from "../boardPage.ts";
import { box, expectNoSidewaysScrollIn } from "../pageLayout.ts";

export const ciFollowUpCard = (page: Page, title: string) =>
  page.getByRole("article", { name: title, exact: true });
export const ciFollowUpWarning = (card: Locator) =>
  card.getByLabel("CI timing follow-up");

// The Done card of `title` brought into view: a phone shows one Board column
// at a time, and a card in a column paged away is attached but not shown.
export async function shownCiFollowUpCard(page: Page, title: string) {
  await showColumn(page, "Recently done");
  return ciFollowUpCard(page, title);
}

// `part` reads whole across a phone: once scrolled to it shows in the window
// with both its sides inside, and neither the page nor anything inside it
// scrolls sideways.
export async function expectWholeOnPhone(part: Locator, name: string) {
  await part.scrollIntoViewIfNeeded();
  await expect(part, `${name} shown on the phone`).toBeInViewport();
  const { x, width } = await box(part);
  const sides = { left: x, right: x + width };
  const windowWidth = part.page().viewportSize()?.width ?? 0;
  expect(sides.left, `${name} whole on the phone`).toBeGreaterThanOrEqual(-0.5);
  expect(sides.right, `${name} whole on the phone`).toBeLessThanOrEqual(
    windowWidth + 0.5,
  );
  await expectNoSidewaysScrollIn(part.page(), part);
}

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

// Does `act`, which makes the page read a retained comparison, and waits for
// the dashboard's answer to that read.
async function untilComparisonAnswered(
  page: Page,
  act: () => Promise<unknown>,
) {
  const answered = page.waitForResponse((response) => {
    const read = new URL(response.url());
    return (
      read.pathname === ciFollowUpEndpoint && read.searchParams.has("identity")
    );
  });
  await act();
  await answered;
}

// Presses the comparison's own refresh.
export const refreshCiFollowUp = (page: Page) =>
  untilComparisonAnswered(page, () =>
    retainedCiFollowUpReading(page).refresh.click(),
  );

// Reloads the page on the comparison's address.
export const reloadCiFollowUp = (page: Page) =>
  untilComparisonAnswered(page, () => page.reload());

// Opens the retained comparison of `identity`'s landing at `revision` in the
// project's Intent by its address, as a reload of the card's link does.
export function gotoCiFollowUp(
  page: Page,
  baseURL: string,
  landing: { readonly identity: string; readonly revision: string },
) {
  const address = new URL(baseURL);
  address.search = new URLSearchParams({
    project: "open-dough",
    perspective: "intent",
    followUp: landing.identity,
    landing: landing.revision,
  }).toString();
  return untilComparisonAnswered(page, () => page.goto(address.toString()));
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
    "the original's proof in Summary",
  ).toHaveAttribute("href", expected.originalUrl);
  await expect(
    attemptLink(summary, expected.repeatAttempt),
    "the repeat's proof not offered in Summary",
  ).toHaveCount(0);
  await expect(summary, "the original's passed cases").toContainText(
    expected.passedCases,
  );
  await expect(evidenceLabels(summary), "no story framing").not.toContainText(
    expected.absentFraming,
  );
  await expandIntentGroup(intent, expected.location);
  await intentFile(intent, expected.file).click();
  await fileReadingTab(intent, "Proof").click();
  await expect(
    attemptLink(evidenceLabels(proofRegion(intent)), expected.originalAttempt),
    "the original's proof in the file's Proof",
  ).toBeVisible();
  await expect(
    attemptLink(proofRegion(intent), expected.repeatAttempt),
    "the repeat's proof not offered in the file's Proof",
  ).toHaveCount(0);
  for (const link of await attemptLink(
    proofRegion(intent),
    expected.originalAttempt,
    { exact: true },
  ).all())
    await expect(link, "the original's exact link").toHaveAttribute(
      "href",
      expected.originalUrl,
    );
  await chooseStoryTab(intent, "CI comparison");
}
