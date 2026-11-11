// Proof table accessibility at narrow and zoomed windows: rows stay whole,
// the reading pane never scrolls sideways, and keyboard navigation passes
// sortable headers in their visible order. Multi-unit locations keep labeled
// lines and full gap descriptions readable in that same boundary. Basic proof
// behavior: ./intent-ci-proof.spec.ts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../dashboardTest.ts";
import {
  artifactId,
  expectProofRows,
  failedVerdict,
  openFailedRun,
  proofColumns,
  proofTable,
  run,
} from "../intentCiProofPage.ts";
import { twiceZoomedWindow, zoomedWindow } from "../accessibleReading.ts";
import { wordsBrokenApart } from "../wholeWords.ts";
import { evidenceLabels } from "../ciEvidenceLabelsPage.ts";
import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";

test("at 200% zoom and on a narrow window each entry's row reads whole within the reading pane, nothing scrolls sideways and the keyboard passes the table", async ({
  page,
}) => {
  const longEntry = "src/skills/dough-test-optimization/scripts";
  const summary = proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at(longEntry)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(8, 0, 0)
          .timed(75_000)
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(40, 2, 1)
          .timed(30_000)
          .inParts(3, { missing: [2] })
          .withPresentPart(3, {
            passed: 12,
            failed: 0,
            other: 0,
            durationMs: 20_000,
          })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(8, 0, 0)
          .timed(75_000)
          .inParts(2)
          .withPresentPart(2, {
            passed: 4,
            failed: 0,
            other: 0,
            durationMs: 45_000,
          })
          .please(),
      )
      .please(),
  ]);
  const gapWhy = "Partial: part 2 of 3 missing";
  const rows = [
    [
      longEntry,
      [
        "test cases: 8 passed test cases",
        "test files: 52 passed, 2 failed and 1 other test files",
      ],
      ["test cases: 1 min 15 s", "test files: Part 2 missing"],
    ],
    ["dashboard/tests", "12 passed test cases", "2 min"],
  ] as const;
  const { panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
  );
  await expectProofRows(proof, rows);
  const fileGap = proof
    .locator(".intent-ci-proof-unit-line")
    .filter({ hasText: "Part 2 missing" });
  await expect(fileGap).toHaveAttribute("title", gapWhy);
  await expect(fileGap).toHaveAccessibleDescription(gapWhy);
  // A wider installed font lays the table out as Linux's fallback font does.
  await page.addStyleTag({
    content:
      ".intent-ci-proof-box, .intent-evidence-labels { font-family: Verdana, sans-serif; }",
  });
  const table = proofTable(proof);
  const box = proof.locator(".intent-proof-table");
  const again = panel.getByRole("button", { name: "Check again" });
  const link = proof.getByRole("link", { name: "Run 41 · attempt 1" });
  // How far the table's box scrolls sideways, and whether the box lies within
  // the reading pane and the page does not scroll sideways.
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

  // Every row reads exactly, every column fits the reading pane with nothing
  // scrolling sideways, `whole` cells keep their words whole, and between the
  // run link above it and Check again the keyboard stops only at the table's
  // sortable column headers, in order.
  const readsAt = async (
    window: { width: number; height: number },
    whole: string,
  ) => {
    await page.setViewportSize(window);
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
    await expectProofRows(proof, rows);
    await expect(fileGap).toHaveAccessibleDescription(gapWhy);
    await table.scrollIntoViewIfNeeded();
    await expect(table).toBeVisible();
    expect(await fit()).toEqual({
      sideways: 0,
      inPane: true,
      pageSideways: false,
    });
    expect(await wordsBrokenApart(table, whole)).toEqual([]);
    expect(await wordsBrokenApart(evidenceLabels(proof), "li")).toEqual([]);
    await link.focus();
    for (const header of proofColumns) {
      await page.keyboard.press("Tab");
      await expect(
        table
          .getByRole("columnheader", { name: header, exact: true })
          .getByRole("button"),
      ).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(again).toBeFocused();
  };

  await test.step("a window under 200% zoom keeps even path parts whole", async () => {
    await readsAt(twiceZoomedWindow, "th, td");
  });
  await test.step("a narrow window under 400% zoom wraps the long path within its own column", async () => {
    await readsAt(zoomedWindow, "thead th, tbody td");
  });
});
