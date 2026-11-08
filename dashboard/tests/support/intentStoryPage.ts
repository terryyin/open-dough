// What the story-scoped Intent journeys (../intent-story-changes*.spec.ts)
// read of the page: the selected story's header and views, the contains-changes
// background, the "Selected story only" toggle, and a changed file's diff in
// Intent's Purpose beside the same file's diff in Review changes. A row's
// change-kind style: ./changeKindStyle.ts.

import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import { parts } from "../dashboardPage.ts";
import { purposeRegion } from "../intentPerspectivePage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expect } from "../dashboardTest.ts";
import {
  changeIntentTests,
  publishIntentTrunk,
} from "./intentStoryWorktree.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

// Story A taken in Story Branch Mode by a real start, its worktree changing
// the tests Intent publishes, or as `change` changes it; its Taken card
// selected by an empty-area click, and Intent shown. Intent opens the story
// at its CI comparison; this then chooses Changed tests, which the journeys
// read. The baseline is the claim, where the worktree meets trunk; the head
// is the worktree's last commit.
export async function selectTakenStoryInIntent(
  page: Page,
  origin: StartOrigin,
  change: (workspace: string) => void = changeIntentTests,
  // Whether the published trunk follows the origin's main as it moves.
  follows = false,
) {
  publishIntentTrunk(origin.project);
  await origin.takenByAnotherAgent();
  const workspace = path.join(origin.machine, "another-agent-workspace");
  change(workspace);
  await openBacklog(page, origin, follows);
  const { taken, intentChoice, intent } = parts(page);
  const card = taken.getByRole("article", { name: "Story A" });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changed tests");
  return {
    card,
    intent,
    workspace,
    baseline: (await origin.originGit("rev-parse", "main")).trim(),
    head: git(workspace, "rev-parse", "HEAD"),
  };
}

// The selected story's persistent header above its views.
export const storySummary = (intent: Locator) =>
  intent.getByRole("region", { name: "Selected story", exact: true });

// The header's title, which names the story in full.
export const storyTitle = (intent: Locator) =>
  storySummary(intent).getByRole("heading", { level: 2 });

type StoryTabName = "CI comparison" | "Changed tests" | "Intent coverage";

// One of the selected story's views, in the row under its header.
export const storyTab = (intent: Locator, name: StoryTabName) =>
  intent
    .getByRole("tablist", { name: "Selected story views" })
    .getByRole("tab", { name, exact: true });

export async function expectStoryTab(intent: Locator, name: StoryTabName) {
  await expect(storyTab(intent, name)).toHaveAttribute("aria-selected", "true");
}

export async function chooseStoryTab(intent: Locator, name: StoryTabName) {
  await storyTab(intent, name).click();
  await expectStoryTab(intent, name);
}

// The count of changed files outside Intent locations ending the header's
// title line, and the name and hover text that explain it.
export const outsideCount = (intent: Locator) =>
  storySummary(intent)
    .locator(".intent-story-title-line")
    .getByRole("button", { name: /outside Intent locations/ });
export const outsideName = (count: number) =>
  `${count} changed file${count === 1 ? "" : "s"} outside Intent locations — open Review changes`;

// The count shows only the number, explained by its name and hover text, on
// the title's line; the sentence it replaced is gone.
export async function expectOutsideCount(intent: Locator, count: number) {
  const button = outsideCount(intent);
  await expect(button).toHaveText(String(count));
  await expect(button).toHaveAccessibleName(outsideName(count));
  await expect(button).toHaveAttribute("title", outsideName(count));
  await expect(intent.getByText(/shown in Review changes/)).toHaveCount(0);
  const line = await storyTitle(intent).boundingBox();
  const box = await button.boundingBox();
  if (line === null || box === null) throw new Error("Not laid out.");
  const middle = box.y + box.height / 2;
  expect(middle).toBeGreaterThan(line.y);
  expect(middle).toBeLessThan(line.y + line.height);
}

// What the header says beyond the title: the identity, and the revisions or
// full explanation of the comparison. Nothing collapses it.
export async function storyHeaderDetail(intent: Locator) {
  const header = storySummary(intent);
  await expect(header).toBeVisible();
  await expect(header.getByRole("button", { expanded: false })).toHaveCount(0);
  return header;
}

// The "Selected story only" toggle.
export const storyOnly = (intent: Locator) =>
  intent.getByRole("checkbox", { name: "Selected story only", exact: true });

// A file's control in Intent's tree, by its accessible name: its full path,
// or for a changed file its kind and path as Review changes names it. A story
// comparison may append Proof's Counts and after-side words after a comma.
export const intentFile = (intent: Locator, name: string) =>
  intent.locator(".intent-locations").getByRole("button", {
    name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:,|$)`),
  });

// A folder's toggle in Intent, by the folder's name and whether it is open.
export const folderToggle = (intent: Locator, name: string, open: boolean) =>
  intent.getByRole("button", {
    name: `${open ? "Collapse" : "Expand"} ${name}`,
    exact: true,
  });

// A folder's row (toggle and name) in Intent, and the list item it heads,
// which carries the contains-changes mark.
export const folderRow = (intent: Locator, name: string) =>
  intent.locator(".story-review-folder-row").filter({
    has: intent
      .page()
      .locator(`button.story-review-folder[aria-label$=" ${name}"]`),
  });

export const folderItem = (intent: Locator, name: string) =>
  folderRow(intent, name).locator("xpath=..");

// One configured location's group in Intent.
export const locationGroup = (intent: Locator, locationPath: string) =>
  intent.locator(
    `section.intent-location:has(> .intent-location-header > [aria-controls="${intentLocationIdPrefix(locationPath)}-body"])`,
  );

export const background = (row: Locator) =>
  row.evaluate((element) => getComputedStyle(element).backgroundColor);

// A changed file's diff in Intent's Purpose, as its lines read.
export async function intentDiff(intent: Locator, name: string) {
  await intentFile(intent, name).click();
  const purpose = purposeRegion(intent);
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(name);
  const code = purpose.locator(".story-review-code");
  await expect(code).toBeVisible();
  // Read once its omitted context is known, so the gaps it offers show.
  await expect(code).toHaveAttribute("aria-busy", "false");
  return code.innerText();
}

// The same file's diff in Review changes, opened from Intent's count of
// changed files outside its locations.
export async function reviewDiff(page: Page, name: string) {
  const review = page.getByRole("region", { name: "Story review" });
  await review
    .locator(".story-review-files")
    .getByRole("button", { name, exact: true })
    .click();
  const diff = review.getByRole("region", { name });
  const code = diff.locator(".story-review-code");
  await expect(code).toBeVisible();
  // Read once its omitted context is known, so the gaps it offers show.
  await expect(code).toHaveAttribute("aria-busy", "false");
  return code.innerText();
}

// Opens Review changes from the header's count outside Intent locations,
// leaving the header in place.
export async function openReviewFromIntent(page: Page, intent: Locator) {
  await outsideCount(intent).click();
  await expect(storyTitle(intent)).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Story review" })
      .locator(".story-review-files"),
  ).toBeVisible();
}
