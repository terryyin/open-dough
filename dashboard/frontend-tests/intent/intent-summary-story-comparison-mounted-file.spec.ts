import { timeMarks } from "../../tests/support/relativeTimingMarks.ts";
import { expectFileComparisonRow } from "../../tests/intentFileProofPage.ts";
// File Proof rules use real scope owners; Purpose and tab return stay integrated.
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import {
  modifiedFileRow,
  addedFileRow,
  renamedFileRow,
  unchangedFileRow,
  mergeEditedFileRow,
} from "../../tests/support/summaryComparisonFileExpectedRows.ts";
import { expectProofRowCues } from "../../tests/support/expectCiComparisonCues.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectObservedNotAttributed,
} from "../../tests/ciEvidenceLabelsPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const examples = [
  {
    name: "modified",
    path: "dashboard/tests/folder/a.spec.ts",
    row: modifiedFileRow,
    cues: { count: "none", duration: "slower-light", countReason: "unchanged" },
  },
  {
    name: "added",
    path: "dashboard/tests/added.spec.ts",
    row: addedFileRow,
    cues: {
      count: "none",
      duration: "none",
      countReason: "added",
      durationReason: "added",
    },
  },
  {
    name: "renamed across units",
    path: "dashboard/tests/renamed.spec.ts",
    row: renamedFileRow,
    cues: {
      count: "none",
      duration: "none",
      countReason: "units not comparable",
      durationReason: "units not comparable",
    },
  },
  {
    name: "unchanged",
    path: "dashboard/tests/root.spec.ts",
    row: unchangedFileRow,
    cues: {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "unchanged",
    },
  },
  {
    name: "owning merge modified",
    path: "dashboard/tests/folder/nested/c.spec.ts",
    row: mergeEditedFileRow,
    cues: {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "below threshold",
    },
  },
];

for (const example of examples) {
  test(`file Proof keeps ${example.name} counts, precise times and source cues`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = summaryScopeFacts();
    const changed =
      example.name === "owning merge modified"
        ? [
            ...facts.scope.changed,
            makeMe.aReviewedFile
              .with({ kind: "modified", path: example.path })
              .please(),
          ]
        : facts.scope.changed;
    const rendered = comparisonRenderFacts(facts, facts.entries);
    await renderComparison(page, comparisonRenderer, {
      ...rendered,
      scope: {
        ...facts.scope,
        changed,
        selection: { path: example.path, scope: "file" },
      },
    });
    const proof = page.getByRole("region", { name: "Proof", exact: true });
    await expectEvidenceLabels(comparisonLabels(proof, facts.identity), [
      "Baseline No build aaaaaaa",
      "Branch bbbbbbb",
      "Landed ccccccc",
    ]);
    await expectObservedNotAttributed(proof);
    await expectFileComparisonRow(proof, example.path, example.row);
    await expectProofRowCues(proof, example.path, example.cues);
    if (example.name === "renamed across units")
      await expect(timeMarks(proof)).toHaveCount(0);
  });
}
