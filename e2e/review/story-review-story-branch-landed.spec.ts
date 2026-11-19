// A claimed Story Branch Mode launch's landed integration in the story review:
// the real installed start, the installed
// `history-preserving-publication.mjs integrate` and `worktree-retirement.mjs`
// against a real bare origin produce the launch record the review reads
// (../../dashboard/test-support/support/storyBranchLandedReview.ts). Only the native Codex transport and
// GitHub's answers are substituted.
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { browserLocaleString } from "../../dashboard/test-support/browserLocale.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  git,
  retireLaunchWorkspace,
} from "../../dashboard/test-support/support/launchLanding.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  claimedRecord,
  trunkCommitFromAnotherWriter,
} from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import {
  integratedOntoTrunk,
  storyBranchExecutionAfterRefinement,
} from "../../dashboard/test-support/support/storyBranchLandedReview.ts";

const repository = "terryyin/open-dough";

test("a retired Story Branch integration is reviewed from its done card on its fixed pair, having been offered under Landed runs beside an earlier one-shot run while its workspace remained", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
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

  // While the integrated workspace remains, the review opens on it and the
  // Comparison switch lists the integration and the earlier one-shot run.
  const opened = await openReviewChanges(page, card);
  const live = opened.answer;
  expect(live?.kind).toBe("snapshot");
  expect(live?.selectedRun).toBeUndefined();
  expect(live?.runs).toEqual([
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
  await opened.comparison.expectOffered("Landed runs");
  await opened.comparison.expectChosen("All changes");
  await opened.landedRun.expectNotShown();
  await opened.comparison.choose("Landed runs");
  await opened.landedRun.expectChosen(reporting.reference, [
    `Execution — ${await browserLocaleString(page, record.launchedAt)} — ${accepted.slice(0, 8)}`,
    `Refinement — ${await browserLocaleString(page, refinement.record.launchedAt)} — ${refinement.receipt.revision.slice(0, 8)}`,
  ]);
  await opened.landedRun.expectShown(accepted);
  await opened.close();

  // Wrap-up retires the worktree and both branches once trunk holds the work.
  retireLaunchWorkspace(start, origin, accepted, start.branch);
  expect(
    await origin.originGit("for-each-ref", `refs/heads/${start.branch}`),
  ).toBe("");

  const review = await openReviewChanges(page, card);
  const { answer } = review;
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
  if (answer?.kind !== "landed") throw new Error("No landed review");
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
  await review.frame.expectHeading("Story A");
  await review.comparison.expectOnly("Landed runs");
  await review.landedRun.expectShown(
    `Execution launched ${await browserLocaleString(page, record.launchedAt)}, delivered to origin/main.`,
    `From ${trunkTip} to ${accepted}.`,
  );
  await review.landedRun.expectLaunchedAt(record.launchedAt);
  await review.files.expectNotShown(/trunk-only\.txt/);
  // The file both changed shows the story's change against trunk's at the
  // base: trunk's own line is no change.
  await review.files.chooseShown("Modified shared.txt");
  await review.diffs.expectChangedLines("Modified shared.txt", {
    removed: ["-line 1"],
    added: ["+the story's line"],
  });
  await review.diffs.expectLacks(
    "Modified shared.txt",
    "trunk's line",
    "trunk's earlier line",
  );

  // Others land after it and one reverts it: Refresh reads the same pair.
  trunkCommitFromAnotherWriter(origin, "later.txt", (writer) => {
    git(writer, "revert", "--no-edit", "-m", "1", accepted);
  });
  expect((await origin.originGit("rev-parse", "main")).trim()).not.toBe(
    accepted,
  );
  const again = (await review.refreshAndAnswer()).answer;
  expect(again).toMatchObject({
    kind: "landed",
    baseline: trunkTip,
    tree: accepted,
    selectedRun: reporting.reference,
    files,
  });
  await review.status.expectFeedbackSays(
    `Review refreshed: ${files.length} changed files in the captured landed comparison.`,
  );
  await review.landedRun.expectShown(`From ${trunkTip} to ${accepted}.`);
  await review.files.expectNotShown("Added later.txt");
  expect(published.revision).toBe(accepted);
  expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
});
