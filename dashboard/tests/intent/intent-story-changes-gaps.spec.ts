// Example 6 and a failed read: a selected story whose comparison Intent
// cannot show never reads as a story without changes. The header of an
// active story with no workspace on this machine says no comparison is
// available, and of a review read that fails says so with a retry, which
// then shows the story's changes; each gives its full explanation. Either way
// the published tree stays usable in Changed tests, without change marks, an
// outside count, or a "Selected story only" toggle, which would have no
// changes to show only; the retried read offers it, off. Without configured
// locations the header names the story, CI comparison shows its CI status
// and Changed tests the explanation; Project Intent shows main's CI status
// beside the explanation, which Optimization Candidates also shows, and Back
// to selected story returns to Changed tests. The highlighted journey:
// ./intent-story-changes.spec.ts.

import type { Locator } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { parts } from "../dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import {
  backToStory,
  chooseOptimizationCandidates,
  intentModeTab,
  openProjectIntent,
  returnToStory,
  intentPageFrame,
} from "../intentModePage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  chooseStoryTab,
  expectOutsideCount,
  expectStoryComparisonRead,
  expectStoryTab,
  intentFile,
  outsideCount,
  selectTakenStoryInIntent,
  storyHeaderDetail,
  storyOnly,
  storySummary,
  storyTitle,
  storyHeaderReading,
} from "../support/intentStoryPage.ts";
import { changed, publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { openBacklog } from "../support/sessionDialog.ts";

// The published tree shows as without a story: no change marks, no outside
// count, no toggle, no claim that nothing changed, and a file reads its
// source.
async function expectPublishedTreeUsable(intent: Locator) {
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(intent.locator("[data-contains-changes]")).toHaveCount(0);
  await expect(outsideCount(intent)).toHaveCount(0);
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await expect(
    intentFile(intent, "dashboard/tests/boundary/kept.spec.ts"),
  ).toBeVisible();
  await intentFile(intent, "dashboard/tests/a.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText("a 11");
}

test("an active story with no workspace explains that no comparison is available and leaves the tree usable", async ({
  page,
  origin,
}) => {
  publishIntentTrunk(origin.project);
  const card = await openBacklog(page, origin);
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  const scoped = storySummary(intent);
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(scoped.getByRole("status")).toHaveText(
    "No comparison is available.",
  );
  const detail = await storyHeaderDetail(intent);
  await expect(detail.locator(".intent-story-problem")).toHaveText(
    "No comparison is available for this story: no workspace on this machine holds it. Intent shows the published tree without the story's changes.",
  );
  await expect(scoped.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(storyHeaderReading(intent).revisions).toHaveCount(0);
  await chooseStoryTab(intent, "Changed tests");
  await expectPublishedTreeUsable(intent);
});

test("a failed comparison read explains itself with a retry that then shows the story's changes", async ({
  page,
  origin,
}) => {
  let failing = true;
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    async (route) => {
      if (!failing) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "The worktree could not be read." }),
      });
    },
  );
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const scoped = storySummary(intent);
  const problem = scoped.getByRole("alert");
  await expect(problem).toHaveText(
    "The story's changes could not be read. Retry",
  );
  const detail = await storyHeaderDetail(intent);
  await expect(detail.locator(".intent-story-problem")).toHaveText(
    "The worktree could not be read. Intent shows the published tree without them.",
  );
  await expect(storyHeaderReading(intent).revisions).toHaveCount(0);
  await expectPublishedTreeUsable(intent);

  failing = false;
  await problem.getByRole("button", { name: "Retry" }).click();
  await expectStoryComparisonRead(intent);
  await expect(storyHeaderReading(intent).revisions).toBeVisible();
  await expect(problem).toHaveCount(0);
  await expect(storyOnly(intent)).not.toBeChecked();
  await expectOutsideCount(intent, 2);
  await expect(intentFile(intent, changed.modified)).toBeVisible();
  await expect(intentFile(intent, changed.added)).toBeVisible();
});

test("without configured Intent locations the header names the selected story, CI comparison shows its CI status, Changed tests the explanation, and Project Intent main's CI status beside it", async ({
  page,
  origin,
}) => {
  const card = await openBacklog(page, origin);
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(
    intentPageFrame(intent).locator(":scope > *").first(),
  ).toHaveAttribute("aria-label", "Selected story");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(storyHeaderReading(intent).status).toHaveText(
    "No comparison is available.",
  );
  await expect(storyHeaderReading(intent).identity).toHaveText("SEED-A#a");
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(outsideCount(intent)).toHaveCount(0);
  await expectStoryTab(intent, "CI comparison");
  await expect(
    intent
      .getByRole("tabpanel", { name: "CI comparison" })
      .getByRole("region", { name: "CI status", exact: true }),
  ).toBeVisible();
  await chooseStoryTab(intent, "Changed tests");
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText("No intent locations are configured");
  await expect(
    intent.getByRole("region", { name: "CI status", exact: true }),
  ).toHaveCount(0);

  await openProjectIntent(intent);
  await expect(storySummary(intent)).toHaveCount(0);
  const project = intent.getByRole("tabpanel", { name: "CI status" });
  await expect(project).toContainText("No intent locations are configured");
  await expect(
    project.getByRole("heading", { name: "CI status of main", exact: true }),
  ).toBeVisible();
  await chooseOptimizationCandidates(intent);
  await expect(
    intent.getByRole("tabpanel", { name: "Optimization Candidates" }),
  ).toContainText("No intent locations are configured");
  // Back to the story's Changed tests, as it was left.
  await returnToStory(intent);
  await expectStoryTab(intent, "Changed tests");
  await expect(storySummary(intent)).toBeVisible();
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText("No intent locations are configured");

  // Cleared after a visit that ended on Optimization Candidates, the story
  // leaves Project Intent's CI status as the landing.
  await parts(page).development.click();
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, false);
  await intentChoice.click();
  await expect(storySummary(intent)).toHaveCount(0);
  await expect(backToStory(intent)).toHaveCount(0);
  await expect(intentModeTab(intent, "CI status")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const landing = intent.getByRole("tabpanel", { name: "CI status" });
  await expect(landing).toContainText("No intent locations are configured");
  await expect(
    landing.getByRole("heading", { name: "CI status of main", exact: true }),
  ).toBeVisible();
});
