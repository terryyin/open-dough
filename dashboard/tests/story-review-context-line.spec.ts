// A story review's context line, of Story A's worktree
// (./support/storyReviewWorktree.ts): branch, short baseline with the trunk
// it meets, shortened worktree, and Hide files side by side on one line.
// Activating it by keyboard shows every value in full and activating it again
// returns it to one line, its name reading every value in full throughout;
// the line stays in place while the review's body scrolls beneath it.

import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  expectFixedWhileBodyScrolls,
} from "./support/reviewContextLine.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  branch,
  keepLaunchRecord,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";

test("a story review's context line keeps to one line until activated and stays in place", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const words = contextWords({
    branch,
    baseline: merged,
    workspace: "~/git/open-dough/.worktrees/story-a",
  });
  const values = contextValues(review);
  await expect(values).toHaveAccessibleName(words);

  await test.step("the context line keeps to one line, and the keyboard shows it in full and back", async () => {
    const line = contextLine(review);
    const worktree = line.locator(".story-review-context-worktree > code");
    const shortened = () =>
      worktree.evaluate((value) => value.scrollWidth > value.clientWidth);
    // Branch, short baseline with trunk, worktree shortened, and Hide files,
    // side by side on one line.
    await expect(values).toHaveAttribute("aria-expanded", "false");
    await expect(line).toContainText(
      `Branch ${branch} Baseline ${merged.slice(0, 7)}`,
    );
    await expect(
      line.locator("code", { hasText: "origin/main" }),
    ).toBeVisible();
    await expect(
      line.getByRole("button", { name: "Hide files" }),
    ).toBeVisible();
    expect(await shortened()).toBe(true);
    const oneLine = (await line.boundingBox())?.height ?? 0;
    const rows = await line
      .locator(".story-review-context-value, .start-launch-button")
      .evaluateAll((shown) =>
        shown.map((each) => Math.round(each.getBoundingClientRect().top)),
      );
    expect(rows).toHaveLength(4);
    expect(Math.max(...rows) - Math.min(...rows)).toBeLessThan(8);
    await expect(line.locator("code", { hasText: merged })).toHaveCount(0);

    await values.focus();
    await values.press("Enter");
    await expect(values).toHaveAttribute("aria-expanded", "true");
    await expect(line.locator("code", { hasText: merged })).toBeVisible();
    await expect(line).toContainText(
      `${merged} where ${branch} meets origin/main`,
    );
    expect(await shortened()).toBe(false);
    expect((await line.boundingBox())?.height ?? 0).toBeGreaterThan(
      oneLine * 2,
    );
    await expect(values).toHaveAccessibleName(words);

    await values.press("Enter");
    await expect(values).toHaveAttribute("aria-expanded", "false");
    await expect(values).toBeFocused();
    expect((await line.boundingBox())?.height ?? 0).toBe(oneLine);
    expect(await shortened()).toBe(true);
    await expect(values).toHaveAccessibleName(words);
  });

  await test.step("the context line stays in place while the body scrolls beneath it", async () => {
    await expectFixedWhileBodyScrolls(page, review, [contextLine(review)]);
  });
});
