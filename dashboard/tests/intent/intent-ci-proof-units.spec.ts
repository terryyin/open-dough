// CI proof results in their units through Intent (../../src/IntentCiProof.tsx,
// ../../src/IntentScopeProof.tsx, ../../src/IntentFileProof.tsx,
// ../../src/ciProofUnits.ts): raw runner reports go through the collector's
// command line, a Playwright record's tests as test cases, an outcomes
// report declared `--unit file` as test files and one without a unit as
// legacy results, against declarations naming their units. CI status shows
// one row per location with labeled unit lines; an entry's and a folder's
// Summary and a file's Proof show each unit's results apart with their own
// time and parts, never one combined count, and a declared unit no fragment
// reached stays visible as missing in that unit (SEED-281 examples 36, 37,
// 40). Decisive grouped-location facts: ./intent-ci-proof-grouped-location.spec.ts.
// Version 1 summaries: ./intent-ci-proof-legacy-results.spec.ts. Collector and
// reader rules:
// ../../../src/skills/dough-test-optimization/scripts/ci-proof-units.test.mjs,
// ../../../tests/support/dashboard-ci-proof-units-read.test.mjs.

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { expectProofRows, proofOf, run } from "../intentCiProofPage.ts";
import { openDoughSettings } from "../intentCodeBrowseFixtures.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
} from "../intentPerspectivePage.ts";
import { childName, scopeTable } from "../intentScopeProofPage.ts";
import {
  openIntent,
  openSummary,
  spec,
} from "../intentSummaryCiProofFixtures.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
  type RecordedTest,
} from "../support/ciProofCollected.ts";
import { intentSettingsText } from "../support/intentSettingsFile.ts";
import { intentFile } from "../support/intentStoryPage.ts";

// A location whose `check.spec.ts` reports both five test cases and its own
// file outcome, and whose folder holds two source files: `a.spec.ts`
// reporting five test cases, `b.spec.ts` only a failed file outcome.
const tree = {
  ".planning/open-dough.json": intentSettingsText(openDoughSettings),
  "dashboard/tests/check.spec.ts": spec("check"),
  "dashboard/tests/folder/a.spec.ts": spec("a"),
  "dashboard/tests/folder/b.spec.ts": spec("b"),
  "tests/root.sh": "#!/usr/bin/env bash\n",
};

const fiveCases = (file: string, ms: number): RecordedTest[] =>
  Array.from({ length: 5 }, () => [file, "expected", [ms]] as const);

const unitsSummary = () =>
  collectedSummary(
    run,
    [
      { entry: "dashboard/tests", parts: 1, unit: "case" },
      { entry: "dashboard/tests", parts: 1, unit: "file" },
      // The outcomes report below declares no unit, as before units were.
      { entry: "tests", parts: 1 },
      // Declared, but no fragment arrives.
      { entry: "tests", parts: 1, unit: "case" },
    ],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        record: playwrightRecord([
          ...fiveCases("dashboard/tests/check.spec.ts", 200),
          ...fiveCases("dashboard/tests/folder/a.spec.ts", 100),
        ]),
      },
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        unit: "file",
        outcomes:
          "passed\tdashboard/tests/check.spec.ts\nfailed\tdashboard/tests/folder/b.spec.ts\n",
        times:
          "0.7\tdashboard/tests/check.spec.ts\n0.3\tdashboard/tests/folder/b.spec.ts\n",
      },
      {
        entries: ["tests"],
        part: 1,
        of: 1,
        byFile: true,
        outcomes: "passed\ttests/root.sh\n",
        times: "2.5\ttests/root.sh\n",
      },
    ],
  );

const ownFigures = (summary: Locator, path: string, unit: string) =>
  summary.getByRole("group", { name: `CI proof of ${path}: ${unit}` });

// SCOPE's own figures in UNIT read FIGURES: Counts, Test execution time and
// Parts.
async function expectOwnUnitFigures(
  summary: Locator,
  path: string,
  unit: string,
  figures: readonly string[],
) {
  const group = ownFigures(summary, path, unit);
  await expect(group.getByRole("term")).toHaveText([
    "Counts",
    "Test execution time",
    "Parts",
  ]);
  await expect(group.getByRole("definition")).toHaveText([...figures]);
}

// The rows of PATH's Summary table, each its scope then its cells.
async function expectUnitRows(
  summary: Locator,
  path: string,
  rows: readonly (readonly string[])[],
) {
  const body = scopeTable(summary, path).locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [scope, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(scope ?? "");
    await expect(body.nth(at).getByRole("cell")).toHaveText(cells);
  }
}

// FILE's Proof reads ROWS: one per unit of results it shows.
async function expectFileProof(
  intent: Locator,
  file: string,
  rows: readonly (readonly [string, string])[],
) {
  await intentFile(intent, file).click();
  await fileReadingTab(intent, "Proof").click();
  const body = proofRegion(intent)
    .getByRole("table", { name: `CI proof of ${file}` })
    .locator("tbody")
    .getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(file);
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}

test("one location's test cases and test files stay apart, never one count, through CI status, its Summary, a folder of two source files and each file's Proof, with time and gaps in the unit that reported them", async ({
  page,
}) => {
  const { intent, home } = await openIntent(
    page,
    () => summaryTextZipAnswer(unitsSummary()),
    undefined,
    tree,
  );

  await test.step("CI status shows each declared location once, every unit's counts and time labeled in that row, a declared unit no fragment reached missing in that unit", async () => {
    await expectProofRows(proofOf(home), [
      [
        "dashboard/tests",
        [
          "test cases: 10 passed test cases",
          "test files: 1 passed and 1 failed test files",
        ],
        ["test cases: 1.5 s", "test files: 1.0 s"],
      ],
      [
        "tests",
        [
          "legacy test results: 1 passed legacy test result",
          "test cases: nothing counted as test cases",
        ],
        ["legacy test results: 2.5 s", "test cases: Part 1 missing"],
      ],
    ]);
  });

  await test.step("the entry's Summary shows its test cases and its test files apart, a child with both on two rows (example 36)", async () => {
    const summary = await openSummary(intent, "dashboard/tests");
    await expect(summary.locator(".intent-summary-files")).toHaveText(
      "3 files",
    );
    await expectOwnUnitFigures(summary, "dashboard/tests", "test cases", [
      "10 passed test cases",
      "1.5 s",
      "1 of 1 part present",
    ]);
    await expectOwnUnitFigures(summary, "dashboard/tests", "test files", [
      "1 passed and 1 failed test files",
      "1.0 s",
      "1 of 1 part present",
    ]);
    await expectUnitRows(summary, "dashboard/tests", [
      ["folder/", "5 passed test cases", "500 ms"],
      ["folder/", "1 failed test file", "300 ms"],
      ["check.spec.ts", "5 passed test cases", "1.0 s"],
      ["check.spec.ts", "1 passed test file", "700 ms"],
    ]);
  });

  await test.step("the folder of two source files shows five test cases and one failed test file, its source count still two files (example 40)", async () => {
    const summary = await openSummary(intent, "dashboard/tests");
    await childName(summary, "folder/").first().click();
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      "dashboard/tests/folder",
    );
    await expect(summary.locator(".intent-summary-files")).toHaveText(
      "2 files",
    );
    await expectOwnUnitFigures(
      summary,
      "dashboard/tests/folder",
      "test cases",
      ["5 passed test cases", "500 ms", "1 of 1 part present"],
    );
    await expectOwnUnitFigures(
      summary,
      "dashboard/tests/folder",
      "test files",
      ["1 failed test file", "300 ms", "1 of 1 part present"],
    );
    await expectUnitRows(summary, "dashboard/tests/folder", [
      ["a.spec.ts", "5 passed test cases", "500 ms"],
      ["b.spec.ts", "1 failed test file", "300 ms"],
    ]);
  });

  await test.step("each file's Proof shows the units it reported: both for one path, only a failed test file for a file without cases (examples 36, 37)", async () => {
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    await expectFileProof(intent, "dashboard/tests/check.spec.ts", [
      ["5 passed test cases", "1.0 s"],
      ["1 passed test file", "700 ms"],
    ]);
    await expectFileProof(intent, "dashboard/tests/folder/b.spec.ts", [
      ["1 failed test file", "300 ms"],
    ]);
  });
});
