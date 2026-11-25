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

const noTestChanges = page.getByText(
  "No test files in Intent locations changed in this story",
  { exact: true },
);

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

test("Selected story only shows just the story's changed files, expanded, and off again the whole tree with its changed folders open", async () => {
  const mounted = await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.onlyChangedFiles).not.toBeChecked();
  await scopeToggle("boundary").click();
  await scopeToggle("other").click();
  await story.onlyChangedFiles.click();
  await showsStoryExpansion();
  for (const name of changedInFirstLocation)
    await expect.element(story.file(name)).toBeVisible();
  for (const name of [keptPath, otherPath])
    await expect.element(story.file(name)).not.toBeInTheDocument();
  await expect.element(scopeToggle("other")).not.toBeInTheDocument();
  for (const name of [changed.product, changed.notes])
    await expect.element(story.file(name)).toBeVisible();
  await expect.element(noTestChanges).not.toBeInTheDocument();

  const file = story.file(changed.modified);
  await file.click();
  await expect.poll(story.diffName).toBe(changed.modified);
  await story.chooseTab("Intent coverage");
  await expect
    .element(page.getByRole("tabpanel", { name: "Intent coverage" }))
    .toBeVisible();
  await expect.element(story.pathReading).not.toBeInTheDocument();
  await expect.element(file).toHaveAttribute("aria-pressed", "false");
  await file.click();
  await expect.poll(story.diffName).toBe(changed.modified);
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await showsStoryExpansion();

  await scopeToggle("out").click();
  await story.onlyChangedFiles.click();
  await showsStoryExpansion();
  await expect.element(story.file(keptPath)).toBeVisible();
  await expect
    .element(scopeToggle("other"))
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(story.file(otherPath)).not.toBeInTheDocument();
  for (const name of changedInFirstLocation)
    await expect.element(story.file(name)).toBeVisible();

  await scopeToggle("other").click();
  await story.onlyChangedFiles.click();
  await mounted.selectStory(storyB.identity, storyB.title);
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await story.browseFiles();
  await expect
    .element(story.header.getByRole("status"))
    .toHaveTextContent("No comparison is available.");
  await expect.element(story.onlyChangedFiles).not.toBeInTheDocument();
  await expect
    .element(scopeToggle("dashboard/tests"))
    .toHaveAttribute("aria-expanded", "false");

  await mounted.selectStoryA();
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await story.browseFiles();
  await expect.element(story.onlyChangedFiles).not.toBeChecked();
  await showsStoryExpansion();
  await expect
    .element(scopeToggle("other"))
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(story.file(keptPath)).toBeVisible();
});

test("a product-only or empty comparison explains why no tests changed and keeps published source readable", async () => {
  let review = makeMe.aStoryReview.modifying(productPath).please();
  await openStoryChanges({ review: () => Promise.resolve(review) });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.poll(story.revisions).toContain("Published story branch");
  await expect.element(story.onlyChangedFiles).not.toBeChecked();
  await expect.element(story.file(changed.product)).toBeVisible();
  await expect.element(noTestChanges).not.toBeInTheDocument();
  await expect
    .element(scopeToggle("dashboard/tests"))
    .toHaveAttribute("aria-expanded", "false");
  expect(
    document.querySelectorAll(
      "li[data-folder-path='dashboard/tests'] [data-kind]",
    ),
  ).toHaveLength(0);

  await story.onlyChangedFiles.click();
  await expect.element(noTestChanges).toBeVisible();
  await expect.element(story.file(changed.product)).toBeVisible();
  await expect.element(scopeToggle("dashboard/tests")).not.toBeInTheDocument();
  await expect.element(scopeToggle("tests")).not.toBeInTheDocument();

  await story.onlyChangedFiles.click();
  await expect.element(noTestChanges).not.toBeInTheDocument();
  await expect
    .element(scopeToggle("dashboard/tests"))
    .toHaveAttribute("aria-expanded", "false");
  await expect
    .element(scopeToggle("tests"))
    .toHaveAttribute("aria-expanded", "false");

  review = makeMe.aStoryReview.please();
  await story.refresh();
  await expect.element(story.file(changed.product)).not.toBeInTheDocument();
  await story.onlyChangedFiles.click();
  await expect.element(noTestChanges).toBeVisible();

  await story.onlyChangedFiles.click();
  await scopeToggle("dashboard/tests").click();
  await story.file(modifiedPath).click();
  await intentFileReading(modifiedPath).shows("a 11");
});

test("Selected story only stays on through a new trunk revision and tab changes, and Whole project can read the latest trunk", async () => {
  const mounted = await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.onlyChangedFiles.click();
  await showsStoryExpansion();

  const later = "e5".repeat(20);
  const showLatest = page.getByRole("button", {
    name: "Show latest",
    exact: true,
  });
  await mounted.refreshWork(later);
  await expect.element(showLatest).not.toBeInTheDocument();
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await showsStoryExpansion();

  await story.chooseTab("Intent coverage");
  await story.browseFiles();
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await showsStoryExpansion();
  await expect.element(story.file(otherPath)).not.toBeInTheDocument();

  await chooseWholeProject();
  await intentBrowser().isAt(initialRevision);
  await showLatest.click();
  await intentBrowser().isAt(later);
  expect(mounted.locationRevisions.at(-1)).toBe(later);
  await expect.element(showLatest).not.toBeInTheDocument();
});
