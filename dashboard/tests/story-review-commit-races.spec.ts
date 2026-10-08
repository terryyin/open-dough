// A range read owns the chosen points; delivering an earlier real answer
// after a newer range has settled cannot change its heading, files or diff.
import { expect, test } from "./support/preparationPage.ts";
import { storyReviewRangeEndpoint } from "../src/storyReview.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";

test("an earlier pending range cannot answer the later chosen range", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  let release: () => void = () => {
    throw new Error("No range response is held.");
  };
  let captured: () => void = () => {
    throw new Error("No range response was requested.");
  };
  let delivered: () => void = () => {
    throw new Error("No range response was delivered.");
  };
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const ready = new Promise<void>((resolve) => {
    captured = resolve;
  });
  const delivery = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  let intercepted = false;
  await page.route(`**${storyReviewRangeEndpoint}?*`, async (route) => {
    if (intercepted) {
      await route.continue();
      return;
    }
    intercepted = true;
    const response = await route.fetch({
      headers: { ...route.request().headers(), Origin: dashboard.origin },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      kind: "comparison",
      files: [],
    });
    captured();
    await held;
    await route.fulfill({ response });
    delivered();
  });
  try {
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    await ready;
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await rows.nth(2).click();
    await rows.nth(2).click();
    const heading = review.getByRole("heading", {
      name: "Changes in 1 commit",
    });
    const files = review.getByRole("list", {
      name: "1 changed file",
      exact: true,
    });
    await expect(heading).toBeVisible();
    await expect(review.locator(".story-review-since")).toContainText(
      "story file to",
    );
    await files
      .getByRole("button", { name: "Added story.txt", exact: true })
      .click();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    release();
    await delivery;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    await expect(heading).toBeVisible();
    await expect(review.locator(".story-review-since")).toContainText(
      "story file to",
    );
    await expect(
      files.getByRole("button", { name: "Added story.txt", exact: true }),
    ).toBeVisible();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    await expect(review).not.toContainText(
      "The chosen commits changed nothing.",
    );
  } finally {
    release();
  }
});
