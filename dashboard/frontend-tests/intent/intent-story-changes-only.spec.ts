import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { intentBrowser, scopeToggle } from "./intent-browser-page.ts";
import {
  changed,
  initialRevision,
  keptPath,
  modifiedPath,
  openStoryChanges,
  otherPath,
  productPath,
  storyB,
} from "./intent-story-changes-fixtures.ts";
import { chooseWholeProject } from "./intent-recent-stories-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";

async function showsStoryExpansion() {
  await expect
    .element(scopeToggle("dashboard/tests"))
    .toHaveAttribute("aria-expanded", "true");
  await expect
    .element(scopeToggle("tests"))
    .toHaveAttribute("aria-expanded", "false");
  for (const folder of ["arriving", "boundary", "out"])
    await expect
      .element(scopeToggle(folder))
      .toHaveAttribute("aria-expanded", "true");
}

const changedInFirstLocation = [
  changed.modified,
  changed.added,
  changed.deleted,
  changed.into,
  changed.outOf,
];

test("Changes only starts on and lists just the story's changed paths; off lists the revision with its deletions and is kept across leaving Intent", async () => {
  const mounted = await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeChecked();
  await showsStoryExpansion();
  for (const name of [
    ...changedInFirstLocation,
    changed.product,
    changed.notes,
  ])
    await expect.element(story.file(name)).toBeVisible();
  for (const name of [keptPath, otherPath])
    await expect.element(story.file(name)).not.toBeInTheDocument();
  await expect.element(scopeToggle("other")).not.toBeInTheDocument();
  await expect.element(story.noMatch).not.toBeInTheDocument();

  const file = story.file(changed.modified);
  await file.click();
  await expect.poll(story.diffName).toBe(changed.modified);
  await story.chooseTab("Intent coverage");
  await expect
    .element(page.getByRole("tabpanel", { name: "Intent coverage" }))
    .toBeVisible();
  await expect.element(file).toHaveAttribute("aria-pressed", "false");
  await file.click();
  await expect.poll(story.diffName).toBe(changed.modified);
  await expect.element(story.changesOnly).toBeChecked();

  await story.changesOnly.click();
  await expect.element(story.changesOnly).not.toBeChecked();
  await expect.element(story.file(keptPath)).toBeVisible();
  for (const name of changedInFirstLocation)
    await expect.element(story.file(name)).toBeVisible();

  await mounted.showDevelopment();
  await mounted.showIntent();
  await story.browseFiles();
  await expect.element(story.changesOnly).not.toBeChecked();
  await expect.element(story.file(keptPath)).toBeVisible();

  await mounted.selectStory(storyB.identity, storyB.title);
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeChecked();
  await expect
    .element(story.changesOnly)
    .toHaveAccessibleDescription("Not applied: no comparison is available.");

  await mounted.selectStoryA();
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeChecked();
  await expect.element(story.file(keptPath)).not.toBeInTheDocument();
});

test("an open untouched file stays open, not called missing, when Changes only hides it", async () => {
  await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.changesOnly.click();
  await story.file(keptPath).click();
  await expect.poll(story.readingShown).toBe(true);
  await story.changesOnly.click();
  await expect.element(story.file(keptPath)).not.toBeInTheDocument();
  await expect.poll(story.readingShown).toBe(true);
  await expect.poll(story.readingText).toContain(keptPath);
  await expect.poll(story.readingText).not.toContain("is not in revision");
});

test("a product-only comparison lists just that file, and an empty comparison says no changes match", async () => {
  let review = makeMe.aStoryReview.modifying(productPath).please();
  await openStoryChanges({ review: () => Promise.resolve(review) });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.poll(story.revisions).toContain("Published story branch");
  await expect.element(story.changesOnly).toBeChecked();
  await expect.element(story.file(changed.product)).toBeVisible();
  await expect.element(story.noMatch).not.toBeInTheDocument();
  await expect.element(scopeToggle("dashboard/tests")).not.toBeInTheDocument();

  await story.changesOnly.click();
  await expect
    .element(scopeToggle("dashboard/tests"))
    .toHaveAttribute("aria-expanded", "false");

  review = makeMe.aStoryReview.please();
  await story.refresh();
  await expect.element(story.file(changed.product)).not.toBeInTheDocument();
  await story.changesOnly.click();
  await expect.element(story.noMatch).toBeVisible();
  await expect.element(story.changesOnly).toBeChecked();

  await story.changesOnly.click();
  await expect.element(story.noMatch).not.toBeInTheDocument();
  await scopeToggle("dashboard/tests").click();
  await story.file(modifiedPath).click();
  await intentFileReading(modifiedPath).shows("a 11");
});

test("Changes only stays on through a new trunk revision and tab changes, and Whole project can read the latest trunk", async () => {
  const mounted = await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeChecked();
  await showsStoryExpansion();

  const later = "e5".repeat(20);
  const showLatest = page.getByRole("button", {
    name: "Show latest",
    exact: true,
  });
  await mounted.refreshWork(later);
  await expect.element(showLatest).not.toBeInTheDocument();
  await expect.element(story.changesOnly).toBeChecked();
  await showsStoryExpansion();

  await story.chooseTab("Intent coverage");
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeChecked();
  await showsStoryExpansion();
  await expect.element(story.file(otherPath)).not.toBeInTheDocument();

  await chooseWholeProject();
  await intentBrowser().isAt(initialRevision);
  await showLatest.click();
  await intentBrowser().isAt(later);
  expect(mounted.locationRevisions.at(-1)).toBe(later);
  await expect.element(showLatest).not.toBeInTheDocument();
});
