// A Gherkin location or folder summary with readable proof states the summed
// duration of its last successful scenario proof with the scenarios it
// covers, says it is a sum of separate observations and not a run's elapsed
// time, and gives the observations' oldest-to-newest finish and commits; each
// immediate child adds its own sum or says its duration is unknown, never
// 0 s, with Partial labelling like the count line
// (../src/IntentGherkinSummary.tsx, ../src/intentSummaryProofCost.ts).

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  passTimeUntilCheckedAfterSettled,
  pausePageClock,
} from "./autoRefreshJourney.ts";
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

const zeroDuration = /\b0(?:\.0)? m?s\b/;
const sumLine = "Summed duration of last successful proof";
const notElapsed =
  "A sum of separate scenario observations, retries included, not a run's elapsed time.";

function childRows(summary: Locator) {
  return summary
    .getByRole("list", { name: "Summary by folder and file" })
    .locator(":scope > li");
}

async function expectChildren(
  summary: Locator,
  expected: readonly (readonly [string, string])[],
) {
  const rows = childRows(summary);
  await expect(rows.locator(":scope > code")).toHaveText(
    expected.map(([name]) => name),
  );
  for (const [at, [, line]] of expected.entries()) {
    await expect(rows.nth(at)).toContainText(line);
  }
}

test("location and folder summaries sum last successful proof with coverage, spread, and per-child sums; a later focused run changes only its file", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
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
