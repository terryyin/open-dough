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
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
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

test("a Done story offers the captured Story Branch integration before and after workspace retirement", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  // Two installed native launches, real trunk integration and retirement
  // precede the browser comparisons before and after retirement.
  test.setTimeout(90_000);
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
    follows: true,
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });

  // Done opens its published completion even while the integrated workspace
  // remains. The same picker offers the integration and earlier refinement.
  const opened = await openIntentReviewChanges(page, card);
  const live = opened.answer;
  expect(live.kind).toBe("published");
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
  await opened.comparison.expectOffered("Landed runs");
  await opened.comparison.expectChosen("Published completion");
  await opened.landedRun.expectNotShown();
  await opened.comparison.choose("Landed runs");
  await opened.landedRun.expectChosen(reporting.reference, [
    `Execution — ${await browserLocaleString(page, record.launchedAt)} — ${accepted.slice(0, 8)}`,
    `Refinement — ${await browserLocaleString(page, refinement.record.launchedAt)} — ${refinement.receipt.revision.slice(0, 8)}`,
  ]);
  await opened.landedRun.expectShown(accepted);
  await opened.returnToDevelopment();

  // Wrap-up retires the worktree and both branches once trunk holds the work.
  retireLaunchWorkspace(start, origin, accepted, start.branch);
  expect(
    await origin.originGit("for-each-ref", `refs/heads/${start.branch}`),
  ).toBe("");

  const review = await openIntentReviewChanges(page, card);
  expect(review.answer.kind).toBe("published");
  await review.comparison.expectChosen("Published completion");
  const landedRead = () =>
    page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === storyReviewEndpoint &&
        url.searchParams.get("run") === reporting.reference
      );
    });
  const landed = landedRead();
  await review.comparison.choose("Landed runs");
  const answer = storyReviewSchema.parse(await (await landed).json());
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
  await review.expectStory("Story A");
  await review.comparison.expectChosen("Landed runs");
  await review.landedRun.expectShown(
    `Execution launched ${await browserLocaleString(page, record.launchedAt)}, delivered to origin/main.`,
    `From ${trunkTip} to ${accepted}.`,
  );
  await review.landedRun.expectLaunchedAt(record.launchedAt);
  await review.files.expectNotShown("Added trunk-only.txt");
  await review.files.expectNotShown("Added merged-trunk-only.txt");
  // The file both changed shows the story's change against trunk's at the
  // base: trunk's own line is no change.
  await review.files.choose("Modified shared.txt");
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
  const refreshed = landedRead();
  await review.refresh();
  const again = storyReviewSchema.parse(await (await refreshed).json());
  expect(again).toMatchObject({
    kind: "landed",
    baseline: trunkTip,
    tree: accepted,
    selectedRun: reporting.reference,
    files,
  });
  await review.expectFeedback(
    `Review refreshed: ${files.length} changed files in the captured landed comparison.`,
  );
  await review.landedRun.expectShown(`From ${trunkTip} to ${accepted}.`);
  await review.files.expectNotShown("Added later.txt");
  expect(published.revision).not.toBe(accepted);
  expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
});
