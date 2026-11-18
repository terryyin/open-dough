// Real Summary gap rendering with canonical prepared endpoint and proof answers.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../test-support/support/pageTest.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import { expectComparisonScopeRows } from "../../test-support/intentScopeProofPage.ts";
import {
  noBreakdownEntryRows,
  runningLandedEntryRows,
  trunkEntryRows,
} from "../../test-support/support/summaryComparisonGapExpectedRows.ts";
import { entryComparisonRows } from "../../test-support/support/summaryComparisonExpectedRows.ts";

test("Summary keeps entry totals and explains every child when Baseline lacks file breakdown", async ({
  page,
  renderComparison,
}) => {
  const baseline = [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .counting(4)
      .timed(12_040)
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(2, "file").timed(2_500).please(),
  ];
  await renderComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withEntriesAt("baseline", baseline)
      .please(),
  );
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectObservedNotAttributed(summary);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    noBreakdownEntryRows,
  );
});

test("Summary retains Branch figures and explicit running Landed gaps in every row", async ({
  page,
  renderComparison,
}) => {
  await renderComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withLanded({ kind: "running" })
      .please(),
  );
  await expectComparisonScopeRows(
    page.getByRole("region", { name: "Summary", exact: true }),
    "dashboard/tests",
    runningLandedEntryRows,
  );
});

test("a done Trunk Summary names Branch not applicable and preserves each Landed difference", async ({
  page,
  renderComparison,
}) => {
  const facts = makeMe.aComparedStory
    .inSummaryScope()
    .withAnswer({
      mode: "trunk",
      branch: {
        kind: "not-applicable",
        explanation:
          "Branch comparison is not applicable for a Trunk Mode story.",
      },
    })
    .withLanded({
      selection: "ancestor",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "no-build",
        explanation:
          "No build at completion: the workflow at that revision could not be read.",
      },
    })
    .please();
  await renderComparison(facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectLeadingEvidenceLabels(comparisonLabels(summary, facts.identity), [
    "Baseline No build aaaaaaa",
    "Branch Not applicable",
    "Landed No build ccccccc",
  ]);
  await expectComparisonScopeRows(summary, "dashboard/tests", trunkEntryRows);
});

test("a queued selection renders no previous Summary comparison or Baseline column", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope();
  const facts = story.please();
  await renderComparison(facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await renderComparison(story.ofQueuedStory().please());
  await expectNoComparisonFraming(summary);
  await expect(comparisonLabels(summary, facts.identity)).toHaveCount(0);
  await expect(
    summary.getByRole("columnheader", { name: "Baseline" }),
  ).toHaveCount(0);
  await expect(summary).not.toContainText(facts.identity);
});

test("a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint", async ({
  page,
  renderComparison,
}) => {
  await renderComparison(
    makeMe.aComparedStory.inSummaryScope().takenOnStoryBranch().please(),
  );
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
});
