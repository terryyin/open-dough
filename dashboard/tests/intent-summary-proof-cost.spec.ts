// A Gherkin location or folder summary with readable proof states the summed
// duration of its last successful scenario proof with the scenarios it
// covers, says it is a sum of separate observations and not a run's elapsed
// time, and gives the observations' oldest-to-newest finish and commits; each
// immediate child adds its own sum or says its duration is unknown, never
// 0 s, with Partial labelling like the count line; its slowest proven rows
// read as file Proof reads them, the cap in `./intent-summary-slowest.spec.ts`
// (../src/IntentGherkinSummary.tsx, ../src/intentSummaryProofCost.ts,
// ../src/IntentSummarySlowest.tsx).

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { passTimeUntilCheckedAfterSettled } from "./autoRefreshJourney.ts";
import { holdAuthenticatedReadsOf } from "./holdAuthenticatedReads.ts";
import {
  countLocationsReads,
  expandIntentGroup,
  intentFolderName,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import {
  childRows,
  expectChildren,
  expectSlowest,
  notElapsed,
  slowestList,
  sumLine,
  zeroDuration,
} from "./intentSummaryProofCostPage.ts";
import {
  doughnut,
  featuresPath,
  laterLoginProof,
  laterRunPath,
  packagedPath,
  publishedFiles,
  topPath,
} from "./intentSummaryProofCostFixtures.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("location and folder summaries sum last successful proof with coverage, spread, and per-child sums; a later focused run changes only its file", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClockAt(page, new Date("2026-11-02T12:00:00.000Z"));
  const locationsReads = countLocationsReads(page);
  const origin = publishMovingFiles(page, {
    repository: doughnut.repository,
    ref: doughnut.ref,
    revision: doughnut.revision,
    files: publishedFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  const summary = intent.getByRole("region", { name: "Summary" });

  await test.step("ex1: summed duration over N of M scenarios, not-elapsed note, and spread from K commits", async () => {
    await intentLocationName(intent, featuresPath).click();
    await expect(summary).toContainText(
      "Last successful proof: 15 scenarios: 5 passed, 1 passed after retry, 9 without successful proof",
    );
    await expect(
      summary.getByText(`${sumLine}: 23.5 s over 6 of 15 scenarios`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(summary.getByText(notElapsed, { exact: true })).toBeVisible();
    await expect(
      summary.getByText(
        "Observations finished between 04:52 and 10:30 UTC on 2026-11-02, from 3 commits.",
        { exact: true },
      ),
    ).toBeVisible();
  });

  await test.step("ex1 and ex6: the slowest list starts with the slowest file's retried row, saying 2 attempts, with file Proof's cells", async () => {
    const lfs = "cli/cli_notebook_lfs.feature";
    const login = "cli/cli_login.feature";
    await expectSlowest(summary, [
      `Push a large notebook · ${lfs} · Passed after retry (2 attempts) · 12.0 s · 7h ago · a1a1a1a · This file version`,
      "Assess · assessment/assess.feature · Passed · 4.0 s · 1h ago · c3c3c3c · This file version",
      `Sync <size> Example: 1MB · ${lfs} · Passed · 3.0 s · 5h ago · b2b2b2b · This file version`,
      "Assess more · assessment/assess_more.feature · Passed · 2.5 s · 3h ago · a1a1a1a · Earlier file version",
      `Log in · ${login} · Passed · 1.5 s · 5h ago · b2b2b2b · This file version`,
      `Log out · ${login} · Passed · 500 ms · 4h ago · c3c3c3c · This file version`,
    ]);
  });

  await test.step("ex2 and ex6: children in tree order with their sums, the retried row's total included; unproven children unknown, never 0 s", async () => {
    await expectChildren(summary, [
      ["assessment", `${sumLine}: 6.5 s over 2 of 3 scenarios`],
      // 12 s across both attempts of the retried row + 3 s + 1.5 s + 0.5 s.
      ["cli", `${sumLine}: 17.0 s over 4 of 7 scenarios`],
      ["recall", `${sumLine} unknown`],
      ["top.feature", `${sumLine} unknown`],
    ]);
    for (const at of [2, 3]) {
      const row = childRows(summary).nth(at);
      await expect(row).toContainText("without successful proof");
      await expect(row).not.toContainText(zeroDuration);
      await expect(row).not.toContainText(" over ");
    }
  });

  await test.step("ex6: a folder summary's file row counts the retried row's total duration", async () => {
    await expandIntentGroup(intent, featuresPath);
    await intentFolderName(intent, "cli").click();
    await expect(
      summary.getByText(`${sumLine}: 17.0 s over 4 of 7 scenarios`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      summary.getByText(
        "Observations finished between 04:52 and 08:00 UTC on 2026-11-02, from 3 commits.",
        { exact: true },
      ),
    ).toBeVisible();
    await expectChildren(summary, [
      ["cli_help.feature", `${sumLine} unknown`],
      ["cli_login.feature", `${sumLine}: 2.0 s over 2 of 2 scenarios`],
      ["cli_notebook_lfs.feature", `${sumLine}: 15.0 s over 2 of 4 scenarios`],
    ]);
    // Only cli's own rows, named relative to cli.
    const slowest = slowestList(summary);
    await expect(slowest.locator("tbody th")).toHaveText([
      "Push a large notebook",
      "Sync <size> Example: 1MB",
      "Log in",
      "Log out",
    ]);
    await expect(slowest.locator("tbody tr td:nth-of-type(1)")).toHaveText([
      "cli_notebook_lfs.feature",
      "cli_notebook_lfs.feature",
      "cli_login.feature",
      "cli_login.feature",
    ]);
  });

  await test.step("9.8: a folder without successful proof shows no slowest list and says so", async () => {
    await intentFolderName(intent, "recall").click();
    await expect(summary).toContainText(
      "Last successful proof: 4 scenarios: 4 without successful proof",
    );
    await expect(
      summary.getByText(`${sumLine} unknown`, { exact: true }).first(),
    ).toBeVisible();
    await expect(slowestList(summary)).toHaveCount(0);
  });

  await test.step("ex5: a later focused run of one feature changes only its figures and the spread's newer end", async () => {
    origin.moveTrunk({
      revision: "e5".repeat(20),
      files: { ...publishedFiles, [laterRunPath]: laterLoginProof },
    });
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    await expect.poll(locationsReads).toBe(2);
    await intentLocationName(intent, featuresPath).click();
    await expect(
      summary.getByText(`${sumLine}: 23.1 s over 6 of 15 scenarios`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(summary).toContainText("9 without successful proof");
    await expect(
      summary.getByText(
        "Observations finished between 04:52 and 11:45 UTC on 2026-11-02, from 4 commits.",
        { exact: true },
      ),
    ).toBeVisible();
    await expectChildren(summary, [
      ["assessment", `${sumLine}: 6.5 s over 2 of 3 scenarios`],
      ["cli", `${sumLine}: 16.6 s over 4 of 7 scenarios`],
      ["recall", `${sumLine} unknown`],
      ["top.feature", `${sumLine} unknown`],
    ]);
  });

  await test.step("ex8: a location with one observation shows one time and its commit", async () => {
    await intentLocationName(intent, packagedPath).click();
    // The location's line, then its one file's same line.
    await expect(
      summary.getByText(`${sumLine}: 800 ms over 1 of 2 scenarios`, {
        exact: true,
      }),
    ).toHaveCount(2);
    await expect(
      summary.getByText(
        "Observation finished at 07:15 UTC on 2026-11-02, from commit b2b2b2b.",
        { exact: true },
      ),
    ).toBeVisible();
  });
});

test("ex7: the summed line is Partial across 8 of 9 files while one feature is reading, then complete", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishFiles(page, {
    repository: doughnut.repository,
    ref: doughnut.ref,
    revision: doughnut.revision,
    files: publishedFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  const held = await holdAuthenticatedReadsOf(page, topPath, releases);
  await intentLocationName(intent, featuresPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect.poll(held.held).toBeGreaterThan(0);
  await expect(
    summary.getByText(
      `Partial: ${sumLine}: 23.5 s over 6 of 14 scenarios across 8 of 9 files; 1 file reading`,
      { exact: true },
    ),
  ).toBeVisible();
  await expect(childRows(summary).nth(3)).not.toContainText(sumLine);
  held.release();
  await expect(
    summary.getByText(`${sumLine}: 23.5 s over 6 of 15 scenarios`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(summary).not.toContainText("Partial:");
});
