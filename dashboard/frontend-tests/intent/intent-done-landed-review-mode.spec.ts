import { prepareFrontendDoneReview } from "../../tests/support/frontendDoneReview.ts";
import { frontendFileDiff } from "../../tests/support/frontendStoryReview.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
// A captured run chosen by Done Intent cannot remain the ordinary Review's
// selection when its readable workspace is requested in the same open panel.
import {
  reviewRegion,
  comparisonChoice,
  landedRunChoice,
  showReviewDetails,
} from "../../tests/support/reviewControls.ts";
import { reviewChanges } from "../../tests/storyCardControls.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";

import { showColumn } from "../../tests/boardPage.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  chooseStoryTab,
  openReviewFromIntent,
  reviewDiff,
} from "../../tests/support/intentStoryPage.ts";
import {
  reviewFeedback,
  fileBrowser,
} from "../../tests/support/reviewContextLine.ts";
import { selectDoneStoryInIntent } from "../../tests/support/selectDoneStoryInIntent.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("ordinary Done Review resets Intent's captured run while the same panel stays open and waits for its live workspace", async ({
  page,
  frontendServices,
}) => {
  const setup = await prepareFrontendDoneReview(
    page,
    frontendServices,
    "captured story test",
  );
  const run = "00000000-0000-4000-8000-000000000001";
  const captured = {
    kind: "landed" as const,
    baseline: setup.live.baseline,
    tree: setup.completion,
    files: setup.live.files,
    landing: {
      ...makeMe.aLaunchLanding
        .comparing({ base: setup.live.baseline, revision: setup.completion })
        .please(),
      workflow: "execution" as const,
      launchedAt: setup.completedAt,
    },
    runs: [
      {
        key: run,
        workflow: "execution" as const,
        launchedAt: setup.completedAt,
        remote: "origin",
        target: "main",
        comparison: { base: setup.live.baseline, revision: setup.completion },
      },
    ],
    selectedRun: run,
  };
  setup.review.answerHistoricalSnapshot("SEED-A#a", captured);
  const { card, intent } = await selectDoneStoryInIntent(page);
  await chooseStoryTab(intent, "Changed tests");
  await openReviewFromIntent(page, intent);
  const review = reviewRegion(page);
  await expect(landedRunChoice(review)).toHaveValue(run);

  // Keep the captured panel open while its ordinary card asks for live Review.
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  const ordinary = reviewChanges(card);
  setup.review.answerSnapshot(setup.live);
  setup.review.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", [
      "+local edit after captured landing",
    ]),
    "dashboard/tests/a.spec.ts",
  );
  const ordinaryRequest = page.waitForRequest(
    (request) => new URL(request.url()).pathname === storyReviewEndpoint,
  );
  const held = setup.review.holdNextSnapshot();
  try {
    await ordinary.click();
    await held.received;
    // Observe the pending live read before revealing anything: the previous
    // run's picker, facts and files are gone even from the hidden content.
    const ordinaryQuery = new URL((await ordinaryRequest).url()).searchParams;
    expect(ordinaryQuery.get("historical")).not.toBe("true");
    expect(ordinaryQuery.has("run")).toBe(false);
    await expect(reviewFeedback(review)).toHaveText(
      "Reading the story's changes…",
    );
    await expect(landedRunChoice(review, { includeHidden: true })).toHaveCount(
      0,
    );
    await expect(
      review.getByRole("heading", {
        name: "Landed run",
        exact: true,
        includeHidden: true,
      }),
    ).toHaveCount(0);
    await expect(fileBrowser(review)).toHaveCount(0);
    held.release();
    await held.delivered;
    await showReviewDetails(review);
    const live = await reviewDiff(page, modified);
    expect(live).toContain("+local edit after captured landing");
    await expect(
      comparisonChoice(review, "All changes", { exact: true }),
    ).toBeChecked();
    await expect(landedRunChoice(review)).toHaveCount(0);
  } finally {
    held.release();
    await held.delivered;
  }
  await closeSidePanel(review);
  await expect(ordinary).toBeFocused();
});
