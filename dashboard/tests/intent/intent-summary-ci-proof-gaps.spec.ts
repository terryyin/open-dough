import { fileSource } from "../intentCodeBrowsePage.ts";
// A selected Intent entry's or folder's Summary when CI's evidence is
// missing, partial or absent (../../src/IntentScopeProof.tsx,
// ../../src/ciScopeProof.ts, ../intentSummaryCiProofFixtures.ts): a missing
// shard and a shard without a file breakdown keep the entry's totals and
// leave every child partial with short gap labels whose full explanation is
// the cell's accessible description and hover, an entry-only summary is
// labelled as having no file breakdown, and a run without a summary keeps the children for
// drilling down, saying why as the homepage does. Complete evidence:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
  labelWords,
} from "../ciEvidenceLabelsPage.ts";
import { proofOf, run } from "../intentCiProofPage.ts";
import {
  childName,
  expectScopeRows,
  scopeFigures,
  scopeTable,
} from "../intentScopeProofPage.ts";
import {
  bothEntriesSummary,
  openIntent,
  openSummary,
} from "../intentSummaryCiProofFixtures.ts";
import { runArtifactsAnswer } from "../support/ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../support/ciProofCollected.ts";

const missing = "part 3 of 3 missing";
const noBreakdown = "part 2 of 3 has no file breakdown";

test("a missing shard and a shard without a file breakdown keep the entry's totals and leave every child partial", async ({
  page,
}) => {
  const text = collectedSummary(
    run,
    [{ entry: "dashboard/tests", parts: 3 }],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 3,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/folder/a.spec.ts", "expected", [300]],
        ]),
      },
      {
        entries: ["dashboard/tests"],
        part: 2,
        of: 3,
        byFile: false,
        record: playwrightRecord([
          ["dashboard/tests/folder/b.spec.ts", "expected", [100]],
        ]),
      },
    ],
  );
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const summary = await openSummary(intent, "dashboard/tests");
  await expectScopeRows(summary, "dashboard/tests", [
    [
      "dashboard/tests",
      "2 passed test cases",
      "Part 3 missing",
      `2 of 3 parts present; ${missing}`,
    ],
    ["folder/", "1 passed test case", "Part 3 missing, Part 2 no breakdown"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "no CI result", "no CI result"],
  ]);
  const timeCell = (row: number) =>
    scopeTable(summary, "dashboard/tests")
      .locator("tbody")
      .getByRole("row")
      .nth(row)
      .getByRole("cell")
      .nth(1);
  const folderWhy = `Partial: ${missing} and ${noBreakdown}`;
  // The entry's own time explains its gap as a table cell does.
  const ownTime = scopeFigures(summary, "dashboard/tests")
    .getByRole("definition")
    .nth(1);
  await expect(ownTime).toHaveText("Part 3 missing");
  await expect(ownTime).toHaveAccessibleDescription(`Partial: ${missing}`);
  await expect(ownTime).toHaveAttribute("title", `Partial: ${missing}`);
  await expect(timeCell(0)).toHaveAccessibleDescription(folderWhy);
  await expect(timeCell(0)).toHaveAttribute("title", folderWhy);
  // No CI result is its own word, with no partial explanation.
  await expect(timeCell(1)).toHaveAccessibleDescription("");
  // What the figures hold beyond the rows, as a short label.
  const outside = evidenceLabels(summary, "Not in the rows above");
  await expectEvidenceLabels(outside, ["Part 2 no breakdown"]);
  await expectLabelInFull(outside, "Part 2 no breakdown", noBreakdown);
});

test("an entry-only summary keeps entry totals and labels the child breakdown unavailable", async ({
  page,
}) => {
  const text = bothEntriesSummary(false);
  expect(text).not.toContain('"files"');
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const summary = await openSummary(intent, "tests");
  const absent = evidenceLabel(summary, "No file breakdown");
  await expect(labelWords(absent)).toHaveText("No file breakdown");
  await expectInFull(
    absent,
    "This CI proof summary does not break tests down by file",
  );
  await expect(evidenceLabels(summary, "About these figures"))
    .toMatchAriaSnapshot(`
    - list "About these figures":
      - listitem: No file breakdown , This CI proof summary does not break tests down by file
  `);
  await expectScopeRows(summary, "tests", [
    ["tests", "2 passed test files", "3.0 s", "1 of 1 part present"],
    ["root.sh", "no file breakdown", "no file breakdown"],
  ]);
  await childName(summary, "root.sh").click();
  await expect(fileSource(intent, "tests/root.sh")).toBeVisible();
});

test("a run without a CI proof summary keeps the Summary's children for drilling down and says why, as the homepage does", async ({
  page,
}) => {
  const { intent, home } = await openIntent(
    page,
    () => summaryTextZipAnswer("{}"),
    () => runArtifactsAnswer(run, undefined),
  );
  await expect(proofOf(home)).toContainText(
    "This run published no CI proof summary.",
  );
  const summary = await openSummary(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence-absent")).toHaveText(
    "This run published no CI proof summary.",
  );
  const none = "no CI proof";
  await expectScopeRows(summary, "dashboard/tests", [
    ["dashboard/tests", none, none, none],
    ["folder/", none, none],
    ["added.spec.ts", none, none],
    ["root.spec.ts", none, none],
  ]);
  await childName(summary, "folder/").click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
});
