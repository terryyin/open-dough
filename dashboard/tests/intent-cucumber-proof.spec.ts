// Intent's Proof pane reads the last successful committed Cucumber proof of each
// scenario of a selected feature file at the observed revision
// (../src/IntentProof.tsx, ../server/intentProofRead.ts): a Pygardon-like
// Gherkin location declares its proof directory, a full run yesterday and a
// focused run today each left a run file, and the same observations
// consolidated into one file read as identical rows. Rows keep source order
// and each its own duration, time, commit and file-version match. A newer
// legacy failure clears an older pass; a later pass restores proof. Retry
// counts and outline-row independence survive.
// Proof files are read once with the locations, not per selection.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  consolidatedFiles,
  failedOnlyFiles,
  failedOutlineFiles,
  featurePath,
  otherFeature,
  otherPath,
  proofDirectory,
  publishedFeature,
  restoredFiles,
  runFiles,
  settings,
  tiedFiles,
  todayCommit,
  yesterdayCommit,
} from "./intentCucumberProofFixtures.ts";

const now = new Date("2026-11-01T12:00:00.000Z");

const header = [
  "Scenario",
  "Last successful proof",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
];

const expectedRows = [
  [
    "List jobs",
    "Passed",
    "1.2 s",
    "1d ago",
    yesterdayCommit.slice(0, 7),
    "Earlier file version",
  ],
  ["Cancel a job", "No successful proof", "", "", "", ""],
  [
    "Retry a job after <failure> Example: timeout | 3",
    "Passed after retry (2 attempts)",
    "4.1 s",
    "1h ago",
    todayCommit.slice(0, 7),
    "This file version",
  ],
  [
    "Retry a job after <failure> Example: crash | 1",
    "Passed",
    "350 ms",
    "1d ago",
    yesterdayCommit.slice(0, 7),
    "Earlier file version",
  ],
  ["Archive a job", "No successful proof", "", "", "", ""],
];

const ordinaryCounts =
  "5 scenarios: 2 passed, 1 passed after retry, 2 without successful proof";

for (const [layout, proofFiles, expected, counts] of [
  ["two legacy run files", runFiles, expectedRows, ordinaryCounts],
  [
    "one legacy consolidated file",
    consolidatedFiles,
    expectedRows,
    ordinaryCounts,
  ],
  [
    "a legacy pass and failure at the same finish time",
    tiedFiles,
    expectedRows,
    ordinaryCounts,
  ],
  [
    "a pass restored after failure",
    restoredFiles,
    expectedRows.map((row, at) =>
      at === 1
        ? [
            "Cancel a job",
            "Passed",
            "700 ms",
            "1h ago",
            todayCommit.slice(0, 7),
            "This file version",
          ]
        : row,
    ),
    "5 scenarios: 3 passed, 1 passed after retry, 1 without successful proof",
  ],
  [
    "one outline row's later failure",
    failedOutlineFiles,
    expectedRows.map((row, at) =>
      at === 2 ? [row[0], "No successful proof", "", "", "", ""] : row,
    ),
    "5 scenarios: 2 passed, 3 without successful proof",
  ],
  [
    "only failed legacy proof",
    failedOnlyFiles,
    expectedRows.map((row) => [row[0], "No successful proof", "", "", "", ""]),
    undefined,
  ],
] as const) {
  test(`Intent shows last successful proof from ${layout}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.clock.setFixedTime(now);
    const requests = await publishIntentProject(page, pygardon, settings, {
      [featurePath]: publishedFeature,
      [otherPath]: otherFeature,
      ...proofFiles,
    });

    await openUntilRead(page, "/?project=pygardon");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    await expandIntentGroup(intent, "e2e_test/features");
    await intent
      .getByRole("button", { name: featurePath, exact: true })
      .click();
    await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
      "Feature: Jobs",
    );

    const proof = await chooseReadingTab(intent, "Proof");
    const table = proof.getByRole("table", { name: `${featurePath} proof` });
    await expect(table).toBeVisible();
    await expect(proof).toContainText(
      counts === undefined
        ? `No successful proof recorded for this file in ${proofDirectory}.`
        : `Last successful proof: ${counts}`,
    );
    await expect(proof).not.toContainText(/green|all passed|suite/i);
    await expect(proof).not.toContainText(/current/i);
    const cells = await table
      .getByRole("row")
      .evaluateAll((rows) =>
        rows.map((row) =>
          [...row.querySelectorAll("th, td")].map((cell) =>
            cell.textContent.trim(),
          ),
        ),
      );
    expect(cells).toEqual([header, ...expected]);

    await test.step("another feature reads its own rows; proof files are read once, not per selection", async () => {
      await intent
        .getByRole("button", { name: otherPath, exact: true })
        .click();
      const other = proof.getByRole("table", { name: `${otherPath} proof` });
      await expect(other).toContainText("Report free space");
      await expect(proof).toContainText(
        layout === "only failed legacy proof"
          ? "No successful proof recorded for this file"
          : "Last successful proof: 1 scenario: 1 passed",
      );
      await intent
        .getByRole("button", { name: featurePath, exact: true })
        .click();
      await expect(table).toBeVisible();
      const proofReads = requests.filter(
        ({ request }) =>
          request.kind === "content" &&
          request.path.startsWith(`${proofDirectory}/`),
      );
      expect(proofReads).toHaveLength(Object.keys(proofFiles).length);
    });
  });
}
