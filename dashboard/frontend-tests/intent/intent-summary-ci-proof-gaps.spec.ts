// A selected Intent entry's or folder's Summary when CI's evidence is
// missing, partial or absent (../../src/IntentScopeProof.tsx,
// ../../src/ciScopeProof.ts): a missing shard and a shard without a file
// breakdown keep the entry's totals and leave every child partial with short
// gap labels whose full explanation is the cell's accessible description and
// hover, and an absent proof keeps the tree open for drill-down.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciReadingText, intentCiProof } from "./intent-attempt-proof-page.ts";
import {
  mountAttemptSummary,
  summaryEntries,
} from "./intent-attempt-summary-fixture.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
  labelWords,
} from "./intent-summary-evidence-page.ts";
import {
  childName,
  childTime,
  entryTime,
  expectScopeRows,
  openSummary,
  showsSummaryPath,
} from "./intent-summary-proof-page.ts";

const missing = "part 3 of 3 missing";
const noBreakdown = "part 2 of 3 has no file breakdown";

test("a missing shard and a shard without a file breakdown keep the entry's totals and leave every child partial", async () => {
  // Part 1 broken down by file, part 2 not, part 3 never reported.
  await mountAttemptSummary([
    makeMe.aCiProofEntry
      .at("dashboard/tests")
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
      .please(),
  ]);
  const summary = await openSummary("dashboard/tests");
  await expectScopeRows(summary, [
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
  const folderWhy = `Partial: ${missing} and ${noBreakdown}`;
  const ownTime = entryTime(summary, "dashboard/tests");
  expect(ciReadingText(ownTime.element().textContent)).toBe("Part 3 missing");
  await expect
    .element(ownTime)
    .toHaveAccessibleDescription(`Partial: ${missing}`);
  await expect.element(ownTime).toHaveAttribute("title", `Partial: ${missing}`);
  const folderTime = await childTime(summary, "dashboard/tests", "folder/");
  await expect.element(folderTime).toHaveAccessibleDescription(folderWhy);
  await expect.element(folderTime).toHaveAttribute("title", folderWhy);
  // No CI result is its own word, with no partial explanation.
  await expect
    .element(await childTime(summary, "dashboard/tests", "added.spec.ts"))
    .toHaveAccessibleDescription("");
  // What the figures hold beyond the rows, as a short label.
  const outside = evidenceLabels(summary, "Not in the rows above");
  await expectEvidenceLabels(outside, ["Part 2 no breakdown"]);
  await expectLabelInFull(outside, "Part 2 no breakdown", noBreakdown);
});

test("an entry-only proof keeps entry totals and labels the child breakdown unavailable", async () => {
  await mountAttemptSummary(summaryEntries(false));
  const summary = await openSummary("tests");
  const about = evidenceLabels(summary, "About these figures");
  await expectEvidenceLabels(about, ["No file breakdown"]);
  const absent = await evidenceLabel(about, "No file breakdown");
  expect(labelWords(absent)).toBe("No file breakdown");
  await expectInFull(
    absent,
    "This CI proof summary does not break tests down by file",
  );
  await expect.element(about).toMatchAriaInlineSnapshot(`
    - list "About these figures":
      - listitem: No file breakdown , This CI proof summary does not break tests down by file
  `);
  await expectScopeRows(summary, [
    ["tests", "2 passed test files", "3.0 s", "1 of 1 part present"],
    ["root.sh", "no file breakdown", "no file breakdown"],
  ]);
  await userEvent.click(childName(summary, "root.sh"));
  await expect
    .element(page.getByLabelText("tests/root.sh source", { exact: true }))
    .toBeVisible();
});

test("a run without a CI proof summary keeps the Summary's children for drilling down and says why, as the homepage does", async () => {
  const absent = "This run published no CI proof summary.";
  await mountAttemptSummary([], {
    proof: makeMe.aCiProof.unavailable("none").please(),
  });
  await expect
    .element(intentCiProof().proof.getByText(absent, { exact: true }))
    .toBeVisible();
  const summary = await openSummary("dashboard/tests");
  await expect
    .element(summary.getByText(absent, { exact: true }))
    .toBeVisible();
  const none = "no CI proof";
  await expectScopeRows(summary, [
    ["dashboard/tests", none, none, none],
    ["folder/", none, none],
    ["added.spec.ts", none, none],
    ["root.spec.ts", none, none],
  ]);
  await userEvent.click(childName(summary, "folder/"));
  await showsSummaryPath(summary, "dashboard/tests/folder");
});
