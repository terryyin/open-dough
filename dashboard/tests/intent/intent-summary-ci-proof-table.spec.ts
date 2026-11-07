// A selected Intent entry's or folder's Summary table from CI's collected
// file breakdown (../../src/IntentScopeProof.tsx, ../../src/ciScopeProof.ts,
// ../intentSummaryCiProofFixtures.ts): a file CI ran that the tree does not
// list counts once, in a listed folder's row, and outside only in that
// folder's own Summary; and the scope's own figures and the table fit a
// zoomed or narrow window. The Summary's journey:
// ./intent-summary-ci-proof.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { run } from "../intentCiProofPage.ts";
import {
  childName,
  expectScopeRows,
  scopeFigures,
  scopeTable,
} from "../intentScopeProofPage.ts";
import {
  allParts,
  bothEntriesSummary,
  openIntent,
  openSummary,
} from "../intentSummaryCiProofFixtures.ts";
import { twiceZoomedWindow, zoomedWindow } from "../accessibleReading.ts";
import { wordsBrokenApart } from "../wholeWords.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../support/ciProofCollected.ts";

test.setTimeout(90_000);

test("a CI file the tree does not list under a listed folder counts once, in that folder's row, and is outside only in that folder's own Summary", async ({
  page,
}) => {
  const text = collectedSummary(
    run,
    [["dashboard/tests", 1]],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/folder/a.spec.ts", "expected", [300]],
          // Not in the published tree.
          ["dashboard/tests/folder/old.spec.ts", "expected", [100]],
          ["dashboard/tests/root.spec.ts", "expected", [200]],
        ]),
      },
    ],
  );
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const one = "1 of 1 part present";
  const summary = await openSummary(intent, "dashboard/tests");
  await expectScopeRows(summary, "dashboard/tests", [
    ["dashboard/tests", "3 passed tests", "600 ms", one],
    ["folder/", "2 passed tests", "400 ms", one],
    ["added.spec.ts", "no CI result", "no CI result", one],
    ["root.spec.ts", "1 passed tests", "200 ms", one],
  ]);
  await expect(summary.locator(".intent-summary-outside")).toHaveCount(0);
  await childName(summary, "folder/").click();
  await expectScopeRows(summary, "dashboard/tests/folder", [
    ["dashboard/tests/folder", "2 passed tests", "400 ms", one],
    ["nested/", "no CI result", "no CI result", one],
    ["a.spec.ts", "1 passed tests", "300 ms", one],
    ["b.spec.ts", "no CI result", "no CI result", one],
    ["Not in the rows above", "1 passed tests", "100 ms", one],
  ]);
  await expect(summary.locator(".intent-summary-outside")).toHaveText(
    "The figures of dashboard/tests/folder include what no folder or file row shows: 1 file this tree does not list: dashboard/tests/folder/old.spec.ts.",
  );
});

test("at 200% zoom and on a narrow window a folder's Summary figures and table read whole within the reading pane, nothing scrolling sideways", async ({
  page,
}) => {
  const text = bothEntriesSummary(true);
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const summary = await openSummary(intent, "dashboard/tests");
  const rows = [
    [
      "dashboard/tests",
      "5 passed, 1 failed and 1 other tests",
      "1 test untimed",
      allParts,
    ],
    ["folder/", "3 passed, 1 failed and 1 other tests", "595 ms", allParts],
    ["added.spec.ts", "no CI result", "no CI result", allParts],
    ["root.spec.ts", "2 passed tests", "1 test untimed", allParts],
  ] as const;
  await expectScopeRows(summary, "dashboard/tests", rows);
  // A wider installed font lays the Summary out as Linux's fallback font does.
  await page.addStyleTag({
    content:
      ".intent-ci-proof-box, .intent-scope-figures { font-family: Verdana, sans-serif; }",
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
  }
});
