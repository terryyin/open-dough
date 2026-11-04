// Intent's Review changes link beside a landed run. Story A has a run landed
// through the real installed one-shot delivery (only the native Codex
// transport is substituted, ./support/oneShotReviewChoices.ts). While its
// workspace lives, a landed run chosen in Review changes yields to Intent's
// comparison when Intent's link is followed: all changes, uncommitted ones
// included, with Intent's diffs. Once the workspace is gone, the review falls
// back to its newest landed run, which Intent shows too; Intent's link keeps
// it, and returns the review to it from another landed run chosen there.
// The marked journey without runs: ./intent-story-changes-marked.spec.ts.

import { rmSync } from "node:fs";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { stored } from "./support/codexStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  intentDiff,
  expandStorySummary,
  openReviewFromIntent,
  reviewDiff,
  selectTakenStoryInIntent,
} from "./support/intentStoryPage.ts";
import { changed, publishIntentTrunk } from "./support/intentStoryWorktree.ts";
import { git } from "./support/launchLanding.ts";
import { capturedChoice } from "./support/oneShotReviewChoices.ts";
import type { FakeCodex } from "./support/fakeCodex.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
} from "./support/storyLaunchRecord.ts";
import {
  comparison,
  expectShown,
  reviewRegion,
  uncommittedCheck,
} from "./support/storyReviewMark.ts";

test.setTimeout(150_000);
test.use({ preparationHost: "codex" });

const landedRunHeading = (review: Locator) =>
  review.getByRole("heading", { name: "Landed run", exact: true });

// The landed run's tree Intent's summary shows, expanded, beside the story's
// changes.
const intentRunTree = async (intent: Locator) =>
  (await expandStorySummary(intent))
    .locator(".intent-story-revisions code")
    .nth(1);

// Story A's runs landed through the real one-shot delivery, one per name in
// order, and a launch record naming the workspace Story A is then taken in,
// which the review reads while it lives.
async function landedThenTaken(
  dashboard: DashboardServer,
  origin: StartOrigin,
  native: FakeCodex,
  names: readonly string[] = ["landed"],
) {
  const landed = [];
  for (const name of names)
    landed.push(await capturedChoice(dashboard, origin, native, name));
  // The project's trunk follows the landing before Intent's trunk is added.
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  await keepLaunchRecords(dashboard, [
    ...stored(dashboard.home),
    storyALaunchRecord(path.join(origin.machine, "another-agent-workspace")),
  ]);
  return landed;
}

test("Intent's Review changes link returns a review showing a chosen landed run to Intent's comparison", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const [landed] = await landedThenTaken(dashboard, origin, codexProtocol);
  if (landed === undefined) throw new Error("No landed run");
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const { intentChoice } = parts(page);
  const review = reviewRegion(page);
  const inIntent = await intentDiff(intent, changed.modified);
  const added = await intentDiff(intent, changed.added);

  await test.step("Review changes, opened from Intent, is switched to the landed run", async () => {
    await openReviewFromIntent(page, intent);
    await expectShown(review, "All changes");
    await comparison(review)
      .getByRole("radio", { name: "Landed runs", exact: true })
      .check();
    await expect(
      review.getByRole("listbox", { name: "Landed run" }),
    ).toHaveValue(landed.key);
    await expect(landedRunHeading(review)).toBeVisible();
    await expect(review).toContainText(landed.receipt.revision);
  });

  await test.step("following Intent's link shows Intent's comparison: all changes, uncommitted ones included, with Intent's diff", async () => {
    await intentChoice.click();
    await openReviewFromIntent(page, intent);
    await expectShown(review, "All changes");
    await expect(uncommittedCheck(review)).toBeChecked();
    await expect(landedRunHeading(review)).toHaveCount(0);
    expect(await reviewDiff(page, changed.modified)).toBe(inIntent);
    expect(await reviewDiff(page, changed.added)).toBe(added);
  });
});

test("a review whose workspace is gone shows its own landed run, which Intent shows too, and Intent's link returns to it from another landed run", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const [first, second] = await landedThenTaken(
    dashboard,
    origin,
    codexProtocol,
    ["first", "second"],
  );
  if (first === undefined || second === undefined)
    throw new Error("No landed runs");
  // Story A is taken, and its workspace is gone before Intent reads it.
  publishIntentTrunk(origin.project);
  await origin.takenByAnotherAgent();
  rmSync(path.join(origin.machine, "another-agent-workspace"), {
    recursive: true,
    force: true,
  });
  await openBacklog(page, origin);
  const { taken, intentChoice, intent } = parts(page);
  await taken
    .getByRole("article", { name: "Story A" })
    .getByRole("heading", { level: 3 })
    .click();
  await intentChoice.click();
  const review = reviewRegion(page);
  const run = review.getByRole("listbox", { name: "Landed run" });
  // The answer falls back to the newest landed run.
  const own = second;
  const other = first;

  // The review shows `shown`, the landed run whose file it lists.
  const expectRun = async (shown: typeof own) => {
    await expect(landedRunHeading(review)).toBeVisible();
    await expectShown(review, "Landed runs");
    await expect(run).toHaveValue(shown.key);
    await expect(review).toContainText(shown.receipt.revision);
    await expect(
      review.locator(".story-review-files").getByRole("button", {
        name: `Added ${shown.name}.txt`,
        exact: true,
      }),
    ).toBeVisible();
  };

  await test.step("Intent shows the answer's own landed run's tree", async () => {
    const tree = await intentRunTree(intent);
    await expect(tree).toHaveAttribute("title", own.receipt.revision);
    await expect(tree.locator("xpath=..")).toContainText(
      "with the landed run's tree",
    );
  });

  await test.step("Intent's link opens the review on that run", async () => {
    await openReviewFromIntent(page, intent);
    await expectRun(own);
  });

  await test.step("Intent's link followed again keeps that run", async () => {
    await intentChoice.click();
    await openReviewFromIntent(page, intent);
    await expectRun(own);
  });

  await test.step("the other landed run is chosen in the review", async () => {
    await run.selectOption(other.key);
    await expectRun(other);
  });

  await test.step("Intent's link returns the review to the run Intent shows", async () => {
    await intentChoice.click();
    await expect(await intentRunTree(intent)).toHaveAttribute(
      "title",
      own.receipt.revision,
    );
    await openReviewFromIntent(page, intent);
    await expectRun(own);
  });
});
