import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { cueOf } from "./intent-ci-comparison-page.ts";
import {
  addedFile,
  addedFileRow,
  mergeEditedFile,
  mergeEditedFileRow,
  modifiedFile,
  modifiedFileRow,
  renamedFile,
  renamedFileRow,
  unchangedFile,
  unchangedFileRow,
} from "./intent-compared-file-expected.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  comparisonLabels,
  expectFileComparisonRow,
  expectNoFileTimingMarks,
  expectObservedBuildFraming,
  fileProofTable,
  type ExpectedCues,
  type FileComparisonRow,
} from "./intent-summary-comparison-page.ts";
import { expectEvidenceLabels } from "./intent-summary-evidence-page.ts";

async function showsFileEvidence(
  name: string,
  path: string,
  row: FileComparisonRow,
  cues: ExpectedCues,
  story = makeMe.aComparedStory.inSummaryScope().please(),
) {
  await openSummaryComparison(story);
  const view = intentStoryCompare();
  await view.file(name).click();
  await view.chooseProof();
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  await expectEvidenceLabels(comparisonLabels(proof, story.identity), [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expectObservedBuildFraming(proof);
  await expectFileComparisonRow(proof, path, row);
  const table = fileProofTable(proof, path);
  await expect
    .poll(() => {
      const row = table.query()?.querySelector("tbody tr");
      return row ? cueOf(row) : null;
    })
    .toMatchObject(cues);
  return proof;
}

test("file Proof keeps modified counts, precise times and source cues", async () => {
  await showsFileEvidence(
    `Modified ${modifiedFile}`,
    modifiedFile,
    modifiedFileRow,
    {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    },
  );
});

test("file Proof keeps added counts, precise times and source cues", async () => {
  await showsFileEvidence(`Added ${addedFile}`, addedFile, addedFileRow, {
    count: "none",
    duration: "none",
    countReason: "added",
    durationReason: "added",
  });
});

test("file Proof keeps renamed across units counts, precise times and source cues", async () => {
  const branchEntry = makeMe.aCiProofEntry
    .at("dashboard/tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .withFile(renamedFile, { passed: 1, durationMs: 2_100 })
        .withFile(unchangedFile, { passed: 17, durationMs: 1_200 })
        .please(),
    )
    .please();
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withEntriesAt("branch", [branchEntry])
    .please();
  const proof = await showsFileEvidence(
    `Renamed tests/old.sh → ${renamedFile}`,
    renamedFile,
    renamedFileRow,
    {
      count: "none",
      duration: "none",
      countReason: "units not comparable",
      durationReason: "units not comparable",
    },
    story,
  );
  expectNoFileTimingMarks(proof);
});

test("file Proof keeps unchanged counts, precise times and source cues", async () => {
  await showsFileEvidence(unchangedFile, unchangedFile, unchangedFileRow, {
    count: "none",
    duration: "none",
    countReason: "unchanged",
    durationReason: "unchanged",
  });
});

test("file Proof keeps owning merge modified counts, precise times and source cues", async () => {
  const edit = makeMe.aStoryReview.modifying(mergeEditedFile).pleaseRange();
  if (edit.kind !== "comparison") throw new Error("Arrange the owning merge");
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withChanged(...edit.files)
    .please();
  await showsFileEvidence(
    `Modified ${mergeEditedFile}`,
    mergeEditedFile,
    mergeEditedFileRow,
    {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "below threshold",
    },
    story,
  );
});
