// A claimed Story Branch Mode launch's landed integration in the story review
// before retirement: the real installed start and the installed
// `history-preserving-publication.mjs integrate` against a real bare origin
// produce the launch record the review reads
// (../../dashboard/test-support/support/storyBranchLandedReview.ts). Only
// the native Codex transport and GitHub's answers are substituted. The
// retired, recorded landing is ./story-review-recorded-landing.spec.ts.
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { browserLocaleString } from "../../dashboard/test-support/browserLocale.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { claimedRecord } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { landedStoryBranch } from "../../dashboard/test-support/support/storyBranchLandedReview.ts";

const repository = "terryyin/open-dough";

test("a Done story offers its exact accepted landing from published history beside its integrated workspace", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  // Two installed native launches and real trunk integration precede the
  // browser comparison.
  test.setTimeout(90_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const { refinement, story, accepted, record } = await landedStoryBranch(
    dashboard,
    origin,
    codexProtocol,
  );
  const { reporting, trunkTip } = story;

  await publishCommittedOrigin(page, {
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
  expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
});
