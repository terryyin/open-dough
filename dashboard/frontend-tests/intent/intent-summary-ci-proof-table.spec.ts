// A selected Intent entry's or folder's Summary table from CI's file
// breakdown (../../src/IntentScopeProof.tsx, ../../src/ciScopeProof.ts): a
// file CI ran that the tree does not list counts once, in a listed folder's
// row, and outside only in that folder's own Summary; and the evidence
// labels, the scope's own figures and the table fit a zoomed or narrow
// window.

import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { zoomedViewport } from "../navigation/board-accessibility.ts";
import {
  proofTableFit,
  wordsBrokenApart,
} from "./intent-attempt-proof-page.ts";
import {
  mountAttemptSummary,
  summaryEntries,
} from "./intent-attempt-summary-fixture.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
} from "./intent-summary-evidence-page.ts";
import {
  childName,
  expectScopeRows,
  openSummary,
  scopeFigures,
  scopeTable,
  showsSummaryPath,
} from "./intent-summary-proof-page.ts";

const twiceZoomedViewport = { width: 640, height: 450 };

test("a CI file the tree does not list under a listed folder counts once, in that folder's row, and is outside only in that folder's own Summary", async () => {
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
  const summary = await openSummary("dashboard/tests");
  await expectScopeRows(summary, [
    ["dashboard/tests", "3 passed test cases", "600 ms", one],
    ["folder/", "2 passed test cases", "400 ms"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "1 passed test case", "200 ms"],
  ]);
  await expect
    .element(evidenceLabels(summary, "Not in the rows above"))
    .not.toBeInTheDocument();
  await userEvent.click(childName(summary, "folder/"));
  await expectScopeRows(summary, [
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

test("a nested Summary identifies the measured run and the newer tree", async () => {
  await mountAttemptSummary(summaryEntries(true));
  const summary = await openSummary("dashboard/tests");
  await userEvent.click(childName(summary, "folder/"));
  await showsSummaryPath(summary, "dashboard/tests/folder");
  await expectEvidenceLabels(evidenceLabels(summary), [
    "Run 41 · attempt 1",
    "Revision a1b2c3d",
    "Branch main",
    "Tree at b2b2b2b — newer files unproved here",
  ]);
});

test("at 200% zoom and on a narrow window a folder's Summary figures and table read whole within the reading pane, nothing scrolling sideways", async () => {
  await mountAttemptSummary(summaryEntries(true));
  const summary = await openSummary("dashboard/tests");
  const rows = [
    [
      "dashboard/tests",
      "5 passed, 1 failed and 1 other test cases",
      "1 test case untimed",
      "2 of 2 parts present",
    ],
    ["folder/", "3 passed, 1 failed and 1 other test cases", "595 ms"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "2 passed test cases", "1 test case untimed"],
  ] as const;
  await expectScopeRows(summary, rows);
  // A wider installed font lays the Summary out as Linux's fallback font does.
  const font = document.head.appendChild(document.createElement("style"));
  font.textContent =
    ".intent-ci-proof-box, .intent-scope-figures, .intent-evidence-labels { font-family: Verdana, sans-serif; }";
  onTestFinished(() => {
    font.remove();
  });

  const table = scopeTable(summary, "dashboard/tests");
  for (const [viewport, whole] of [
    [twiceZoomedViewport, "th, td"],
    [zoomedViewport, "thead th, tbody td"],
  ] as const) {
    await page.viewport(viewport.width, viewport.height);
    await expectScopeRows(summary, rows);
    table.element().scrollIntoView({ block: "nearest", inline: "nearest" });
    expect(proofTableFit(table.element())).toEqual({
      sideways: 0,
      inPane: true,
      pageSideways: false,
    });
    expect(wordsBrokenApart(table.element(), whole)).toEqual([]);
    expect(
      wordsBrokenApart(
        scopeFigures(summary, "dashboard/tests").element(),
        "dd",
      ),
    ).toEqual([]);
    expect(wordsBrokenApart(evidenceLabels(summary).element(), "li")).toEqual(
      [],
    );
  }
});
