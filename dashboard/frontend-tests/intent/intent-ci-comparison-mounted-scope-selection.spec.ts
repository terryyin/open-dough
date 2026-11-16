// Real target transitions and Taken judgment/comparison coupling. Fast reading
// facets live in backend-tests/intent/ci-comparison-client-scopes.spec.ts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
  updateComparison,
} from "../../tests/support/comparisonMountPage.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectLabelInFull,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../../tests/ciEvidenceLabelsPage.ts";
import { expectComparisonScopeRows } from "../../tests/intentScopeProofPage.ts";
import { entryComparisonRows } from "../../tests/support/summaryComparisonExpectedRows.ts";

test("selecting a queued story clears the previous Summary comparison and Baseline column", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope();
  const facts = story.please();
  comparisonServices.serve(facts);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await updateComparison(page, story.ofQueuedStory().please());
  await expectNoComparisonFraming(summary);
  await expect(comparisonLabels(summary, facts.identity)).toHaveCount(0);
  await expect(
    summary.getByRole("columnheader", { name: "Baseline" }),
  ).toHaveCount(0);
  await expect(summary).not.toContainText(facts.identity);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});

test("a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = makeMe.aComparedStory
    .inSummaryScope()
    .takenOnStoryBranch()
    .please();
  comparisonServices.serve(facts);
  Object.assign(comparisonServices, {
    status: (params: URLSearchParams) => ({
      json:
        params.get("kept") === "1"
          ? { none: true }
          : makeMe.anIntentCiStatus
              .with({
                branch: "feature/a",
                revision: facts.work.revision,
                subject: "branch",
                state: "unread",
                laterWithoutResult: 0,
                reason: "Live branch judgment unavailable",
                checkedAt: facts.answer.checkedAt,
                freshness: "fresh",
              })
              .please(),
    }),
  });
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const labels = comparisonLabels(summary, "Story A");
  await expectEvidenceLabels(labels, [
    "Provisional",
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed Not landed yet",
  ]);
  await expectLabelInFull(
    labels,
    "Landed Not landed yet",
    /has not landed yet/,
  );
  await expectObservedNotAttributed(summary);
  await expect(
    summary.getByRole("table", {
      name: "CI proof of the immediate folders and files of dashboard/tests",
    }),
  ).toBeVisible();
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(2);
  await expect.poll(() => comparisonServices.statuses).toBe(2);
});
