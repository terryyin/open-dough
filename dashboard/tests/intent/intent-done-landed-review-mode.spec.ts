// A captured run chosen by Done Intent cannot remain the ordinary Review's
// selection when its readable workspace is requested in the same open panel.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { showColumn } from "../boardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { expect, test } from "../support/codexStart.ts";
import { holdNextReviewResponse } from "../support/holdReviewResponse.ts";
import {
  chooseStoryTab,
  openReviewFromIntent,
  reviewDiff,
} from "../support/intentStoryPage.ts";
import { retainedIntentLanding } from "../support/retainedIntentLanding.ts";
import { reviewFeedback } from "../support/reviewContextLine.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import { commitAll, git, lines } from "../support/storyReviewWorktree.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("ordinary Done Review resets Intent's captured run while the same panel stays open and waits for its live workspace", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const implementation = makeMe.aRepository
    .withRevision("captured", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}captured story test\n`,
      },
    })
    .please().revisions[0];
  const { story, accepted } = await retainedIntentLanding(
    dashboard,
    origin,
    codexProtocol,
    implementation,
  );
  // The configured checkout cannot recover its published claims, while the
  // saved completed M and its parents remain readable from their own start.
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  const later = makeMe.aRepository
    .withRevision("later", {
      backlog: null,
      files: { "after-capture.txt": "later trunk\n" },
    })
    .please().revisions[0];
  writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "later trunk after capture");
  git(origin.project, "push", "--quiet", "origin", "main");
  const observed = git(origin.project, "rev-parse", "HEAD");
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const local = makeMe.aRepository
    .withRevision("retained-local", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": "local edit after captured landing\n",
      },
    })
    .please().revisions[0];
  writeRevisionFiles(story.workspace, local);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: observed,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const received = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("historical") === "true"
    );
  });
  const { card, intent } = await selectDoneStoryInIntent(page);
  expect(storyReviewSchema.parse(await (await received).json())).toMatchObject({
    kind: "landed",
    baseline: story.trunkTip,
    tree: accepted,
    selectedRun: story.reporting.reference,
  });
  await chooseStoryTab(intent, "Changed tests");
  await openReviewFromIntent(page, intent);
  const review = page.getByRole("region", { name: "Story review" });
  await expect(review.getByRole("listbox", { name: "Landed run" })).toHaveValue(
    story.reporting.reference,
  );

  // Restore ordinary workspace ancestry while keeping the captured panel open.
  git(origin.project, "fetch", "--quiet", "--unshallow", "origin", "main");
  // Keep the captured panel open while its ordinary card asks for live Review.
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  const ordinary = card.getByRole("button", { name: "Review changes" });
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await ordinary.click();
    const answer = storyReviewSchema.parse(await (await held.ready).json());
    expect(answer.kind).toBe("snapshot");
    expect(answer.selectedRun).toBeUndefined();
    await expect(reviewFeedback(review)).toHaveText(
      "Reading the story's changes…",
    );
    await expect(
      review.getByRole("listbox", { name: "Landed run" }),
    ).toHaveCount(0);
    await expect(
      review.getByRole("heading", { name: "Landed run", exact: true }),
    ).toHaveCount(0);
    await expect(review.locator(".story-review-files")).toHaveCount(0);
    held.release();
    await held.delivery;
    const live = await reviewDiff(page, modified);
    expect(live).toContain("+local edit after captured landing");
    await expect(
      review.getByRole("radio", { name: "All changes", exact: true }),
    ).toBeChecked();
    await expect(
      review.getByRole("listbox", { name: "Landed run" }),
    ).toHaveCount(0);
  } finally {
    held.release();
    await held.delivery;
  }
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(ordinary).toBeFocused();
});
