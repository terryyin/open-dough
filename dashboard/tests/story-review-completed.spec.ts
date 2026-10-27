import { expect, test } from "./support/preparationPage.ts";
import { parts } from "./dashboardPage.ts";
import { showColumn } from "./boardPage.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { readReview, refreshReview } from "./support/launchLandingReview.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
  keepUnusableCompletedCapture,
} from "./support/completedPublishedStory.ts";

test("a CLI-completed story without a local launch opens fixed published changes and file diffs after trunk advances", async ({
  page,
  dashboard,
  origin,
}) => {
  test.slow();
  const story = await completedPublishedStory(origin);
  const { completion } = story;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(card.locator(".session-entry")).toHaveCount(0);
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeVisible();
  const first = await readReview(page, card);
  expect(first.kind).toBe("published");
  if (first.kind !== "published") throw new Error("No published review");
  expect(first.completion).toBe(completion);
  expect(first.files.map((file) => file.path)).toContain("[literal]*.txt");
  expect(first.files.map((file) => file.path)).not.toContain("other-story.txt");
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(review).toContainText("Published completion");
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  await review
    .getByRole("button", { name: "Modified shared.txt", exact: true })
    .click();
  const diff = review.getByRole("region", { name: "Modified shared.txt" });
  await expect(diff.locator(".story-review-added")).toHaveText([
    "+story first",
  ]);
  await expect(diff.locator(".story-review-removed")).toHaveText(["-line 0"]);
  await review.getByRole("button", { name: "Hide files", exact: true }).click();
  await expect(review.locator(".story-review-files")).toBeHidden();
  await review.getByRole("button", { name: "Show files", exact: true }).click();
  await expect(review.locator(".story-review-files")).toBeVisible();
  advanceCompletedTrunk(origin);
  expect(await refreshReview(page, review)).toEqual(first);
  await review.getByRole("button", { name: "Close", exact: true }).click();
  expect(await readReview(page, card)).toEqual(first);
  await review
    .getByRole("button", { name: "Added [literal]*.txt", exact: true })
    .click();
  await expect(
    review.getByRole("region", { name: "Added [literal]*.txt", exact: true }),
  ).toContainText("+delivered on another machine");
  await expect(review).not.toContainText("later.txt");
  // A later retained capture cannot replace the published comparison when
  // its repository is gone. Both choices remain navigable without a launch
  // being invented for the published completion.
  await keepUnusableCompletedCapture(dashboard, origin, story);
  const withRun = await refreshReview(page, review);
  expect(withRun).toMatchObject({
    kind: "published",
    completion,
    files: first.files,
  });
  await expect(
    review.getByRole("radio", { name: "Published completion", exact: true }),
  ).toBeChecked();
  await review.getByRole("radio", { name: "Landed runs", exact: true }).check();
  await expect(review).toContainText(
    "captured landing repository is missing or unreadable",
  );
  await review
    .getByRole("radio", { name: "Published completion", exact: true })
    .check();
  await expect(
    review.getByRole("radio", { name: "Published completion", exact: true }),
  ).toBeChecked();
  await expect(
    review.getByRole("button", { name: "Added [literal]*.txt", exact: true }),
  ).toBeVisible();
});
