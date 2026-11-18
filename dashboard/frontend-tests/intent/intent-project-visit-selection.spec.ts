import { selectTakenStoryInIntent } from "../../test-support/support/frontendIntentVisits.ts";
// Selection changes after Project Intent visits (../../src/IntentPerspective.tsx):
// every new selection opens CI comparison, even when cleared and selected again
// while Intent is hidden. Clearing selection opens Project Intent's CI status,
// whichever view the previous visit ended on.

import { ciPanel } from "../../test-support/intentCiStatusPage.ts";
import {
  backToStory,
  chooseOptimizationCandidates,
  expectIntentModeChosen,
  openProjectIntent,
  intentPageFrame,
} from "../../test-support/intentModePage.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { expectSelected } from "../../test-support/storyCardSelection.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  expectStoryTab,
  storySummary,
} from "../../test-support/support/intentStoryPage.ts";

test("each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates", async ({
  page,
  frontendServices,
}) => {
  const { card, intent } = await selectTakenStoryInIntent(
    page,
    frontendServices,
  );
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
    await expect(intentPageFrame(intent)).toHaveAttribute(
      "data-intent-context",
      "story",
    );
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
    await expect(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    ).toBeVisible();
    await expect(intentPageFrame(intent)).toHaveAttribute(
      "data-intent-context",
      "project",
    );
    await expect(
      intent.getByRole("region", { name: "Project Intent", exact: true }),
    ).toBeVisible();
    await expectIntentModeChosen(intent, "CI status");
    await expect(ciPanel(intent)).toContainText("CI status of main");
  });
});
