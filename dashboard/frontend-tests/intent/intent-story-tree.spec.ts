import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentScopeTree } from "./intent-scope-tree-page.ts";
import {
  changed,
  modifiedPath,
  openStoryChanges,
} from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("folder names select a reading by keyboard independently of their disclosure", async () => {
  const productPath = "dashboard/src/components/view/index.ts";
  await openStoryChanges({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .modifying(modifiedPath)
          .modifying(productPath)
          .please(),
      ),
  });
  const story = intentStoryCompare();
  const tree = intentScopeTree();
  await story.browseFiles();
  await story.file(changed.modified).click();
  await expect.poll(story.diffName).toBe(changed.modified);
  const revisions = story.revisions();

  await (await tree.toggle("src").press("{Enter}")).isExpanded(false);
  await (await tree.name("src").press("{Enter}")).isSelected(true);
  await expect
    .element(page.getByRole("heading", { name: "dashboard/src", exact: true }))
    .toBeVisible();
  await expect.poll(story.diffName).toBe("");
  await tree.toggle("src").isExpanded(false);

  await (await tree.toggle("src").press(" ")).isExpanded(true);
  await tree.name("src").isSelected(true);
  await (await tree.name("components").press("{Enter}")).isSelected(true);
  await expect
    .element(
      page.getByRole("heading", {
        name: "dashboard/src/components",
        exact: true,
      }),
    )
    .toBeVisible();
  await (await tree.name("view").press("{Enter}")).isSelected(true);
  await expect
    .element(
      page.getByRole("heading", {
        name: "dashboard/src/components/view",
        exact: true,
      }),
    )
    .toBeVisible();

  await (await tree.name("dashboard/tests").press("{Enter}")).isSelected(true);
  await tree.summarizes("dashboard/tests", "files");
  await (await tree.name("boundary").press("{Enter}")).isSelected(true);
  await tree.toggle("boundary").isExpanded(false);
  await tree.summarizes("dashboard/tests/boundary", "1 file");
  expect(story.revisions()).toBe(revisions);
});

test("a configured root with no matching files still opens its Summary", async () => {
  const root = "tools/quality/checks";
  const location = makeMe.anIntentLocation
    .at(root)
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting()
    .please();
  await openStoryChanges({
    locationAnswer: makeMe.anIntentLocationsAnswer.locating(location).please(),
    revision: "e4".repeat(20),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.folder(root)).toBeVisible();
  const tree = intentScopeTree();
  await (await tree.name(root).press("{Enter}")).isSelected(true);
  await tree.summarizes(root, "0 files");
  await tree.toggle(root).isExpanded(false);
});
