import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  changed,
  openStoryChanges,
  productPath,
} from "./intent-story-changes-fixtures.ts";
import { chooseWholeProject } from "./intent-recent-stories-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const admittedChanges = [
  changed.modified,
  changed.added,
  changed.deleted,
  changed.into,
  changed.outOf,
];

test("Intent only starts off, then hides changes no location selects and keeps specs, deletions and renames admitted by either path", async () => {
  await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.intentOnly).not.toBeChecked();
  await expect.element(story.file(changed.product)).toBeVisible();

  await story.intentOnly.click();
  await expect.element(story.intentOnly).toBeChecked();
  await expect.element(story.changesOnly).toBeChecked();
  for (const name of [changed.product, changed.notes])
    await expect.element(story.file(name)).not.toBeInTheDocument();
  for (const name of admittedChanges)
    await expect.element(story.file(name)).toBeVisible();
  await expect.element(story.noMatch).not.toBeInTheDocument();
});

test("both filters over a production-only change say no files match and keep both controls", async () => {
  await openStoryChanges({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.modifying(productPath).please()),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.file(changed.product)).toBeVisible();
  await story.intentOnly.click();
  await expect.element(story.noMatch).toBeVisible();
  await expect.element(story.intentOnly).toBeChecked();
  await expect.element(story.changesOnly).toBeChecked();
  await expect.element(story.file(changed.product)).not.toBeInTheDocument();
});

test("an open production file stays open, not called missing, when Intent only hides it", async () => {
  await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.file(changed.product).click();
  await expect.poll(story.diffName).toBe(changed.product);
  await story.intentOnly.click();
  await expect.element(story.file(changed.product)).not.toBeInTheDocument();
  await expect.poll(story.diffName).toBe(changed.product);
  await expect.poll(story.readingText).not.toContain("is not in revision");
});

test("whole project offers Intent only without Changes only and narrows its locations to selected paths; the story offers Changes only again", async () => {
  const readme = "dashboard/tests/README.md";
  // Its own revision, so the page reads these locations afresh.
  const mounted = await openStoryChanges({
    revision: "c3".repeat(20),
    locationAnswer: makeMe.anIntentLocationsAnswer
      .locating(
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting("dashboard/tests/a.spec.ts", readme)
          .please(),
      )
      .please(),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.changesOnly.click();
  await expect.element(story.changesOnly).not.toBeChecked();

  await chooseWholeProject();
  await story.browseFiles();
  await expect.element(story.changesOnly).not.toBeInTheDocument();
  await expect.element(story.intentOnly).not.toBeChecked();
  await story.expandFolderPath("dashboard/tests");
  await expect.element(story.file(readme)).toBeVisible();
  await story.intentOnly.click();
  await expect.element(story.file(readme)).not.toBeInTheDocument();
  await expect.element(story.file("dashboard/tests/a.spec.ts")).toBeVisible();

  await mounted.selectStoryA();
  await story.browseFiles();
  await expect.element(story.changesOnly).toBeVisible();
});

test("a story's Changes only choice survives a round trip through whole project, where Intent only matching nothing says so", async () => {
  // Its own revision, so the page reads these locations afresh.
  const mounted = await openStoryChanges({
    revision: "d4".repeat(20),
    locationAnswer: makeMe.anIntentLocationsAnswer
      .locating(
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting("dashboard/tests/README.md")
          .please(),
      )
      .please(),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.changesOnly.click();
  await expect.element(story.changesOnly).not.toBeChecked();

  await chooseWholeProject();
  await story.browseFiles();
  await expect.element(story.noMatch).not.toBeInTheDocument();
  await story.intentOnly.click();
  await expect.element(story.noMatch).toBeVisible();
  await expect.element(story.intentOnly).toBeChecked();
  await story.intentOnly.click();
  await expect.element(story.noMatch).not.toBeInTheDocument();

  await mounted.selectStoryA();
  await story.browseFiles();
  await expect.element(story.changesOnly).not.toBeChecked();
});

test("whole project keeps Intent only across leaving Intent, apart from the story's choices", async () => {
  const mounted = await openStoryChanges();
  const story = intentStoryCompare();
  await chooseWholeProject();
  await story.browseFiles();
  await story.intentOnly.click();
  await expect.element(story.intentOnly).toBeChecked();

  await mounted.showDevelopment();
  await mounted.showIntent();
  await story.browseFiles();
  await expect.element(story.intentOnly).toBeChecked();

  await mounted.selectStoryA();
  await story.browseFiles();
  await expect.element(story.intentOnly).not.toBeChecked();
  await expect.element(story.changesOnly).toBeChecked();
});
