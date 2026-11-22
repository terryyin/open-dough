import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import { browserLocaleString } from "../../test-support/browserLocale.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import {
  frontendFileDiff,
  frontendReviewIds as ids,
  frontendSessionCommitsReview,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";

test("the session's saved branch and delivery switch by keyboard and survive refresh", async ({
  page,
  frontendServices,
}) => {
  const title = "Review the delivered draft";
  const path = "draft.txt";
  const file = { kind: "added" as const, path };
  const doneAt = new Date().toISOString();
  const landing = makeMe.aLaunchLanding
    .comparing({ base: ids.baseline, revision: ids.commit })
    .please();
  const session = makeMe.aLaunchRecord
    .adHoc({ title })
    .withLanding(landing)
    .markedDoneAt(doneAt)
    .please();
  const keys = ["delivered", "branch-result"];
  const answers = await installFrontendStoryReview(page, {
    kind: "landed",
    landing: landedReviewContextSchema.parse({
      ...landing,
      workflow: "ad-hoc",
      launchedAt: session.launchedAt,
    }),
    baseline: ids.baseline,
    tree: ids.commit,
    files: [file],
    selectedRun: "delivered",
    sessionComparisonKeys: keys,
  });
  answers.answerRunSnapshot("branch-result", {
    kind: "branch-result",
    doneAt,
    baseline: ids.head,
    tree: ids.tree,
    files: [file, { kind: "added", path: "extra.txt" }],
    selectedRun: "branch-result",
    sessionComparisonKeys: keys,
  });
  answers.answerFile(frontendFileDiff(path, ["+delivered text"]), path);
  await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  const journey = sidePanelPages(page);
  await journey.phase("open the delivered comparison", (pages) => {
    const review = pages.board.reviewDoneSession(title);
    pages.reviewToolbar.expectName("Delivered to trunk");
    pages.sessionRuns
      .expectRuns(["Delivered to trunk", "Branch at Done"])
      .expectShown("Delivered to trunk");
    review
      .expectChangedFiles("1 changed file")
      .expectFileDiff("Added draft.txt", "delivered text");
  });
  expect(answers.queriesAsked(storyReviewFileEndpoint)).toContainEqual(
    expect.objectContaining({
      baseline: ids.baseline,
      tree: ids.commit,
      path,
      reference: landing.reference,
    }),
  );

  const deliveryReply = answers.holdNextSnapshot();
  await journey.phase("refreshing requests the delivery again", (pages) => {
    pages.storyReview.refresh();
  });
  await deliveryReply.received;
  answers.answerFile(frontendFileDiff(path, ["+branch text"]), path);
  await journey.phase("choose the branch with the keyboard", (pages) => {
    pages.sessionRuns
      .pressFrom("Delivered to trunk", "ArrowRight")
      .expectShown("Branch at Done");
    pages.reviewToolbar.expectName("Branch at Done");
    pages.storyReview.expectFileDiff("Added draft.txt", "branch text");
  });
  expect(answers.queriesAsked(storyReviewFileEndpoint).at(-1)).toMatchObject({
    baseline: ids.head,
    tree: ids.tree,
    path,
  });
  expect(
    answers.queriesAsked(storyReviewFileEndpoint).at(-1),
  ).not.toHaveProperty("reference");

  deliveryReply.release();
  await deliveryReply.delivered;
  await journey.phase(
    "the delayed delivery leaves the branch selected",
    (pages) => {
      pages.storyReview
        .expectFeedback(
          "Review refreshed: 2 changed files in the branch result at Done.",
        )
        .expectFileDiff("Added draft.txt", "branch text")
        .expectChangedFiles("2 changed files");
      pages.sessionRuns.expectShown("Branch at Done");
    },
  );

  const reads = answers.queriesAsked(storyReviewEndpoint).length;
  await journey.phase("refresh retains the branch", (pages) => {
    pages.storyReview
      .refresh()
      .expectFeedback(
        "Review refreshed: 2 changed files in the branch result at Done.",
      )
      .expectFileDiff("Added draft.txt", "branch text");
    pages.sessionRuns.expectShown("Branch at Done");
    pages.storyReview.close();
    pages.board.expectDoneSessionReviewFocused(title);
  });
  expect(answers.queriesAsked(storyReviewEndpoint).slice(reads)).toContainEqual(
    expect.objectContaining({
      session: session.session.sessionId,
      run: "branch-result",
    }),
  );
});

test("the saved branch leaves a session's Default main commits available", async ({
  page,
  frontendServices,
}) => {
  const title = "Review work in both places";
  const doneAt = new Date().toISOString();
  const secondAt = "2026-01-02T12:00:00.000Z";
  const session = makeMe.aLaunchRecord
    .adHoc({ title })
    .markedDoneAt(doneAt)
    .keptSessionCommits({
      repository: "/tmp/default-main/.git",
      runs: [
        { base: ids.baseline, revision: ids.commit },
        { base: ids.commitTree, revision: ids.uncommittedTree },
      ],
    })
    .please();
  const keys = ["branch-result", "0", "1"];
  const answers = await installFrontendStoryReview(page, {
    kind: "branch-result",
    doneAt,
    baseline: ids.head,
    tree: ids.tree,
    files: [],
    selectedRun: "branch-result",
    sessionComparisonKeys: keys,
  });
  const facts = [
    { commits: 1, subject: "Earlier", committedAt: "2026-01-02T11:00:00.000Z" },
    { commits: 2, subject: "Later", committedAt: secondAt },
  ];
  answers.answerRunSnapshot(0, {
    ...frontendSessionCommitsReview(session, [], 0, facts),
    selectedRun: "0",
    sessionComparisonKeys: keys,
  });
  answers.answerRunSnapshot(1, {
    ...frontendSessionCommitsReview(
      session,
      [{ kind: "added", path: "later.txt" }],
      1,
      facts,
    ),
    selectedRun: "1",
    sessionComparisonKeys: keys,
  });
  answers.answerFile(
    frontendFileDiff("later.txt", ["+later commit"]),
    "later.txt",
  );
  const laterRun = `2 commits — Later — ${await browserLocaleString(page, secondAt)}`;
  await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  await sidePanelPages(page).phase(
    "read the Default main comparison",
    (pages) => {
      const review = pages.board.reviewDoneSession(title);
      pages.sessionRuns
        .expectRuns(["Branch at Done", "Default main commits"])
        .choose("Default main commits")
        .expectShown("Default main commits");
      pages.reviewToolbar.expectName("Default main commits");
      review.expectBodyText(
        "No changes: these session commits leave no difference.",
      );
      pages.sessionRuns
        .chooseDefaultMainRun(laterRun)
        .expectShown("Default main commits");
      review.expectFileDiff("Added later.txt", "later commit");
      review
        .refresh()
        .expectFeedback(
          "Review refreshed: 1 changed file in the kept session commits.",
        );
      review.expectFileDiff("Added later.txt", "later commit");
    },
  );
  expect(answers.queriesAsked(storyReviewEndpoint).at(-1)).toMatchObject({
    session: session.session.sessionId,
    run: "1",
  });
});
