// Captured-through-CLI evidence survives actual retirement and changing trunk.
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { mkdirSync, readFileSync } from "node:fs";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  baseline,
  writeReviewResult,
  advanceAndRevert,
} from "../../dashboard/test-support/support/oneShotReviewFiles.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
  repositoryObservation,
} from "../../dashboard/test-support/support/oneShotReview.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";

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
  const review = await openCapturedReview(page, origin);
  const { answer } = review;
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
  await review.landedRun.expectShown(
    receipt.base,
    receipt.revision,
    "Refinement launched",
    "origin/main",
  );
  const { files, diffs } = review;
  await files.expectOutsideCount(5);
  await files.choose("Added added.txt");
  await diffs.expectShows("Added added.txt", "+one");
  await files.choose("Modified binary.bin");
  await diffs.expectShows("Modified binary.bin", "Git reads it as binary");
  await files.choose("Renamed old.txt → new/moved.txt");
  await diffs.expectShows(
    "Renamed old.txt → new/moved.txt",
    "+renamed addition",
  );
  await files.choose("Modified text.txt");
  await diffs.expectShows("Modified text.txt", "-before", "+extra");
  // The toolbar names the comparison, never the selected run.
  await review.comparison.expectChosen("Landed runs");
  await review.hideFiles();
  await review.setFilesShown(true);
  expect(repositoryObservation(origin.project)).toEqual(before);
  expect(readFileSync(before.index)).toEqual(index);
  advanceAndRevert(origin.project, receipt);
  const afterTrunk = repositoryObservation(origin.project);
  expect((await review.refreshAndAnswer()).answer).toEqual(answer);
  await diffs.expectShows("Modified text.txt", "+extra");
  expect(repositoryObservation(origin.project)).toEqual(afterTrunk);
  await review.returnToDevelopment();
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    codexProtocol: undefined,
    port,
  });
  try {
    await page.reload();
    const reopened = await openIntentReviewChanges(
      page,
      parts(page).backlog.getByRole("article", { name: "Story A" }),
    );
    expect(reopened.answer).toEqual(answer);
    await reopened.files.choose("Renamed old.txt → new/moved.txt");
    await reopened.diffs.expectShows(
      "Renamed old.txt → new/moved.txt",
      "+renamed addition",
    );
    await reopened.files.choose("Added added.txt");
    await reopened.diffs.expectShows("Added added.txt", "+one");
    expect(repositoryObservation(origin.project)).toEqual(afterTrunk);
  } finally {
    await restarted.close();
  }
});
