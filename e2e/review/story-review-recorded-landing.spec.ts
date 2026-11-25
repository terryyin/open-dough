// The installed start, integration and retirement commands run against real
// Git repositories. Only native Codex transport and GitHub are substituted.
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { openDoneStoryCard } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import {
  expectFileProofShown,
  openFileProof,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  readLandedReview,
  waitForLandedReview,
  waitForLandingProofRequest,
} from "../../dashboard/test-support/support/completedReviewRequests.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { remoteRequestRecordingGit } from "../../dashboard/test-support/support/remoteRequestRecordingGit.ts";
import { fixtureReviewRepository } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { claimedRecord } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { landedStoryBranch } from "../../dashboard/test-support/support/storyBranchLandedReview.ts";
import { retiredWithRecordedSession } from "../../dashboard/test-support/support/storyBranchRecordedLanding.ts";

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
  const landing =
    await test.step("Given Story A lands after an earlier refinement", () => {
      // Two installed native launches and trunk integration precede the review.
      test.setTimeout(90_000);
      if (codexProtocol === undefined) throw new Error("No native fixture");
      return landedStoryBranch(dashboard, origin, codexProtocol);
    });
  const published =
    await test.step("And the dashboard follows published trunk", () =>
      publishCommittedOrigin(page, {
        repoDir: origin.origin,
        revision: landing.accepted,
        repository: "terryyin/open-dough",
        follows: true,
      }));
  const card = await test.step("When I find Story A in Recently done", () =>
    openDoneStoryCard(page, "Story A"));
  await test.step("Given the workspace retires and trunk advances with the durable landing record", () =>
    retiredWithRecordedSession(origin, landing));
  const named =
    await test.step("When I read the published session's landed review", () =>
      readLandedReview(request, dashboard, landing.story.reporting.reference));
  await test.step("Then the published session names the original landing without a local launch time", () => {
    if (named.kind !== "landed") throw new Error("No published landing");
    expect(named.landing.launchedAt).toBeUndefined();
    expect(named.landing).toMatchObject({
      base: landing.story.trunkTip,
      revision: landing.accepted,
    });
  });

  const review = await test.step("When I open Review changes", () =>
    openIntentReviewChanges(page, card));
  await test.step("Then the review opens on Published completion", async () => {
    expect(review.answer.kind).toBe("published");
    await review.comparison.expectChosen("Published completion");
  });
  const proof =
    await test.step("Given I am watching for Proof to request the accepted landing pair", () => {
      const { trunkTip } = landing.story;
      return {
        requested: waitForLandingProofRequest(
          page,
          queuedIdentity,
          trunkTip,
          landing.accepted,
        ),
      };
    });
  const selected =
    await test.step("When I choose the latest landed run", async () => {
      const answer = waitForLandedReview(
        page,
        landing.story.reporting.reference,
      );
      await review.landedRun.chooseLatest();
      return answer;
    });
  await test.step("Then the selected review uses the exact accepted pair", () => {
    expect(selected).toMatchObject({
      kind: "landed",
      baseline: landing.story.trunkTip,
      tree: landing.accepted,
      selectedRun: landing.story.reporting.reference,
      landing: { base: landing.story.trunkTip, revision: landing.accepted },
    });
  });
  await test.step("And the landing names the execution and its publication target", () => {
    expect(selected).toMatchObject({
      landing: {
        reference: landing.story.reporting.reference,
        identity: queuedIdentity,
        workflow: "execution",
        remote: "origin",
        target: "refs/heads/main",
      },
    });
  });
  const files =
    await test.step("And the review lists the delivered paths", () => {
      if (selected.kind !== "landed") throw new Error("No landed review");
      expect(selected.files.map((file) => file.path)).toEqual(
        landing.delivered,
      );
      return selected.files;
    });
  await test.step("And the added and modified files show their line counts", () => {
    expect(files).toEqual(
      expect.arrayContaining([
        { kind: "added", path: "story.txt", lines: { added: 1, removed: 0 } },
        {
          kind: "modified",
          path: "shared.txt",
          lines: { added: 1, removed: 1 },
        },
      ]),
    );
  });
  await test.step("And Story A offers the execution and the earlier refinement", async () => {
    expect(review.answer.runs?.map((run) => run.key)).toEqual([
      landing.story.reporting.reference,
      landing.refinement.key,
    ]);
    await review.expectStory("Story A");
  });
  await test.step("And the review identifies the delivered range on origin/main", () =>
    review.landedRun.expectShown(
      "Execution delivered to origin/main.",
      `From ${landing.story.trunkTip} to ${landing.accepted}.`,
    ));
  const remoteRequests =
    await test.step("Given I count the review repository's remote requests before selecting files", () => {
      const repository = fixtureReviewRepository(realpathSync(origin.machine));
      const requests = () =>
        recording
          .requests()
          .filter((request) => request.directory === repository);
      return { requests, synced: requests().length };
    });
  await test.step("And the initial sync made a remote request", () => {
    expect(remoteRequests.synced).toBeGreaterThan(0);
  });
  await test.step("And the file list excludes changes delivered only by trunk", async () => {
    await review.files.expectNotShown("Added trunk-only.txt");
    await review.files.expectNotShown("Added merged-trunk-only.txt");
  });
  await test.step("When I select the shared file", () =>
    review.files.choose("Modified shared.txt"));
  await test.step("Then its diff shows the story's edit against the landing base", () =>
    review.diffs.expectChangedLines("Modified shared.txt", {
      removed: ["-line 1"],
      added: ["+the story's line"],
    }));
  await test.step("And its diff excludes both trunk edits", () =>
    review.diffs.expectLacks(
      "Modified shared.txt",
      "trunk's line",
      "trunk's earlier line",
    ));
  await test.step("When I switch to the added story file", () =>
    review.files.choose("Added story.txt"));
  await test.step("Then the added file shows its published diff", () =>
    review.diffs.expectChangedLines("Added story.txt", {
      removed: [],
      added: ["+story.txt"],
    }));
  await test.step("And switching files made no new remote request", () => {
    expect(remoteRequests.requests()).toHaveLength(remoteRequests.synced);
  });

  await test.step("When I open the file's Proof tab", () =>
    openFileProof(page));
  await test.step("Then Proof requests the accepted landing pair and becomes visible", async () => {
    await proof.requested;
    await expectFileProofShown(page);
  });

  const refreshed =
    await test.step("When I refresh the landed review", async () => {
      const answer = waitForLandedReview(
        page,
        landing.story.reporting.reference,
      );
      await review.refresh();
      return answer;
    });
  await test.step("Then Refresh keeps the exact landing and its files", () => {
    expect(refreshed).toMatchObject({
      kind: "landed",
      baseline: landing.story.trunkTip,
      tree: landing.accepted,
      selectedRun: landing.story.reporting.reference,
      files,
    });
  });
  await test.step("And the review confirms the refreshed file count", () =>
    review.expectFeedback(
      `Review refreshed: ${files.length} changed files in the accepted landing comparison.`,
    ));
  await test.step("And the review still shows the accepted range after trunk advances", async () => {
    expect(published.revision).not.toBe(landing.accepted);
    await review.landedRun.expectShown(
      `From ${landing.story.trunkTip} to ${landing.accepted}.`,
    );
    await review.files.expectNotShown("Added later.txt");
  });
  await test.step("And reviewing the landing left the recorded comparison intact", async () => {
    expect((await claimedRecord(dashboard)).landing).toEqual(
      landing.record.landing,
    );
  });
});
