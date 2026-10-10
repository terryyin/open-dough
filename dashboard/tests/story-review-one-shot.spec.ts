// Captured-through-CLI evidence survives actual retirement and changing trunk.
import { mkdirSync, readFileSync } from "node:fs";
import { test, expect } from "./support/codexStart.ts";
import {
  baseline,
  writeReviewResult,
  advanceAndRevert,
} from "./support/oneShotReviewFiles.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
  readReview,
  repositoryObservation,
} from "./support/oneShotReview.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { parts } from "./dashboardPage.ts";
import { storyReviewEndpoint, storyReviewSchema } from "../src/storyReview.ts";

test("a retired one-shot's common file browser reads only its captured pair after trunk advances, reverts the result, and the dashboard restarts", async ({
  page,
  dashboard,
  origin,
}) => {
  baseline(origin.project);
  const run = await startReviewRun(dashboard);
  const workspace = run.established.workspace;
  writeReviewResult(workspace);
  const receipt = captureReviewRun(run, origin);
  retireReviewRun(run, origin, receipt.revision);
  // A stale directory at the retired path is not a readable Git workspace.
  mkdirSync(workspace, { recursive: true });
  const before = repositoryObservation(origin.project);
  const index = readFileSync(before.index);
  const { card, review: answer } = await openCapturedReview(page, origin);
  expect(answer).toMatchObject({
    kind: "landed",
    baseline: receipt.base,
    tree: receipt.revision,
    landing: { reference: receipt.reference },
  });
  if (answer.kind !== "landed") throw new Error("No captured review");
  expect(answer.files).toEqual([
    { kind: "added", path: "added.txt", lines: { added: 2, removed: 0 } },
    { kind: "modified", path: "binary.bin" },
    { kind: "deleted", path: "gone.txt", lines: { added: 0, removed: 1 } },
    {
      kind: "renamed",
      oldPath: "old.txt",
      path: "new/moved.txt",
      lines: { added: 1, removed: 0 },
    },
    { kind: "modified", path: "text.txt", lines: { added: 2, removed: 1 } },
  ]);
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(
    review.getByRole("heading", { name: "Landed one-shot run" }),
  ).toBeVisible();
  await expect(review).toContainText(receipt.base);
  await expect(review).toContainText(receipt.revision);
  await expect(review).toContainText("Refinement launched");
  await expect(review).toContainText("origin/main");
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  const files = review.getByRole("list", { name: "5 changed files" });
  await expect(files).toBeVisible();
  await expect(
    files.getByRole("button", { name: "Added added.txt" }),
  ).toHaveAccessibleDescription("2 lines added, 0 lines removed");
  await files.getByRole("button", { name: "Added added.txt" }).click();
  await expect(
    review.getByRole("region", { name: "Added added.txt" }),
  ).toContainText("+one");
  await review.getByRole("button", { name: "Next file", exact: true }).click();
  await expect(
    review.getByRole("region", { name: "Modified binary.bin" }),
  ).toContainText("Git reads it as binary");
  await files
    .getByRole("button", { name: "Renamed old.txt → new/moved.txt" })
    .click();
  await expect(
    review.getByRole("region", { name: "Renamed old.txt → new/moved.txt" }),
  ).toContainText("+renamed addition");
  await files.getByRole("button", { name: "Modified text.txt" }).click();
  await expect(
    review.getByRole("region", { name: "Modified text.txt" }),
  ).toContainText("-before");
  await expect(
    review.getByRole("region", { name: "Modified text.txt" }),
  ).toContainText("+extra");
  await review.getByRole("button", { name: "Hide files" }).click();
  await expect(files).toBeHidden();
  await review.getByRole("button", { name: "Show files" }).click();
  await expect(files).toBeVisible();
  expect(repositoryObservation(origin.project)).toEqual(before);
  expect(readFileSync(before.index)).toEqual(index);
  advanceAndRevert(origin.project, receipt);
  const afterTrunk = repositoryObservation(origin.project);
  const refreshed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await review.getByRole("button", { name: "Refresh" }).click();
  expect(storyReviewSchema.parse(await (await refreshed).json())).toEqual(
    answer,
  );
  await expect(
    review.getByRole("region", { name: "Modified text.txt" }),
  ).toContainText("+extra");
  expect(repositoryObservation(origin.project)).toEqual(afterTrunk);
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    codexProtocol: undefined,
    port,
  });
  try {
    await page.reload();
    expect(
      await readReview(
        page,
        parts(page).backlog.getByRole("article", { name: "Story A" }),
      ),
    ).toEqual(answer);
    await expect(
      review.getByRole("region", { name: "Renamed old.txt → new/moved.txt" }),
    ).toContainText("+renamed addition");
    await review.getByRole("button", { name: "Added added.txt" }).click();
    await expect(
      review.getByRole("region", { name: "Added added.txt" }),
    ).toContainText("+one");
    expect(repositoryObservation(origin.project)).toEqual(afterTrunk);
  } finally {
    await restarted.close();
  }
});
