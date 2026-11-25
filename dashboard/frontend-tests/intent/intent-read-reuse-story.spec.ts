// Project Intent has separate request-reuse proof in the Candidates reader
// and cached-reads cases.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { scopeName } from "./intent-browser-page.ts";
import {
  changed,
  modifiedPath,
  openStoryChanges,
} from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("with a selected story, browsing reads nothing and a changed file's diff is read once, without its published text", async () => {
  const { reads } = await openStoryChanges();
  const story = intentStoryCompare();
  const purpose = page.getByRole("region", { name: "Purpose", exact: true });
  const summary = page.getByRole("region", { name: "Summary", exact: true });

  for (const scope of ["dashboard/tests", "boundary", "out"]) {
    const selection = scopeName(scope);
    await selection.click();
    await expect.element(selection).toHaveAttribute("aria-pressed", "true");
    await expect.element(summary).toBeVisible();
    await expect.element(purpose).not.toBeInTheDocument();
  }
  expect(reads).toEqual({ published: [], diffs: [], texts: [] });

  await story.file(changed.modified).click();
  await expect.poll(story.diffCode).toContain("more");
  await expect.poll(() => reads.texts).toEqual([modifiedPath]);
  const first = story.diffCode();
  await scopeName("boundary").click();
  await expect.element(purpose).not.toBeInTheDocument();

  await story.file(changed.modified).click();
  await expect.poll(story.diffCode).toBe(first);
  expect(reads).toEqual({
    published: [],
    diffs: [modifiedPath],
    texts: [modifiedPath],
  });
});
