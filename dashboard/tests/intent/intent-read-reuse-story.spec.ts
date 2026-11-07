// With a selected Taken story (../support/intentStoryWorktree.ts), Intent
// reads no file text or story diff until a file is opened: browsing a
// location and folders shows their Summaries without a request. A changed
// file's Purpose is the story's diff alone, with no read of its published
// text beside it, and opening it again asks for the diff no more
// (../../src/StoryReviewFileDiff.tsx, ../../src/answerMemo.ts). Without a story:
// ./intent-read-reuse.spec.ts.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import {
  intentFolderName,
  intentLocationName,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  intentDiff,
  selectTakenStoryInIntent,
} from "../support/intentStoryPage.ts";
import { changed } from "../support/intentStoryWorktree.ts";

const locationPaths = ["dashboard/tests/", "tests/"];
const modifiedPath = "dashboard/tests/a.spec.ts";

// The page's reads, from now on, of published text in a location, and of a
// story file's diff and texts, by path.
function contentReads(page: Page) {
  const text: string[] = [];
  const diffs: string[] = [];
  const texts: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    const path = url.searchParams.get("path") ?? "";
    if (
      url.pathname === authenticatedReadEndpoint &&
      locationPaths.some((location) => path.startsWith(location))
    )
      text.push(path);
    if (url.pathname === storyReviewFileEndpoint) diffs.push(path);
    if (url.pathname === storyReviewFileTextEndpoint) texts.push(path);
  });
  return { text, diffs, texts };
}

test("with a selected story, browsing reads nothing and a changed file's diff is read once, without its published text", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const reads = contentReads(page);
  const purpose = purposeRegion(intent);

  await test.step("a location and two folders show their Summaries without a request", async () => {
    await intentLocationName(intent, "dashboard/tests").click();
    await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    for (const folder of ["boundary", "out"]) {
      await intentFolderName(intent, folder).click();
      await expect(intentFolderName(intent, folder)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    await expect(purpose).toHaveCount(0);
    expect(reads).toEqual({ text: [], diffs: [], texts: [] });
  });

  await test.step("a changed file opened twice reads its diff once and never its published text", async () => {
    const first = await intentDiff(intent, changed.modified);
    expect(first).toContain("more");
    await intentFolderName(intent, "boundary").click();
    await expect(purpose).toHaveCount(0);
    expect(await intentDiff(intent, changed.modified)).toBe(first);
    expect(reads).toEqual({
      text: [],
      diffs: [modifiedPath],
      texts: [modifiedPath],
    });
  });
});
