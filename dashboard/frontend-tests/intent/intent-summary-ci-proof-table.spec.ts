// A selected Intent entry's or folder's Summary table from CI's file
// breakdown (../../src/IntentScopeProof.tsx, ../../src/ciScopeProof.ts): a
// file CI ran that the tree does not list counts once, in a listed folder's
// row, and outside only in that folder's own Summary; and the evidence
// labels, the scope's own figures and the table fit a zoomed or narrow
// window. The proof answer is controlled
// (../../test-support/support/frontendSummaryCiProof.ts); reading CI's collected
// bytes into it: ../../backend-tests/intent/ci-proof-extraction.spec.ts and
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  evidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import {
  childName,
  expectScopeRows,
  scopeFigures,
  scopeTable,
} from "../../test-support/intentScopeProofPage.ts";
import {
  allParts,
  openSummary,
} from "../../test-support/intentSummaryCiProofFixtures.ts";
import {
  twiceZoomedWindow,
  zoomedWindow,
} from "../../test-support/accessibleReading.ts";
import { wordsBrokenApart } from "../../test-support/wholeWords.ts";
import {
  bothEntries,
  openSummaryCiProof,
} from "../../test-support/support/frontendSummaryCiProof.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";

test("a CI file the tree does not list under a listed folder counts once, in that folder's row, and is outside only in that folder's own Summary", async ({
  page,
  frontendServices,
}) => {
  const { intent } = await openSummaryCiProof(page, frontendServices, [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .withFile("dashboard/tests/folder/a.spec.ts", {
            passed: 1,
            durationMs: 300,
          })
          // Not in the published tree.
          .withFile("dashboard/tests/folder/old.spec.ts", {
            passed: 1,
            durationMs: 100,
          })
          .withFile("dashboard/tests/root.spec.ts", {
            passed: 1,
            durationMs: 200,
          })
          .please(),
      )
      .please(),
  ]);
  const one = "1 of 1 part present";
  const summary = await openSummary(intent, "dashboard/tests");
  await expectScopeRows(summary, "dashboard/tests", [
    ["dashboard/tests", "3 passed test cases", "600 ms", one],
    ["folder/", "2 passed test cases", "400 ms"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "1 passed test case", "200 ms"],
  ]);
  await expect(summary.locator(".intent-summary-outside")).toHaveCount(0);
  await childName(summary, "folder/").click();
  await expectScopeRows(summary, "dashboard/tests/folder", [
    ["dashboard/tests/folder", "2 passed test cases", "400 ms", one],
    ["nested/", "no CI result", "no CI result"],
    ["a.spec.ts", "1 passed test case", "300 ms"],
    ["b.spec.ts", "no CI result", "no CI result"],
    ["Not in the rows above", "1 passed test case", "100 ms"],
  ]);
  const outside = evidenceLabels(summary, "Not in the rows above");
  await expectEvidenceLabels(outside, ["1 file not in the tree"]);
  await expectLabelInFull(
    outside,
    "1 file not in the tree",
    "Not in the tree: dashboard/tests/folder/old.spec.ts",
  );
});

test("at 200% zoom and on a narrow window a folder's Summary figures and table read whole within the reading pane, nothing scrolling sideways", async ({
  page,
  frontendServices,
}) => {
  const { intent } = await openSummaryCiProof(
    page,
    frontendServices,
    bothEntries(true),
  );
  const summary = await openSummary(intent, "dashboard/tests");
  const rows = [
    [
      "dashboard/tests",
      "5 passed, 1 failed and 1 other test cases",
      "1 test case untimed",
      allParts,
    ],
    ["folder/", "3 passed, 1 failed and 1 other test cases", "595 ms"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "2 passed test cases", "1 test case untimed"],
  ] as const;
  await expectScopeRows(summary, "dashboard/tests", rows);
  // A wider installed font lays the Summary out as Linux's fallback font does.
  await page.addStyleTag({
    content:
      ".intent-ci-proof-box, .intent-scope-figures, .intent-evidence-labels { font-family: Verdana, sans-serif; }",
  });
  const table = scopeTable(summary, "dashboard/tests");
  const box = summary.locator(".intent-proof-table");
  const fit = () =>
    box.evaluate((element) => {
      const pane = element.closest(".intent-reading");
      if (pane === null) throw new Error("no reading pane");
      const shown = element.getBoundingClientRect();
      const reading = pane.getBoundingClientRect();
      return {
        sideways: element.scrollWidth - element.clientWidth,
        inPane: shown.left >= reading.left && shown.right <= reading.right,
        pageSideways:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });
  for (const [window, whole] of [
    [twiceZoomedWindow, "th, td"],
    [zoomedWindow, "thead th, tbody td"],
  ] as const) {
    await page.setViewportSize(window);
    await expectScopeRows(summary, "dashboard/tests", rows);
    await table.scrollIntoViewIfNeeded();
    expect(await fit(), JSON.stringify(window)).toEqual({
      sideways: 0,
      inPane: true,
      pageSideways: false,
    });
    expect(await wordsBrokenApart(table, whole)).toEqual([]);
    expect(
      await wordsBrokenApart(scopeFigures(summary, "dashboard/tests"), "dd"),
    ).toEqual([]);
    // The evidence labels above wrap whole labels and words, never letters.
    expect(await wordsBrokenApart(evidenceLabels(summary), "li")).toEqual([]);
  }
});
