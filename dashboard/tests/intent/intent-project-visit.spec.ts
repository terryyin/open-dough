import { fileSource, sourceFile } from "../intentCodeBrowsePage.ts";
// Project Intent visits (../../src/IntentPerspective.tsx, ../../src/IntentPage.tsx)
// keep the selected story and each context's file, Proof/Purpose and scroll.
// Project tests read published text and trunk CI; returning restores the
// candidate's keyboard focus without rereading, then the story's reading.
// Selection transitions: ./intent-project-visit-selection.spec.ts.
// CI follow cost during visits: ../../../e2e/intent/intent-project-visit-ci.spec.ts.
// No-story landing: ./intent-ci-status-homepage.spec.ts.

import { testOptimizationCandidatesPath } from "../../src/testOptimizationCandidatesPath.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciPanel } from "../intentCiStatusPage.ts";
import { projectReads } from "../intentProjectVisitPage.ts";
import {
  backToStory,
  candidatesRecord,
  chooseOptimizationCandidates,
  expectIntentModeChosen,
  intentModeTab,
  openProjectIntent,
  returnToStory,
  filesColumn,
  intentPageFrame,
} from "../intentModePage.ts";
import {
  fileReadingTab,
  intentReadingScroll,
  proofRegion,
  scrollIntentReadingHalfway,
} from "../intentPerspectivePage.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectStoryTab,
  intentFile,
  selectTakenStoryInIntent,
  intentDiffReading,
} from "../support/intentStoryPage.ts";
import {
  changed,
  changeWithDeepSpec,
  deepSpec,
} from "../support/intentStoryWorktree.ts";
import { writeAt } from "../support/storyReviewWorktree.ts";

// The spec the story modifies, which the trunk's record names as a candidate.
const candidatePath = "dashboard/tests/a.spec.ts";

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
    await expect(intentDiffReading(intent).code).toHaveAttribute(
      "aria-busy",
      "false",
    );
    const offset = await scrollIntentReadingHalfway(intent);
    await openProjectIntent(intent);
    await expect(intent).toHaveAttribute("data-selected-story", selected ?? "");
    await expect(intentPageFrame(intent)).toHaveAttribute(
      "data-intent-context",
      "project",
    );
    await expect(
      intent.getByRole("region", { name: "Project Intent", exact: true }),
    ).toBeVisible();
    await expectIntentModeChosen(intent, "CI status");
    await expect(ciPanel(intent)).toContainText("CI status of main");
    await expect(filesColumn(intent)).toBeVisible();
    await returnToStory(intent);
    await expectStoryTab(intent, "Changed tests");
    await expect(intentFile(intent, deepSpec)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });

  await intentFile(intent, changed.modified).click();
  await expect(intentDiffReading(intent).name).toHaveText(changed.modified);
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
    await sourceFile(entry, candidatePath).click();
    await expectIntentModeChosen(intent, "CI status");
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const source = fileSource(intent, candidatePath);
    await expect(source).toContainText("a 11");
    await expect(source).not.toContainText("more");
    await expect(intentDiffReading(intent).container).toHaveCount(0);
    await expect(intentFile(intent, candidatePath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
    await expect(intentDiffReading(intent).name).toHaveText(changed.modified);
  });

  await test.step("Project Intent keeps its own file, and CI status by keyboard returns home", async () => {
    await openProjectIntent(intent);
    await expectIntentModeChosen(intent, "Optimization Candidates");
    const ciTab = intentModeTab(intent, "CI status");
    await intentModeTab(intent, "Optimization Candidates").press("ArrowLeft");
    await expect(ciTab).toBeFocused();
    await expect(intentFile(intent, candidatePath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
