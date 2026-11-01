// Intent's Proof pane reads the latest committed Cucumber proof of each
// scenario of a selected feature file at the observed revision
// (../src/IntentProof.tsx, ../server/intentProofRead.ts): a Pygardon-like
// Gherkin location declares its proof directory, a full run yesterday and a
// focused run today each left a run file, and the same observations
// consolidated into one file read as identical rows. Rows keep source order
// and each its own outcome, duration, time, commit and file-version match;
// a newer failure outranks an older pass, a retry-assisted pass is marked, a
// scenario added since reads Not observed, and the count line includes it.
// Proof files are read once with the locations, not per selection.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  consolidatedFiles,
  featurePath,
  otherFeature,
  otherPath,
  proofDirectory,
  publishedFeature,
  runFiles,
  settings,
  todayCommit,
  yesterdayCommit,
} from "./intentCucumberProofFixtures.ts";

const now = new Date("2026-11-01T12:00:00.000Z");

const header = [
  "Scenario",
  "Latest outcome",
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
  [
    "Cancel a job",
    "Failed",
    "1m 5s",
    "2h ago",
    todayCommit.slice(0, 7),
    "This file version",
  ],
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
  ["Archive a job", "Not observed", "", "", "", ""],
];

for (const [layout, proofFiles] of [
  ["two run files", runFiles],
  ["one consolidated file", consolidatedFiles],
] as const) {
  test(`Intent Proof shows each scenario's latest committed observation from ${layout}`, async ({
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
    await intent
      .getByRole("button", { name: featurePath, exact: true })
      .click();
    await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
      "Feature: Jobs",
    );

    const proof = intent.getByRole("region", { name: "Proof" });
    const table = proof.getByRole("table", { name: `${featurePath} proof` });
    await expect(table).toBeVisible();
    await expect(proof).toContainText(
      "5 scenarios: 2 passed, 1 passed after retry, 1 failed, 1 not observed",
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
    expect(cells).toEqual([header, ...expectedRows]);

    await test.step("another feature reads its own rows; proof files are read once, not per selection", async () => {
      await intent
        .getByRole("button", { name: otherPath, exact: true })
        .click();
      const other = proof.getByRole("table", { name: `${otherPath} proof` });
      await expect(other).toContainText("Report free space");
      await expect(proof).toContainText("1 scenario: 1 passed");
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
