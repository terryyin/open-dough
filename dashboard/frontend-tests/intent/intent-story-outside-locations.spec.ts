import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect, test } from "vitest";
import {
  changed,
  openStoryChanges,
  productPath,
} from "./intent-story-changes-fixtures.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

test("outside changes follow the configured locations in open folders and do not count in the story header", async () => {
  await openStoryChanges();
  const story = intentStoryCompare();
  await story.browseFiles();
  const outside = story.outsideGroup;
  await expect.element(outside).toBeVisible();
  const groups = outside
    .element()
    .parentElement?.querySelectorAll(":scope > section");
  expect(
    [...(groups ?? [])].map((group) =>
      group.classList.contains("intent-location"),
    ),
  ).toEqual([true, true, false]);
  expect([...(groups ?? [])].at(-1)).toBe(outside.element());
  for (const [name, kind] of [
    [changed.product, "modified"],
    [changed.notes, "renamed"],
  ] as const) {
    const file = story.outsideFile(name);
    await expect.element(file).toBeVisible();
    await expect.element(file).toHaveLength(1);
    expect(file.element().closest("li")?.getAttribute("data-kind")).toBe(kind);
  }
  await expect.element(story.folderToggle("docs", true)).toBeVisible();
  await expect.element(story.folderToggle("dashboard/src", true)).toBeVisible();
  expect(story.headerText()).not.toMatch(/outside Intent locations/i);
  await expect
    .element(story.header.getByRole("button", { name: /outside/i }))
    .not.toBeInTheDocument();
});

test("an outside file reads its diff as Purpose and stays selected under Selected story only", async () => {
  const { reads } = await openStoryChanges({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.modifying(productPath).please()),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(productPath, "product change").please(),
      ),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  const file = story.outsideFile(changed.product);
  await activateComparisonControl(file);
  await expect.poll(story.diffName).toBe(changed.product);
  await expect.poll(story.diffCode).toContain("product change");
  await activateComparisonControl(story.onlyChangedFiles);
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await expect.element(file).toHaveAttribute("aria-pressed", "true");
  await expect.poll(story.diffName).toBe(changed.product);
  expect(reads.diffs).toEqual([productPath]);
});

test("a Done story lists its published completion's outside product code with its diff as Purpose", async () => {
  await openDoneStoryComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .published(doneCompletion)
          .modifying("dashboard/tests/a.spec.ts")
          .modifying(productPath)
          .please(),
      ),
    fileDiff: ({ path }) => {
      if (path !== productPath)
        throw new Error(`Unexpected diff path: ${path ?? "missing"}`);
      return Promise.resolve(
        makeMe.aReviewedFileDiff.adding(path, "app change").please(),
      );
    },
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  await activateComparisonControl(story.outsideFile(changed.product));
  await expect.poll(story.diffName).toBe(changed.product);
  await expect.poll(story.diffCode).toContain("app change");
});
