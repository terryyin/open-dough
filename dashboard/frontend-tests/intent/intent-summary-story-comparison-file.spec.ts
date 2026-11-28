// A changed file's Purpose and Proof through the production Intent page.
// The review answer names the owning merge's changed files. Endpoint figures
// and cue reasons also have individual cases in file-proof-counts.spec.ts.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { heldReply } from "./intent-ci-evidence-page.tsx";
import {
  addedFile,
  addedFileRow,
  mergeEditedFile,
  mergeEditedFileRow,
  modifiedFile,
  modifiedFileRow,
  renamedFile,
  renamedFileRow,
} from "./intent-compared-file-expected.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  comparisonLabels,
  expectFileComparisonRow,
  expectNoComparisonFraming,
  expectNoFileTimingMarks,
  expectObservedBuildFraming,
} from "./intent-summary-comparison-page.ts";
import { expectEvidenceLabels } from "./intent-summary-evidence-page.ts";
import { press } from "./intent-summary-proof-page.ts";

const diffLines = new Map([
  [modifiedFile, "changed"],
  [addedFile, "added"],
  [renamedFile, "renamed"],
  [mergeEditedFile, "merge edit"],
]);

async function openSelectedFileProof(story: ComparedStory) {
  const held = heldReply<undefined>();
  const { comparisonReads, proofReads } = await openSummaryComparison(story, {
    holdComparisonUntil: held.promise,
    fileDiff: ({ path }) => {
      if (path === undefined) throw new Error("No file path requested");
      const line = diffLines.get(path);
      if (line === undefined)
        throw new Error(`No file diff arranged for ${path}`);
      return Promise.resolve(
        makeMe.aReviewedFileDiff.adding(path, line).please(),
      );
    },
  });
  const view = intentStoryCompare();
  await expect
    .element(view.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => comparisonReads.map(({ identity }) => identity))
    .toEqual([story.identity]);
  expect(proofReads).toHaveLength(0);
  held.resolve(undefined);

  const file = view.file(`Modified ${modifiedFile}`);
  press(file);
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const proof = intent.getByRole("region", { name: "Proof", exact: true });
  const tabs = intent.getByRole("tablist", {
    name: "Purpose and Proof",
    exact: true,
  });
  const purposeTab = tabs.getByRole("tab", { name: "Purpose", exact: true });
  const proofTab = tabs.getByRole("tab", { name: "Proof", exact: true });
  await expect.element(purposeTab).toHaveAttribute("aria-selected", "true");
  await expect.poll(view.diffName).toBe(`Modified ${modifiedFile}`);
  await expect.poll(view.diffCode).toContain("changed");
  await expect.element(purpose.getByRole("table")).not.toBeInTheDocument();
  await expectNoComparisonFraming(purpose);
  await expect
    .element(intent.getByRole("region", { name: "File summary", exact: true }))
    .not.toBeInTheDocument();

  await expect
    .poll(() => proofReads.map(({ subject }) => subject.runId))
    .toEqual([1, 2, 3]);
  const originalAttempts = proofReads.map(({ subject }) => subject);

  press(proofTab);
  await expect.element(proofTab).toHaveAttribute("aria-selected", "true");
  await expectEvidenceLabels(comparisonLabels(proof, story.identity), [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expectObservedBuildFraming(proof);
  await expectFileComparisonRow(proof, modifiedFile, modifiedFileRow);
  expect(proofReads.map(({ subject }) => subject)).toEqual(originalAttempts);

  return {
    view,
    file,
    proof,
    purposeTab,
    proofTab,
    proofReads,
    originalAttempts,
  };
}

async function showsAddedFile({
  view,
  proof,
  proofTab,
  purposeTab,
}: Awaited<ReturnType<typeof openSelectedFileProof>>) {
  press(view.file(`Added ${addedFile}`));
  await expect.element(proofTab).toHaveAttribute("aria-selected", "true");
  await expectFileComparisonRow(proof, addedFile, addedFileRow);
  press(purposeTab);
  await expect.poll(view.diffName).toBe(`Added ${addedFile}`);
}

test("a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with clean merges", async () => {
  const reading = await openSelectedFileProof(
    makeMe.aComparedStory.inSummaryScope().please(),
  );
  const {
    view,
    file,
    proof,
    proofTab,
    purposeTab,
    proofReads,
    originalAttempts,
  } = reading;
  const toComparison = proof.getByRole("button", {
    name: "View story CI comparison",
    exact: true,
  });
  (toComparison.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  const comparisonTab = view.viewTab("CI comparison");
  await expect.element(comparisonTab).toHaveAttribute("aria-selected", "true");
  await expect.element(comparisonTab).toHaveFocus();
  await expect
    .element(page.getByRole("table", { name: "CI entry timing comparison" }))
    .toBeVisible();
  await expect.element(proof).not.toBeInTheDocument();

  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(view.viewTab("Intent coverage"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(file).toHaveAttribute("aria-pressed", "false");
  press(file);
  await expect.element(proofTab).toHaveAttribute("aria-selected", "true");
  await expect.element(proof).toBeVisible();

  await showsAddedFile(reading);
  press(view.file(`Renamed tests/old.sh → ${renamedFile}`));
  press(proofTab);
  await expectFileComparisonRow(proof, renamedFile, renamedFileRow);
  expectNoFileTimingMarks(proof);
  press(purposeTab);
  expect(proofReads.map(({ subject }) => subject)).toEqual(originalAttempts);
});

test("a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with merge-edited merges", async () => {
  const edit = makeMe.aStoryReview.modifying(mergeEditedFile).please();
  if (edit.kind !== "published-taken")
    throw new Error("Arrange the owning merge");
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withChanged(...edit.files)
    .please();
  const reading = await openSelectedFileProof(story);
  const { view, proof, proofTab, purposeTab, proofReads, originalAttempts } =
    reading;

  await showsAddedFile(reading);
  press(view.file(`Modified ${mergeEditedFile}`));
  await expect.poll(view.diffName).toBe(`Modified ${mergeEditedFile}`);
  await expect.poll(view.diffCode).toContain("merge edit");
  expect(view.diffCode()).not.toContain("changed");
  press(proofTab);
  await expectFileComparisonRow(proof, mergeEditedFile, mergeEditedFileRow);
  press(purposeTab);
  expect(proofReads.map(({ subject }) => subject)).toEqual(originalAttempts);
});
