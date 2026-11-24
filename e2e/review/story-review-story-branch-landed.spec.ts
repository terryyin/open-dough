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
import {
  fileReadingTab,
  proofRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { writeAt } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { sessionRecord } from "../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  completedStoryQuery,
  getReview,
} from "../../dashboard/test-support/support/completedReviewRequests.ts";
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

test("a Done story offers its exact accepted landing from published history after retirement", async ({
  page,
  request,
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
  await opened.landedRun.expectOffered();
  await opened.comparison.expectChosen("Published completion");
  await opened.landedRun.expectNotShown();
  await opened.landedRun.chooseLatest();
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

  // Trunk advances. The durable session records the original integration pair.
  const later = trunkCommitFromAnotherWriter(origin, "later.txt", (writer) => {
    const { reference } = reporting;
    writeAt(
      writer,
      sessionRecordPathBeside(".planning/PRODUCT-BACKLOG.md", reference),
      JSON.stringify(
        sessionRecord({
          sessionId: reference,
          workflow: "dough-execute-plan",
          story: queuedIdentity,
          closedAt: new Date().toISOString(),
          ranges: [{ base: trunkTip, candidate: accepted }],
        }),
      ),
    );
  });
  expect(later).not.toBe(accepted);
  expect(git(origin.project, "rev-parse", "origin/main")).not.toBe(later);
  const named = await getReview(request, dashboard, storyReviewEndpoint, {
    ...completedStoryQuery,
    run: reporting.reference,
  });
  const namedAnswer = storyReviewSchema.parse(await named.json());
  if (namedAnswer.kind !== "landed")
    throw new Error("No named published landing");
  expect(namedAnswer.landing.launchedAt).toBeUndefined();
  expect(namedAnswer.landing).toMatchObject({
    base: trunkTip,
    revision: accepted,
  });

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
  const proof = page.waitForRequest((request) => {
    const query = new URL(request.url()).searchParams;
    return (
      query.get("intent") === "ci-comparison" &&
      query.get("identity") === queuedIdentity &&
      query.get("start") === trunkTip &&
      query.get("end") === accepted
    );
  });
  const landed = landedRead();
  await review.landedRun.chooseLatest();
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
  expect(review.answer.runs?.map((run) => run.key)).toEqual([
    reporting.reference,
    refinement.key,
  ]);
  await review.expectStory("Story A");

  await review.landedRun.expectShown(
    "Execution delivered to origin/main.",
    `From ${trunkTip} to ${accepted}.`,
  );
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

  const intent = parts(page).intent;
  await fileReadingTab(intent, "Proof").click();
  await proof;
  await expect(proofRegion(intent)).toBeVisible();

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
    `Review refreshed: ${files.length} changed files in the accepted landing comparison.`,
  );
  await review.landedRun.expectShown(`From ${trunkTip} to ${accepted}.`);
  await review.files.expectNotShown("Added later.txt");
  expect(published.revision).not.toBe(accepted);
  expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
});
