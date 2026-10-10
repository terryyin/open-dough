// Honest empty and unavailable captured comparisons never substitute current trunk.
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./support/codexStart.ts";
import { commit } from "./support/oneShotLanding.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
} from "./support/oneShotReview.ts";
import { storyReviewEndpoint, storyReviewSchema } from "../src/storyReview.ts";

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
      const { review: answer } = await openCapturedReview(page, origin);
      const review = page.getByRole("region", { name: "Review changes" });
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
      await expect(review.getByRole("list")).toHaveCount(0);
      await expect(
        review.getByRole("button", { name: "Mark reviewed" }),
      ).toHaveCount(0);
      await expect(
        review.getByRole("button", { name: "Hide files" }),
      ).toHaveCount(0);
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
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(
    review.getByRole("list", { name: "1 changed file" }),
  ).toBeVisible();
  const refresh = async () => {
    const answer = page.waitForResponse(
      (response) => new URL(response.url()).pathname === storyReviewEndpoint,
    );
    await review.getByRole("button", { name: "Refresh" }).click();
    return storyReviewSchema.parse(await (await answer).json());
  };
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
    await expect(
      review.getByRole("button", { name: "Mark reviewed" }),
    ).toHaveCount(0);
  } finally {
    renameSync(held, repository);
  }
});
