// A selected Intent entry's or folder's Summary from CI's own evidence
// (../../src/IntentScopeProof.tsx, ../../src/ciScopeProof.ts,
// ../../src/IntentCiEvidence.tsx): raw runner reports go through the
// collector's command line (`fragment --by-file`, then `summarize`), and the
// summary's actual bytes are the run's artifact, read through the dashboard's
// artifact boundary and the browser's own parser
// (../intentSummaryCiProofFixtures.ts). The entry shows its root figures and
// its immediate folders and files with counts, cumulative execution time and
// parts; a child name drills into a folder (revealing it in the tree) or opens
// a file's reading; a file CI has no result for, a file with an untimed test, a
// measured zero, contributions the tree does not list and a late proof answer
// each say what they are. Missing, partial and absent evidence, each result in
// one row and a zoomed table, and a previously retrieved judgment:
// ./intent-summary-ci-proof-gaps.spec.ts, -table.spec.ts and -kept.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { ciProofSchema } from "../../src/ciProof.ts";
import { activateIntentHome } from "../intentCiStatusPage.ts";
import {
  artifactId,
  expectProofRows,
  proofCalls,
  proofOf,
} from "../intentCiProofPage.ts";
import {
  intentFolderName,
  intentGroupToggle,
} from "../intentPerspectivePage.ts";
import {
  childName,
  expectChildNames,
  expectScopeRows,
  summaryRegion,
} from "../intentScopeProofPage.ts";
import {
  allParts,
  bothEntriesSummary,
  expectAncestorEvidence,
  openIntent,
  openSummary,
} from "../intentSummaryCiProofFixtures.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import {
  runnerCheckout,
  summaryTextZipAnswer,
} from "../support/ciProofCollected.ts";

test("an entry's and its folders' CI summaries come from CI's collected file breakdown: root figures, immediate children, drill-down and file reading, with no source read and no second CI read", async ({
  page,
}) => {
  const text = bothEntriesSummary(true);
  await test.step("the collected bytes keep repository paths, never runner paths, and survive the browser's parser", () => {
    expect(text).toContain('"path":"dashboard/tests/folder/a.spec.ts"');
    expect(text).toContain('"path":"tests/support/check.sh"');
    expect(text).not.toContain(runnerCheckout);
    const parsed = ciProofSchema.parse({
      kind: "summary",
      summary: JSON.parse(text) as unknown,
    });
    expect(
      parsed.kind === "summary" && parsed.summary.entries[0]?.files,
    ).toEqual([
      {
        path: "dashboard/tests/folder/a.spec.ts",
        passed: 1,
        failed: 1,
        other: 0,
        durationMs: 550,
      },
      {
        path: "dashboard/tests/folder/b.spec.ts",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 0,
      },
      {
        path: "dashboard/tests/folder/nested/c.spec.ts",
        passed: 1,
        failed: 0,
        other: 1,
        durationMs: 45,
      },
      {
        path: "dashboard/tests/root.spec.ts",
        passed: 2,
        failed: 0,
        other: 0,
        durationMs: 1200,
        untimed: 1,
      },
    ]);
  });

  // The one proof download is held until released, so it answers late.
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { project, intent, home, bodyReads } = await openIntent(
    page,
    async () => {
      await released;
      return summaryTextZipAnswer(text);
    },
  );

  await test.step("while the proof is still read, the Summary says so and its children still drill down", async () => {
    const summary = await openSummary(intent, "dashboard/tests");
    await expect(summary).toContainText("Checking the CI proof of this run…");
    await expectChildNames(summary, [
      "folder/",
      "added.spec.ts",
      "root.spec.ts",
    ]);
    await childName(summary, "folder/").click();
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      "dashboard/tests/folder",
    );
    release();
    // The late answer is shown for the folder now selected, not the entry.
    await expectScopeRows(summary, "dashboard/tests/folder", [
      [
        "dashboard/tests/folder",
        "3 passed, 1 failed and 1 other tests",
        "595 ms",
        allParts,
      ],
      ["nested/", "1 passed and 1 other tests", "45 ms", allParts],
      ["a.spec.ts", "1 passed and 1 failed tests", "550 ms", allParts],
      // A measured zero stays zero.
      ["b.spec.ts", "1 passed tests", "0 ms", allParts],
    ]);
    await expectAncestorEvidence(summary);
    await expect(intentFolderName(intent, "folder")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  await test.step("Enter on a child folder's name selects and reveals it with its own immediate children only", async () => {
    const summary = summaryRegion(intent);
    await childName(summary, "nested/").focus();
    await page.keyboard.press("Enter");
    await expectScopeRows(summary, "dashboard/tests/folder/nested", [
      [
        "dashboard/tests/folder/nested",
        "1 passed and 1 other tests",
        "45 ms",
        allParts,
      ],
      ["c.spec.ts", "1 passed and 1 other tests", "45 ms", allParts],
    ]);
    await expect(intentFolderName(intent, "nested")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  await test.step("summary navigation read no source file; Space on a file's name opens that file's reading", async () => {
    expect(bodyReads).toEqual([]);
    const summary = summaryRegion(intent);
    await childName(summary, "c.spec.ts").focus();
    await page.keyboard.press("Space");
    await expect(summary).toHaveCount(0);
    await expect(
      intent.getByLabel("dashboard/tests/folder/nested/c.spec.ts source"),
    ).toContainText('test("nested c"');
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/folder/nested/c.spec.ts",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(bodyReads).toEqual(["dashboard/tests/folder/nested/c.spec.ts"]);
  });

  await test.step("home keeps the entry totals, including the check the tree does not list", async () => {
    await activateIntentHome(intent);
    await expectProofRows(proofOf(home), [
      [
        "dashboard/tests",
        "5 passed, 1 failed and 1 other tests",
        "1 test untimed",
        allParts,
      ],
      ["tests", "2 passed checks", "3.0 s", "1 of 1 part present"],
    ]);
  });

  await test.step("the entry's Summary keeps those totals, lists the browsable files, and explains the rest", async () => {
    const summary = await openSummary(intent, "tests");
    await expectScopeRows(summary, "tests", [
      ["tests", "2 passed checks", "3.0 s", "1 of 1 part present"],
      ["root.sh", "1 passed checks", "2.5 s", "1 of 1 part present"],
      [
        "Not in the rows above",
        "1 passed checks",
        "500 ms",
        "1 of 1 part present",
      ],
    ]);
    const outside = evidenceLabels(summary, "Not in the rows above");
    await expectEvidenceLabels(outside, ["1 file not in the tree"]);
    await expectLabelInFull(
      outside,
      "1 file not in the tree",
      "Not in the tree: tests/support/check.sh",
    );
  });

  await test.step("an entry with root files: a file CI has no result for and one with an untimed test say so", async () => {
    const summary = await openSummary(intent, "dashboard/tests");
    await expectScopeRows(summary, "dashboard/tests", [
      [
        "dashboard/tests",
        "5 passed, 1 failed and 1 other tests",
        "1 test untimed",
        allParts,
      ],
      ["folder/", "3 passed, 1 failed and 1 other tests", "595 ms", allParts],
      ["added.spec.ts", "no CI result", "no CI result", allParts],
      ["root.spec.ts", "2 passed tests", "1 test untimed", allParts],
    ]);
    await expect(summary.locator(".intent-summary-outside")).toHaveCount(0);
  });

  await test.step("every selection used the one proof read", () => {
    expect(proofCalls(project.requests)).toEqual([
      `artifacts of run 41: ci-proof-summary-attempt-1`,
      `zip ${String(artifactId)}`,
    ]);
    expect(bodyReads).toEqual(["dashboard/tests/folder/nested/c.spec.ts"]);
  });
});
