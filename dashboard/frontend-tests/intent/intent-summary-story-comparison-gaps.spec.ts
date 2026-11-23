// Comparison gaps read through the mounted Intent page and its typed CI reads.
import { expect, test } from "vitest";
import type { Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciReadingText } from "./intent-attempt-proof-page.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { entryComparisonRows } from "./intent-summary-comparison-expected.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  noBreakdownEntryRows,
  runningLandedEntryRows,
  trunkEntryRows,
} from "./intent-summary-comparison-gap-expected.ts";
import {
  comparisonLabels,
  expectComparisonRows,
  expectNoComparisonFraming,
  expectObservedBuildFraming,
  fileProofTable,
  openComparedFileProof,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
} from "./intent-summary-evidence-page.ts";
import { openSummary, scopeTable } from "./intent-summary-proof-page.ts";

const entry = "dashboard/tests";
const folder = "dashboard/tests/folder";

test("Summary keeps entry totals and explains every child when Baseline lacks file breakdown", async () => {
  const baseline = [
    makeMe.aCiProofEntry.at(entry).counting(4).timed(12_040).please(),
    makeMe.aCiProofEntry.at("tests").counting(2, "file").timed(2_500).please(),
  ];
  await openSummaryComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withEntriesAt("baseline", baseline)
      .please(),
  );
  const summary = await openSummary(entry);
  await expectObservedBuildFraming(summary);
  await expectComparisonRows(summary, noBreakdownEntryRows);
});

test("Summary retains Branch figures and explicit running Landed gaps in every row", async () => {
  await openSummaryComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withLanded({ kind: "running" })
      .please(),
  );
  await expectComparisonRows(await openSummary(entry), runningLandedEntryRows);
});

test("a done Trunk Summary names Branch not applicable and preserves each Landed difference", async () => {
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
  await openSummaryComparison(facts);
  const summary = await openSummary(entry);
  await expectEvidenceLabels(
    comparisonLabels(summary, facts.identity),
    [
      "Baseline No build aaaaaaa",
      "Branch Not applicable",
      "Landed No build ccccccc",
    ],
    { leading: true },
  );
  await expectComparisonRows(summary, trunkEntryRows);
});

test("a queued selection renders no previous Summary comparison or Baseline column", async () => {
  const queued = makeMe.aComparedStory.ofQueuedStory().please();
  const done = makeMe.aComparedStory
    .inSummaryScope()
    .withWork({ backlog: queued.work.backlog })
    .please();
  const { selectStory } = await openSummaryComparison(done);
  const summary = await openSummary(entry);
  await expectComparisonRows(summary, entryComparisonRows);

  await selectStory(queued.identity, "Story B");
  await intentStoryCompare().chooseTab("Changes");
  await openSummary(entry);
  await expectNoComparisonFraming(summary);
  await expect
    .element(comparisonLabels(summary, done.identity))
    .not.toBeInTheDocument();
  await expect
    .element(summary.getByRole("columnheader", { name: "Baseline" }))
    .not.toBeInTheDocument();
  await expect
    .poll(() => ciReadingText(summary.query()?.textContent))
    .not.toContain(done.identity);
});

async function expectTimingGap(figure: Locator, label: string, full: string) {
  await expect
    .poll(() => ciReadingText(figure.query()?.textContent))
    .toBe(label);
  await expect.element(figure).toHaveAccessibleDescription(full);
}

test("a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint", async () => {
  const branch = makeMe.aCiProofEntry
    .at(entry)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .withFile("dashboard/tests/folder/a.spec.ts", {
          passed: 1,
          durationMs: 300,
        })
        .withUnbrokenPart({ passed: 1, durationMs: 100 })
        .withMissingNextPart()
        .please(),
    )
    .please();
  await openSummaryComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .takenOnStoryBranch()
      .withEntriesAt("branch", [branch])
      .please(),
  );
  const summary = await openSummary(entry);
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
    "The story has not landed yet.",
  );
  await expectObservedBuildFraming(summary);
  await expect.element(scopeTable(summary, entry)).toBeVisible();

  await expectTimingGap(
    comparisonIn(summary).figure(entry, "Branch"),
    "Part 3 missing",
    "Partial: part 3 of 3 missing",
  );
  const outside = evidenceLabels(summary, "Not in the rows above");
  await expectEvidenceLabels(outside, ["Part 2 no breakdown"]);
  await expectLabelInFull(
    outside,
    "Part 2 no breakdown",
    "part 2 of 3 has no file breakdown",
  );

  const partialLabel = "Part 3 missing, Part 2 no breakdown";
  const partialDescription =
    "Partial: part 3 of 3 missing and part 2 of 3 has no file breakdown";
  await openComparedFolder(summary, folder);
  await expectTimingGap(
    comparisonIn(summary).figure(folder, "Branch"),
    partialLabel,
    partialDescription,
  );
  await expectObservedBuildFraming(summary);

  const proof = await openComparedFileProof(summary, "a.spec.ts");
  const fileGap = fileProofTable(
    proof,
    "dashboard/tests/folder/a.spec.ts",
  ).getByRole("cell", { name: partialLabel, exact: true });
  await expectTimingGap(fileGap, partialLabel, partialDescription);
  await expectObservedBuildFraming(proof);
});
