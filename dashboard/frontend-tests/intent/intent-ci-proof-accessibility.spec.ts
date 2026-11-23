// Proof table accessibility at narrow and zoomed windows: rows stay whole,
// the reading pane never scrolls sideways, and keyboard navigation passes
// sortable headers in their visible order. Multi-unit locations keep labeled
// lines and full gap descriptions readable in that same boundary. Basic proof
// behavior: ./intent-ci-proof.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { zoomedViewport } from "../navigation/board-accessibility.ts";
import {
  failedVerdict,
  mountFailedAttemptProof,
  proofOfJudgedRun,
} from "./intent-attempt-proof-fixtures.ts";
import {
  intentCiProof,
  proofTableFit,
  showsAttemptSummary,
  wordsBrokenApart,
} from "./intent-attempt-proof-page.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const twiceZoomedViewport = { width: 640, height: 450 };

test("at 200% zoom and on a narrow window each entry's row reads whole within the reading pane, nothing scrolls sideways and the keyboard passes the table", async () => {
  const longEntry = "src/skills/dough-test-optimization/scripts";
  const summary = [
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
  ];
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
  await mountFailedAttemptProof(proofOfJudgedRun(summary));
  const ci = intentCiStatus();
  const proof = intentCiProof();
  await proof.showsRows(rows);
  const fileGap = proof.unitLine("test files: Part 2 missing");
  await expect.element(fileGap).toHaveAttribute("title", gapWhy);
  await expect.element(fileGap).toHaveAccessibleDescription(gapWhy);

  // A wider installed font lays the table out as Linux's fallback font does.
  const font = document.head.appendChild(document.createElement("style"));
  font.textContent =
    ".intent-ci-proof-box, .intent-evidence-labels { font-family: Verdana, sans-serif; }";
  onTestFinished(() => {
    font.remove();
  });

  const table = proof.table;
  const link = proof.attemptLink("Run 41 · attempt 1");
  const entry = proof.entryButton("dashboard/tests");
  // Use the CSS viewport dimensions of 200% and 400% browser zoom.
  const readsAt = async (
    { width, height }: { width: number; height: number },
    whole: string,
  ) => {
    await page.viewport(width, height);
    await ci.answers(failedVerdict);
    await proof.showsRows(rows);
    await expect.element(fileGap).toHaveAccessibleDescription(gapWhy);
    await expect
      .poll(() => document.documentElement.scrollHeight, {
        message: "the CI proof does not add a document scrollbar",
      })
      .toBe(height);
    table.element().scrollIntoView({ block: "nearest", inline: "nearest" });
    await expect.element(table).toBeVisible();
    expect(proofTableFit(table.element())).toEqual({
      sideways: 0,
      inPane: true,
      pageSideways: false,
    });
    expect(wordsBrokenApart(table.element(), whole)).toEqual([]);
    expect(wordsBrokenApart(proof.evidenceLabels.element(), "li")).toEqual([]);
    (link.element() as HTMLElement).focus();
    for (const next of [...proof.sortButtons(), entry, ci.checkAgainButton]) {
      await userEvent.tab();
      await expect.element(next).toHaveFocus();
    }
  };

  await readsAt(twiceZoomedViewport, "th, td");
  await readsAt(zoomedViewport, "thead th, tbody td");
  (entry.element() as HTMLElement).focus();
  await userEvent.keyboard(" ");
  await showsAttemptSummary("dashboard/tests");
});
