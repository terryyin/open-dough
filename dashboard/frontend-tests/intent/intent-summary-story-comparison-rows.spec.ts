import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { rowTextsOf } from "./intent-ci-comparison-page.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
  mergeEditedNestedComparisonRows,
  nestedComparisonRows,
} from "./intent-summary-comparison-expected.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  comparisonLabels,
  expectComparisonCues,
  expectComparisonRows,
  expectObservedBuildFraming,
  fileProofTable,
  openComparedFileProof,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import {
  expectEvidenceLabels,
  expectLabelInFull,
} from "./intent-summary-evidence-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";

const entry = "dashboard/tests";
const folder = `${entry}/folder`;
const nested = `${folder}/nested`;
const nestedFile = `${nested}/c.spec.ts`;

async function openNestedSummary(
  story = makeMe.aComparedStory.inSummaryScope().please(),
) {
  await openSummaryComparison(story);
  const summary = await openSummary(entry);
  await openComparedFolder(summary, folder);
  await openComparedFolder(summary, nested);
  return summary;
}

test("nested Summary renders precise endpoint rows for unchanged c.spec.ts", async () => {
  const summary = await openNestedSummary();
  await expectComparisonRows(summary, nestedComparisonRows);
});

test("nested Summary identifies the evidence for its comparison endpoints", async () => {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  const summary = await openNestedSummary(story);
  await expectEvidenceLabels(comparisonLabels(summary, story.identity), [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expectObservedBuildFraming(summary);
});

test("file Proof renders precise endpoint rows for unchanged c.spec.ts", async () => {
  const summary = await openNestedSummary();
  const proof = await openComparedFileProof(summary, "c.spec.ts");
  const table = fileProofTable(proof, nestedFile);
  await expect
    .poll(() => rowTextsOf(table))
    .toEqual([
      [nestedFile, "1 test case (no change)", "340 ms", "+70 ms", "+70 ms"],
    ]);
});

test("Summary labels stay audible in browse mode and entry cues keep their independent count and duration meanings", async () => {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  await openSummaryComparison(story);
  const summary = await openSummary(entry);
  const labels = comparisonLabels(summary, story.identity);
  await expectEvidenceLabels(labels, [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expectObservedBuildFraming(summary);
  await expect.element(labels).toMatchAriaInlineSnapshot(`
    - list "CI timing comparison of SEED-A#a":
      - listitem:
        - text: Baseline No build
        - code: aaaaaaa
        - text: ", No build at aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: the workflow at that revision could not be read."
      - listitem:
        - text: Branch
        - code: bbbbbbb
      - listitem:
        - text: Landed
        - code: ccccccc
  `);
  await expectComparisonRows(summary, entryComparisonRows);
  await expectComparisonCues(summary, entry, [
    { count: "more-light", duration: "slower-strong" },
    { count: "none", duration: "slower-light", countReason: "unchanged" },
    {
      count: "none",
      duration: "none",
      countReason: "added",
      durationReason: "added",
    },
    {
      count: "none",
      duration: "none",
      countReason: "removed",
      durationReason: "removed",
    },
    {
      count: "none",
      duration: "none",
      countReason: "units not comparable",
      durationReason: "units not comparable",
    },
    {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "unchanged",
    },
  ]);
});

test("folder Summary keeps unchanged and below-threshold cue reasons", async () => {
  await openSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());
  const summary = await openSummary(entry);
  await openComparedFolder(summary, folder);
  await expectComparisonRows(summary, folderComparisonRows);
  await expectComparisonCues(summary, folder, [
    { count: "none", duration: "slower-light", countReason: "unchanged" },
    {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "below threshold",
    },
    { count: "none", duration: "slower-light", countReason: "unchanged" },
  ]);
});

test("a nested Summary marks a file changed only by its owning merge while keeping its precise comparison", async () => {
  const owningMerge = makeMe.aStoryReview.modifying(nestedFile).please();
  if (owningMerge.kind !== "published-taken")
    throw new Error("Arrange the owning merge");
  const summary = await openNestedSummary(
    makeMe.aComparedStory
      .inSummaryScope()
      .withChanged(...owningMerge.files)
      .please(),
  );
  await expectComparisonRows(summary, mergeEditedNestedComparisonRows);
});

test("Summary names a skipped Baseline beside its ancestor and exposes its complete status on hover and to browse reading", async () => {
  const skippedAt =
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor aaaaaaa.";
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withBaseline({
      requestedStatus: { kind: "skipped", explanation: skippedAt },
    })
    .please();
  await openSummaryComparison(story);
  const summary = await openSummary(entry);
  await expectLabelInFull(
    comparisonLabels(summary, story.identity),
    "Baseline Skipped aaaaaaa",
    skippedAt,
  );
});
