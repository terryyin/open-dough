// A Gherkin summary drills down: a child's name selects that folder or file
// in Intent's one selection exactly as its tree name does, and a slowest row
// opens its file with Purpose positioned on that row, as Optimization
// Candidates opens a case; either reveals the target in the tree, opening its
// location and un-collapsing its folders (../src/IntentSummaryChildren.tsx,
// ../src/IntentSummarySlowest.tsx, ../src/IntentBrowser.tsx,
// ../src/IntentLocationGroup.tsx).

import type { Locator } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  doughnut,
  featuresPath,
  publishedFiles,
} from "./intentSummaryProofCostFixtures.ts";
import {
  childName,
  expectChildren,
  slowestList,
  sumLine,
} from "./intentSummaryProofCostPage.ts";

const cliPath = `${featuresPath}/cli`;
const loginPath = `${cliPath}/cli_login.feature`;
const notebookPath = `${cliPath}/cli_notebook_lfs.feature`;
// The notebook file's `| 1MB |` Examples row.
const syncOneMbLine = 10;

const fileName = (intent: Locator, path: string) =>
  intent.getByRole("button", { name: path, exact: true });
const folderCaret = (intent: Locator, name: string) =>
  intent.getByRole("button", { name: `Collapse ${name}`, exact: true });

async function openFeatures(page: Parameters<typeof parts>[0]) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClockAt(page, new Date("2026-11-02T12:00:00.000Z"));
  await publishFiles(page, {
    repository: doughnut.repository,
    ref: doughnut.ref,
    revision: doughnut.revision,
    files: publishedFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await intentLocationName(intent, featuresPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    featuresPath,
  );
  return { intent, summary };
}

test("16.1, 16.2: child names select their folder or file as the tree does and reveal it, by mouse or keyboard", async ({
  page,
}) => {
  const { intent, summary } = await openFeatures(page);
  const toggle = intentGroupToggle(intent, featuresPath);

  await test.step("16.1: from the closed location, the cli name selects and reveals cli with only its own figures", async () => {
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await childName(summary, "cli").click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(intentFolderName(intent, "cli")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(summary.locator(".intent-summary-path")).toHaveText(cliPath);
    await expect(
      summary.getByText(`${sumLine}: 17.0 s over 4 of 7 scenarios`, {
        exact: true,
      }),
    ).toBeVisible();
    await expectChildren(summary, [
      ["cli_help.feature", `${sumLine} unknown`],
      ["cli_login.feature", `${sumLine}: 2.0 s over 2 of 2 scenarios`],
      ["cli_notebook_lfs.feature", `${sumLine}: 15.0 s over 2 of 4 scenarios`],
    ]);
    await expect(slowestList(summary).locator("tbody th")).toHaveText([
      "Push a large notebook",
      "Sync <size> Example: 1MB",
      "Log in",
      "Log out",
    ]);
  });

  await test.step("16.2 and 10.5: Enter on a file row's name shows that file's Purpose and Proof, selected in the tree", async () => {
    await childName(summary, "cli_login.feature").focus();
    await page.keyboard.press("Enter");
    await expect(summary).toHaveCount(0);
    await expect(fileName(intent, loginPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentFolderName(intent, "cli")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(intent.getByLabel(`${loginPath} source`)).toContainText(
      "Feature: Login",
    );
    const proof = intent.getByRole("table", { name: `${loginPath} proof` });
    await expect(proof.locator("tbody th")).toHaveText(["Log in", "Log out"]);
    await expect(proof.locator("tbody tr").first()).toContainText("1.5 s");
  });

  await test.step("10.1 and 10.5: with cli collapsed, Space on a file name from cli's summary un-collapses cli to show it", async () => {
    await intentFolderName(intent, "cli").click();
    await folderCaret(intent, "cli").click();
    await expect(fileName(intent, notebookPath)).toHaveCount(0);
    await expect(intentFolderName(intent, "cli")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await childName(summary, "cli_notebook_lfs.feature").focus();
    await page.keyboard.press("Space");
    await expect(fileName(intent, notebookPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(fileName(intent, notebookPath)).toBeInViewport();
    await expect(intent.getByLabel(`${notebookPath} source`)).toContainText(
      "Feature: Notebook LFS",
    );
  });

  await test.step("13.3: a caret alone still toggles without selecting", async () => {
    await folderCaret(intent, "cli").click();
    await expect(fileName(intent, notebookPath)).toHaveCount(0);
    await expect(intent.getByLabel(`${notebookPath} source`)).toBeVisible();
    await expect(intentFolderName(intent, "cli")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

test("17, 10.4: a slowest outline row opens its file with Purpose on that Examples row and Proof giving the same duration, time and commit", async ({
  page,
}) => {
  const { intent, summary } = await openFeatures(page);
  const toggle = intentGroupToggle(intent, featuresPath);
  // Open the location, collapse cli, then reselect the location and close
  // it, so the reveal must open the location and un-collapse cli.
  await toggle.click();
  await folderCaret(intent, "cli").click();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  const row = slowestList(summary)
    .locator("tbody tr")
    .filter({ hasText: "Example: 1MB" });
  // Outcome, duration, observed, commit and file version, after the file.
  const observed = [
    "Passed",
    "3.0 s",
    "5h ago",
    "b2b2b2b",
    "This file version",
  ];
  await expect(row.locator("td")).toHaveText([
    "cli/cli_notebook_lfs.feature",
    ...observed,
  ]);
  await row.getByRole("button", { name: "Sync <size> Example: 1MB" }).click();

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(fileName(intent, notebookPath)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const source = intent.getByLabel(`${notebookPath} source`);
  const target = source.locator(".source-line.is-target");
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute("data-line", String(syncOneMbLine));
  await expect(target).toHaveAttribute("aria-current", "location");
  await expect(target).toBeInViewport();
  await expect(target).toContainText("| 1MB  |");

  const proofRow = intent
    .getByRole("table", { name: `${notebookPath} proof` })
    .locator("tbody tr")
    .filter({ hasText: "Example: 1MB" });
  await expect(proofRow.locator("td")).toHaveText(observed);
});
