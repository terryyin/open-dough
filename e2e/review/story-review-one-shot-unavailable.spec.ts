// Honest empty and unavailable captured comparisons never substitute current trunk.
import { changedFilesList } from "../../dashboard/test-support/support/reviewTreeRows.ts";
import {
  reviewRegion,
  toolbarComparison,
} from "../../dashboard/test-support/support/reviewControls.ts";
import {
  expectDetailsCollapsed,
  revealDetails,
} from "../../dashboard/test-support/support/reviewDetails.ts";
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { commit } from "../../dashboard/test-support/support/launchLanding.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
  openCapturedReviewAsOpened,
} from "../../dashboard/test-support/support/oneShotReview.ts";
import { refreshReview } from "../../dashboard/test-support/support/launchLandingReview.ts";

for (const captured of [true, false]) {
  test(
    captured
      ? "a valid empty captured comparison says the delivered run changed nothing"
      : "a retired legacy one-shot without capture exposes its evidence gap",
    async ({ page, dashboard, origin }) => {
      const run = await startReviewRun(dashboard);
      const receipt = captured ? captureReviewRun(run, origin) : undefined;
      const base = run.established.startingRevision ?? "";
      retireReviewRun(run, origin, receipt?.revision ?? base);
      const { review: answer } = await openCapturedReviewAsOpened(page, origin);
      const review = reviewRegion(page);
      if (captured) {
        expect(answer).toMatchObject({
          kind: "landed",
          baseline: base,
          tree: base,
          files: [],
        });
        await expect(review).toContainText("empty delivered comparison");
      } else {
        expect(answer).toMatchObject({ kind: "landing-unavailable" });
        await expect(review).toContainText("no captured landing comparison");
        await expect(review).toContainText(
          "cannot be reconstructed from today's trunk",
        );
      }
      // As opened: the explanation shows with the details collapsed.
      await expect(
        review.getByText(
          captured
            ? /empty delivered comparison/
            : /no captured landing comparison/,
        ),
      ).toBeVisible();
      await expectDetailsCollapsed(review);
      await expect(review.getByRole("list")).toHaveCount(0);
      // The toolbar names the comparison, never the run, and offers no
      // sidebar toggle without files.
      await expect(toolbarComparison(review)).toHaveText("Landed runs");
      await expect(
        review.getByRole("button", { name: /^(Hide|Show) files$/ }),
      ).toHaveCount(0);
      await revealDetails(review);
    },
  );
}

test("missing captured objects or the saved common repository expose an unavailable reason with no substitute file list", async ({
  page,
  dashboard,
  origin,
}) => {
  const run = await startReviewRun(dashboard);
  commit(run.established.workspace, "delivered.txt");
  const receipt = captureReviewRun(run, origin);
  const repository = retireReviewRun(run, origin, receipt.revision);
  await openCapturedReview(page, origin);
  const review = reviewRegion(page);
  await expect(changedFilesList(review, "1 changed file")).toBeVisible();
  const refresh = () => refreshReview(page, review);
  const object = path.join(
    repository,
    "objects",
    receipt.revision.slice(0, 2),
    receipt.revision.slice(2),
  );
  const bytes = readFileSync(object);
  unlinkSync(object);
  try {
    expect(await refresh()).toMatchObject({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
    await expect(review.getByRole("list")).toHaveCount(0);
  } finally {
    writeFileSync(object, bytes);
  }
  const held = `${repository}-held`;
  renameSync(repository, held);
  try {
    expect(await refresh()).toMatchObject({
      kind: "landing-unavailable",
      explanation: "The captured landing repository is missing or unreadable.",
    });
    await expect(review.getByRole("list")).toHaveCount(0);
  } finally {
    renameSync(held, repository);
  }
});
