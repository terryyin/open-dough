// A visit from a selected story to Project Intent and back
// (../../src/IntentPerspective.tsx, ../../src/IntentProjectView.tsx): the
// story's header leads to Project Intent, which judges the trunk while the
// story stays selected and opens a candidate's test, one the story also
// changes, at its published text in Project Intent's own reading; returning
// to the candidate gives it the keyboard without reading the record again,
// and Back to selected story shows the story's Changed tests with its file,
// Proof or Purpose and scroll as they were. Project Intent's own file is kept
// for its next visit, and activating CI status by keyboard returns it home.
// Each new selection, even one cleared and selected again while Intent is
// hidden, opens the story at CI comparison, and clearing the story lands on
// Project Intent's CI status, whichever view the last visit ended on.
// Without a story Project Intent is Intent's landing:
// ./intent-ci-status-homepage.spec.ts.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { testOptimizationCandidatesPath } from "../../src/testOptimizationCandidatesPath.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { ciPanel } from "../intentCiStatusPage.ts";
import {
  backToStory,
  candidatesRecord,
  chooseOptimizationCandidates,
  expectIntentModeChosen,
  intentModeTab,
  openProjectIntent,
  returnToStory,
} from "../intentModePage.ts";
import {
  fileReadingTab,
  intentReadingScroll,
  proofRegion,
  purposeRegion,
  scrollIntentReadingHalfway,
} from "../intentPerspectivePage.ts";
import { parts } from "../dashboardPage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectStoryTab,
  intentFile,
  selectTakenStoryInIntent,
  storySummary,
} from "../support/intentStoryPage.ts";
import {
  changed,
  changeWithDeepSpec,
  deepSpec,
} from "../support/intentStoryWorktree.ts";
import { writeAt } from "../support/storyReviewWorktree.ts";

// The spec the story modifies, which the trunk's record names as a candidate.
const candidatePath = "dashboard/tests/a.spec.ts";

// The page's reads, from now on, of the candidates record and of published
// test text.
function projectReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const path = url.searchParams.get("path") ?? "";
    if (url.searchParams.get("intent") === "test-optimization-candidates")
      reads.push("candidates");
    else if (path.startsWith("dashboard/tests/")) reads.push(`text ${path}`);
  });
  return reads;
}

test("a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  writeAt(
    origin.project,
    testOptimizationCandidatesPath,
    makeMe.aTestOptimizationCandidatesRecord
      .pending("a-spec-cost", `\`${candidatePath}\``)
      .please(),
  );
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeWithDeepSpec,
  );
  const selected = await intent.getAttribute("data-selected-story");
  expect(selected).not.toBeNull();

  await test.step("the story's scrolled Purpose returns after a visit that shows trunk CI", async () => {
    await intentFile(intent, deepSpec).click();
    await expect(
      purposeRegion(intent).locator(".story-review-code"),
    ).toHaveAttribute("aria-busy", "false");
    const offset = await scrollIntentReadingHalfway(intent);
    await openProjectIntent(intent);
    await expect(intent).toHaveAttribute("data-selected-story", selected ?? "");
    await expect(storySummary(intent)).toHaveCount(0);
    await expectIntentModeChosen(intent, "CI status");
    await expect(ciPanel(intent)).toContainText("CI status of main");
    await expect(intent.locator(".intent-locations")).toBeVisible();
    await returnToStory(intent);
    await expectStoryTab(intent, "Changed tests");
    await expect(intentFile(intent, deepSpec)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });

  await intentFile(intent, changed.modified).click();
  await expect(
    purposeRegion(intent).locator(".intent-story-diff-name"),
  ).toHaveText(changed.modified);
  await fileReadingTab(intent, "Proof").click();
  const storyCiLink = proofRegion(intent).getByRole("button", {
    name: "View story CI comparison",
  });
  await expect(storyCiLink).toBeVisible();

  await openProjectIntent(intent);
  const reads = projectReads(page);
  await chooseOptimizationCandidates(intent);
  const record = candidatesRecord(intent);
  const entry = record.getByRole("article", { name: "a-spec-cost" });
  await expect(record).toHaveAttribute("data-candidates-reads", /^[1-9]\d*$/);
  const readsBefore = await record.getAttribute("data-candidates-reads");

  await test.step("the candidate's test reads as published, not as the story's diff", async () => {
    await entry
      .getByRole("button", { name: candidatePath, exact: true })
      .click();
    await expectIntentModeChosen(intent, "CI status");
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const source = intent.getByLabel(`${candidatePath} source`);
    await expect(source).toContainText("a 11");
    await expect(source).not.toContainText("more");
    await expect(intent.locator(".intent-story-diff")).toHaveCount(0);
    await expect(
      intent
        .locator(".intent-locations")
        .getByRole("button", { name: candidatePath, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await fileReadingTab(intent, "Proof").click();
    await expect(proofRegion(intent)).toBeVisible();
    await expect(
      intent.getByRole("button", { name: "View story CI comparison" }),
    ).toHaveCount(0);
  });

  await test.step("returning reaches the candidate first, with the keyboard, without reading again", async () => {
    await intentModeTab(intent, "Optimization Candidates").click();
    await expect(entry).toBeFocused();
    await expect(record).toHaveAttribute(
      "data-candidates-reads",
      readsBefore ?? "",
    );
  });

  await test.step("then the story shows its file's Proof as it was", async () => {
    await returnToStory(intent);
    await expectStoryTab(intent, "Changed tests");
    await expect(intentFile(intent, changed.modified)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(storyCiLink).toBeVisible();
    await fileReadingTab(intent, "Purpose").click();
    await expect(
      purposeRegion(intent).locator(".intent-story-diff-name"),
    ).toHaveText(changed.modified);
  });

  await test.step("Project Intent keeps its own file, and CI status by keyboard returns home", async () => {
    await openProjectIntent(intent);
    await expectIntentModeChosen(intent, "Optimization Candidates");
    const ciTab = intentModeTab(intent, "CI status");
    await intentModeTab(intent, "Optimization Candidates").press("ArrowLeft");
    await expect(ciTab).toBeFocused();
    await expect(
      intent
        .locator(".intent-locations")
        .getByRole("button", { name: candidatePath, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(proofRegion(intent)).toBeVisible();
    await ciTab.press("Enter");
    await expect(ciPanel(intent)).toContainText("CI status of main");
    await expect(fileReadingTab(intent, "Proof")).toHaveCount(0);
    await backToStory(intent).press("Enter");
    await expectStoryTab(intent, "Changed tests");
    await expect(intentFile(intent, changed.modified)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  // The record and the candidate's published text, each read once.
  expect(reads).toEqual(["candidates", `text ${candidatePath}`]);
});

test("each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates", async ({
  page,
  origin,
}) => {
  const { card, intent } = await selectTakenStoryInIntent(page, origin);
  await expectStoryTab(intent, "Changed tests");
  await openProjectIntent(intent);
  await chooseOptimizationCandidates(intent);
  const { development, intentChoice } = parts(page);
  const heading = card.getByRole("heading", { level: 3 });

  await test.step("cleared and selected again while Intent is hidden: the story's CI comparison", async () => {
    await development.click();
    await heading.click();
    await expectSelected(card, false);
    await heading.click();
    await expectSelected(card, true);
    await intentChoice.click();
    await expect(storySummary(intent)).toBeVisible();
    await expectStoryTab(intent, "CI comparison");
    await expect(backToStory(intent)).toHaveCount(0);
    // Project Intent, visited for this new selection, opens on CI status.
    await openProjectIntent(intent);
    await expectIntentModeChosen(intent, "CI status");
    await chooseOptimizationCandidates(intent);
  });

  await test.step("cleared after a visit on Optimization Candidates: Project Intent's CI status", async () => {
    await development.click();
    await heading.click();
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(storySummary(intent)).toHaveCount(0);
    await expectIntentModeChosen(intent, "CI status");
    await expect(ciPanel(intent)).toContainText("CI status of main");
  });
});
