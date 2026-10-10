// A claimed Story Branch Mode launch's landed integration in the story review
// (../STORY-REVIEW-ONE-SHOT.md): the real installed start, the installed
// `history-preserving-publication.mjs integrate` and `worktree-retirement.mjs`
// against a real bare origin produce the launch record the review reads
// (./support/storyBranchLandedReview.ts). Only the native Codex transport and
// GitHub's answers are substituted.
import { test, expect } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { git } from "./support/oneShotLanding.ts";
import { readReview, retireLaunchWorkspace } from "./support/oneShotReview.ts";
import { reviewFeedback } from "./support/reviewContextLine.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  claimedRecord,
  trunkCommitFromAnotherWriter,
} from "./support/storyBranchIntegration.ts";
import {
  integratedOntoTrunk,
  storyBranchExecutionAfterRefinement,
} from "./support/storyBranchLandedReview.ts";
import { storyReviewEndpoint, storyReviewSchema } from "../src/storyReview.ts";

const repository = "terryyin/open-dough";

test("a retired Story Branch integration is reviewed from its done card on its fixed pair, having been offered under Landed runs beside an earlier one-shot run while its workspace remained", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(120_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const { refinement, story } = await storyBranchExecutionAfterRefinement(
    dashboard,
    origin,
    codexProtocol,
  );
  const { reporting, trunkTip, start } = story;
  // Before it lands, the claimed launch with its workspace is no landed run.
  expect((await claimedRecord(dashboard)).landing).toBeUndefined();
  const { accepted, delivered } = await integratedOntoTrunk(origin, story);
  const record = await claimedRecord(dashboard);

  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: accepted,
    repository,
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const review = page.getByRole("region", { name: "Review changes" });

  // While the integrated workspace remains, the review opens on it and the
  // Comparison switch lists the integration and the earlier one-shot run.
  const live = await readReview(page, card);
  expect(live.kind).toBe("snapshot");
  expect(live.selectedRun).toBeUndefined();
  expect(live.runs).toEqual([
    {
      key: reporting.reference,
      workflow: "execution",
      launchedAt: record.launchedAt,
      remote: "origin",
      target: "main",
      comparison: { base: trunkTip, revision: accepted },
    },
    {
      key: refinement.key,
      workflow: "refinement",
      launchedAt: refinement.record.launchedAt,
      remote: "origin",
      target: "main",
      comparison: {
        base: refinement.receipt.base,
        revision: refinement.receipt.revision,
      },
    },
  ]);
  expect(Date.parse(record.launchedAt)).toBeGreaterThan(
    Date.parse(refinement.record.launchedAt),
  );
  const landedRuns = review.getByRole("radio", {
    name: "Landed runs",
    exact: true,
  });
  await expect(landedRuns).not.toBeChecked();
  await expect(review.getByRole("heading", { name: "Landed run" })).toHaveCount(
    0,
  );
  await landedRuns.check();
  const select = review.getByRole("listbox", { name: "Landed run" });
  await expect(select).toHaveValue(reporting.reference);
  const launched = (at: string) =>
    page.evaluate((time) => new Date(time).toLocaleString(), at);
  await expect(select.getByRole("option")).toHaveText([
    `Execution — ${await launched(record.launchedAt)} — ${accepted.slice(0, 8)}`,
    `Refinement — ${await launched(refinement.record.launchedAt)} — ${refinement.receipt.revision.slice(0, 8)}`,
  ]);
  await expect(
    review.getByRole("heading", { name: "Landed run", exact: true }),
  ).toBeVisible();
  await expect(review).toContainText(accepted);
  await review.getByRole("button", { name: "Close", exact: true }).click();

  // Wrap-up retires the worktree and both branches once trunk holds the work.
  retireLaunchWorkspace(start, origin, accepted, start.branch);
  expect(
    await origin.originGit("for-each-ref", `refs/heads/${start.branch}`),
  ).toBe("");

  const answer = await readReview(page, card);
  expect(answer).toMatchObject({
    kind: "landed",
    baseline: trunkTip,
    tree: accepted,
    selectedRun: reporting.reference,
    landing: {
      reference: reporting.reference,
      identity: queuedIdentity,
      workflow: "execution",
      launchedAt: record.launchedAt,
      remote: "origin",
      target: "refs/heads/main",
      base: trunkTip,
      revision: accepted,
    },
  });
  if (answer.kind !== "landed") throw new Error("No landed review");
  const files = answer.files;
  expect(files.map((file) => file.path)).toEqual(delivered);
  expect(files).toEqual(
    expect.arrayContaining([
      { kind: "added", path: "story.txt", lines: { added: 1, removed: 0 } },
      { kind: "modified", path: "shared.txt", lines: { added: 1, removed: 1 } },
    ]),
  );
  expect(answer.runs?.map((run) => run.key)).toEqual([
    reporting.reference,
    refinement.key,
  ]);
  await expect(
    review.getByRole("heading", { name: "Story A", exact: true }),
  ).toBeVisible();
  await expect(
    review.getByRole("heading", { name: "Landed run", exact: true }),
  ).toBeVisible();
  await expect(
    review.getByRole("radio", { name: "Landed runs", exact: true }),
  ).toBeChecked();
  await expect(review.getByRole("radio")).toHaveCount(1);
  const context = review.locator("div").filter({
    has: page.getByRole("heading", { name: "Landed run", exact: true }),
  });
  await expect(context.last()).toContainText(
    `Execution launched ${await launched(record.launchedAt)}, delivered to origin/main.`,
  );
  await expect(context.last().locator("time")).toHaveAttribute(
    "datetime",
    record.launchedAt,
  );
  await expect(context.last()).toContainText(
    `From ${trunkTip} to ${accepted}.`,
  );
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  await expect(
    review.getByRole("button", { name: /trunk-only\.txt/ }),
  ).toHaveCount(0);
  // The file both changed shows the story's change against trunk's at the
  // base: trunk's own line is no change.
  await review
    .getByRole("button", { name: "Modified shared.txt", exact: true })
    .click();
  const diff = review.getByRole("region", { name: "Modified shared.txt" });
  await expect(diff.locator(".story-review-added")).toHaveText([
    "+the story's line",
  ]);
  await expect(diff.locator(".story-review-removed")).toHaveText(["-line 1"]);
  await expect(diff).not.toContainText("trunk's line");
  await expect(diff).not.toContainText("trunk's earlier line");

  // Others land after it and one reverts it: Refresh reads the same pair.
  trunkCommitFromAnotherWriter(origin, "later.txt", (writer) => {
    git(writer, "revert", "--no-edit", "-m", "1", accepted);
  });
  expect((await origin.originGit("rev-parse", "main")).trim()).not.toBe(
    accepted,
  );
  const refreshed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await review.getByRole("button", { name: "Refresh" }).click();
  const again = storyReviewSchema.parse(await (await refreshed).json());
  expect(again).toMatchObject({
    kind: "landed",
    baseline: trunkTip,
    tree: accepted,
    selectedRun: reporting.reference,
    files,
  });
  await expect(reviewFeedback(review)).toContainText(
    `Review refreshed: ${files.length} changed files in the captured landed comparison.`,
  );
  await expect(review).toContainText(`From ${trunkTip} to ${accepted}.`);
  await expect(
    review.getByRole("button", { name: "Added later.txt" }),
  ).toHaveCount(0);
  expect(published.revision).toBe(accepted);
  expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
});
