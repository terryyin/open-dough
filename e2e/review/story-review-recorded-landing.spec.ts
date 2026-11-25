// A claimed Story Branch Mode launch's landing recorded in its published
// durable session: after retirement and trunk advances, the story review
// reads the exact accepted pair from the Review repository, and switching its
// files makes no remote request. The installed start and integration
// (../../dashboard/test-support/support/storyBranchLandedReview.ts) and
// retirement (../../dashboard/test-support/support/storyBranchRecordedLanding.ts)
// run for real; only the native Codex transport and GitHub's answers are
// substituted.
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  fileReadingTab,
  proofRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  completedStoryQuery,
  getReview,
} from "../../dashboard/test-support/support/completedReviewRequests.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { remoteRequestRecordingGit } from "../../dashboard/test-support/support/remoteRequestRecordingGit.ts";
import { fixtureReviewRepository } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { claimedRecord } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { landedStoryBranch } from "../../dashboard/test-support/support/storyBranchLandedReview.ts";
import { retiredWithRecordedSession } from "../../dashboard/test-support/support/storyBranchRecordedLanding.ts";

// Named per worker at load; every Git call the dashboard makes passes it.
const recording = remoteRequestRecordingGit(
  path.join(
    realpathSync(tmpdir()),
    `dough-recorded-landing-git-${String(process.pid)}`,
  ),
);
test.use({ pathPrefix: [recording.bin] });

test("a retired Story Branch landing recorded in its published session reads its exact pair and switches files without a remote request", async ({
  page,
  request,
  dashboard,
  origin,
  codexProtocol,
}) => {
  // Two installed native launches, real trunk integration and retirement
  // precede the browser comparison.
  test.setTimeout(90_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const landing = await landedStoryBranch(dashboard, origin, codexProtocol);
  const { refinement, story, accepted, delivered, record } = landing;
  const { reporting, trunkTip } = story;
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: accepted,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  retiredWithRecordedSession(origin, landing);
  const reviewRepository = fixtureReviewRepository(
    realpathSync(origin.machine),
  );
  const reviewRequests = () =>
    recording
      .requests()
      .filter((request) => request.directory === reviewRepository);

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
  // Switching files reads what the landed run's open synced, and nothing more.
  const synced = reviewRequests().length;
  expect(synced).toBeGreaterThan(0);
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

  await review.files.choose("Added story.txt");
  await review.diffs.expectChangedLines("Added story.txt", {
    removed: [],
    added: ["+story.txt"],
  });
  expect(reviewRequests()).toHaveLength(synced);

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
