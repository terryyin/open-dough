import { fileBrowser } from "./reviewContextLine.ts";
import { listedFile, fileDiff } from "./reviewTreeRows.ts";
import { codePane, expectContextRead } from "./reviewPanes.ts";
import { reviewRegion, showReviewDetails } from "./reviewControls.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  filesColumn,
  storySummary,
  storyViews,
} from "../intentModePage.ts";
// What the story-scoped Intent journeys (../intent-story-changes*.spec.ts)
// read of the page: the selected story's header and views, the contains-changes
// background, the "Selected story only" toggle, and a changed file's diff in
// Intent's Purpose beside the same file's diff in Review changes. Scenarios
// that read several of these hold `intentStory`. Arranging the taken story:
// ./selectTakenStoryInIntent.ts. A row's change-kind style: ./changeKindStyle.ts.

import { expect, type Locator, type Page } from "@playwright/test";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import { storyReviewWaitMs } from "../../src/storyReviewContract.ts";
import { purposeRegion } from "../intentPerspectivePage.ts";
import { expectReviewRead } from "./reviewRead.ts";

// Intent says it is reading the selected story's changes from the story's
// selection until it shows the answer, which the boundary may take up to its
// read bound to give.
export const expectStoryComparisonRead = (intent: Locator) =>
  expect(intent.getByText("Reading the story's changes…")).toHaveCount(0, {
    timeout: storyReviewWaitMs,
  });

// Preserve the established API while the shared native root lives with page modes.
export {
  storySummary,
  storyViews,
  storyTab,
  expectStoryTab,
  chooseStoryTab,
} from "../intentModePage.ts";

// Story-specific readings within the persistent selected-story header.
export function storyHeaderReading(intent: Locator) {
  const region = storySummary(intent);
  return {
    region,
    crumb: region.locator(".intent-story-crumb"),
    leadingControl: region.locator(":scope > *").first().getByRole("button"),
    identity: region.locator(".record-identity"),
    revisions: region.locator(".intent-story-revisions"),
    status: region.getByRole("status"),
    done: region.locator(".intent-story-done"),
  };
}

// The header's title, which names the story in full.
export const storyTitle = (intent: Locator) =>
  storySummary(intent).getByRole("heading", { level: 2 });

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
const fileName = (name: string) =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:,|$)`);
export const intentFile = (intent: Locator, name: string) =>
  filesColumn(intent).getByRole("button", { name: fileName(name) });

// The story's changed files outside every location, after the locations.
export const outsideGroup = (intent: Locator) =>
  filesColumn(intent).getByRole("region", {
    name: "Outside Intent locations",
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

// Read the already selected diff without selecting a file or changing its place.
export function intentDiffReading(intent: Locator) {
  const purpose = purposeRegion(intent);
  return {
    container: intent.locator(".intent-story-diff"),
    name: purpose.locator(".story-review-diff-heading h3"),
    code: codePane(purpose),
  };
}

async function expectDiffReady(code: Locator) {
  await expect(code).toBeVisible();
  // Omitted context must be known before its gaps are read.
  await expectContextRead(code);
}
export const readIntentDiff = (intent: Locator) =>
  intentDiffReading(intent).code.innerText();

// The selecting operation keeps its original action, then delegates reading.
export async function intentDiff(intent: Locator, name: string) {
  await intentFile(intent, name).click();
  await expect(intentDiffReading(intent).name).toHaveText(name);
  await expectDiffReady(intentDiffReading(intent).code);
  return readIntentDiff(intent);
}

// The same file's diff in Review changes, opened from Intent's count of
// changed files outside its locations.
export async function reviewDiff(page: Page, name: string) {
  const review = reviewRegion(page);
  await listedFile(fileBrowser(review), name, { exact: true }).click();
  const diff = fileDiff(review, name);
  const code = codePane(diff);
  await expectDiffReady(code);
  return code.innerText();
}

// Opens Review changes from the header's count outside Intent locations,
// leaving the header in place.
export async function openReviewFromIntent(page: Page, intent: Locator) {
  await outsideCount(intent).click();
  await expect(storyTitle(intent)).toBeVisible();
  const review = reviewRegion(page);
  await expectReviewRead(review);
  await expect(fileBrowser(review)).toBeVisible();
  return showReviewDetails(review);
}

// The selected story in Intent. Diff text comes back for the scenario to
// compare; `background` stays a measurement the scenario compares itself.
export function intentStory(intent: Locator) {
  return {
    summary: storySummary(intent),
    header: storyHeaderReading(intent),
    title: storyTitle(intent),
    views: storyViews(intent),
    outsideCount: outsideCount(intent),
    diffReading: intentDiffReading(intent),
    storyOnly: (scope?: Locator) => storyOnly(scope ?? intent),
    file: (name: string) => intentFile(intent, name),
    folderToggle: (name: string, open: boolean) =>
      folderToggle(intent, name, open),
    folderRow: (name: string) => folderRow(intent, name),
    folderItem: (name: string) => folderItem(intent, name),
    locationGroup: (path: string) => locationGroup(intent, path),
    outside: outsideGroup(intent),
    groups: filesColumn(intent).locator(":scope section"),
    outsideFile: (name: string) =>
      outsideGroup(intent).getByRole("button", { name: fileName(name) }),
    // An outside file's row, which carries its change marker.
    outsideRow: (name: string) =>
      outsideGroup(intent)
        .getByRole("button", { name: fileName(name) })
        .locator("xpath=.."),
    headerDetail: () => storyHeaderDetail(intent),
    expectOutsideCount: (count: number) => expectOutsideCount(intent, count),
    chooseTab: (name: Parameters<typeof chooseStoryTab>[1]) =>
      chooseStoryTab(intent, name),
    expectTab: (name: Parameters<typeof expectStoryTab>[1]) =>
      expectStoryTab(intent, name),
    expectComparisonRead: () => expectStoryComparisonRead(intent),
    diff: (name: string) => intentDiff(intent, name),
    openReview: () => openReviewFromIntent(intent.page(), intent),
    reviewDiff: (name: string) => reviewDiff(intent.page(), name),
  };
}
