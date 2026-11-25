// Page selection changes in Intent (../../src/IntentPerspective.tsx):
// every new selection opens CI comparison, even when cleared and selected again
// while Intent is hidden. Clearing selection opens Project Intent's CI status,
// even after reading Optimization Candidates.
import { expect, test } from "vitest";
import { intentCandidates, intentViewTab } from "./intent-candidates-page.ts";
import { chooseWholeProject } from "./intent-recent-stories-page.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  development,
  intent,
  intentChoice,
  intentContext,
  mountProjectVisit,
  selectTakenStoryInIntent,
  story,
  storyA,
} from "./intent-project-visit-fixtures.ts";
import { boardReading as board } from "../navigation/board-reading-page.ts";

test("each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after project scope was on Optimization Candidates", async () => {
  await mountProjectVisit();
  await intentChoice.click();
  await intentCandidates().choose();
  await development.click();
  await intentChoice.click();
  await expect
    .element(intentViewTab("Optimization Candidates"))
    .toHaveAttribute("aria-selected", "true");
  await development.click();
  const card = await selectTakenStoryInIntent();
  await expect
    .element(story.viewTab("Changes"))
    .toHaveAttribute("aria-selected", "true");
  const heading = card.getByRole("heading", {
    name: storyA.title,
    exact: true,
  });

  await development.click();
  await heading.click();
  await board.expectStorySelection(card, false);
  await heading.click();
  await board.expectStorySelection(card, true);
  await intentChoice.click();
  await expect
    .element(
      intent.getByRole("region", { name: "Selected story", exact: true }),
    )
    .toBeVisible();
  await expect.poll(intentContext).toBe("story");
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await chooseWholeProject();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await expect
    .element(
      intent.getByRole("region", { name: "Selected story", exact: true }),
    )
    .not.toBeInTheDocument();
  await expect
    .element(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    )
    .toBeVisible();
  await expect.poll(intentContext).toBe("project");
  await expect
    .element(
      intent.getByRole("region", { name: "Project Intent", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await intentCiStatus().judges("main");
});
