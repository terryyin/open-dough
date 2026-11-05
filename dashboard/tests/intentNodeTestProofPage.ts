// Opens Intent Proof for the node:test journey fixtures
// (`./intentNodeTestProofFixtures.ts`, `./intentNodeTestSourceFixtures.ts`).

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  recordedCommit,
  settings,
  snapshotFiles,
} from "./intentNodeTestProofFixtures.ts";
import { locationPath, sources } from "./intentNodeTestSourceFixtures.ts";

const now = new Date("2026-11-04T12:00:00.000Z");

const recorded = recordedCommit.slice(0, 7);
export const passedNow = (duration: string) => [
  "Passed",
  duration,
  "3h ago",
  recorded,
  "This file version",
];
export const noProof = ["No successful proof", "", "", "", ""];
export const headers = [
  "Test case",
  "Last successful proof",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
];

export async function openProject(
  page: Page,
  projectSettings: string,
  proofFiles: Record<string, string>,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(now);
  await publishIntentProject(page, doughnut, projectSettings, {
    ...sources,
    ...proofFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  return parts(page).intent;
}

export async function openProof(
  page: Page,
  path: string,
  sourceLine: string,
  proofFiles: Record<string, string> = snapshotFiles,
) {
  const intent = await openProject(page, settings, proofFiles);
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent.getByRole("button", { name: path, exact: true }).click();
  await expect(intent.getByLabel(`${path} source`)).toContainText(sourceLine);
  return { intent, proof: await chooseReadingTab(intent, "Proof") };
}

export async function cellsOf(proof: Locator, path: string) {
  const table = proof.getByRole("table", { name: `${path} proof` });
  await expect(table).toBeVisible();
  return table
    .getByRole("row")
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) =>
          cell.textContent.trim(),
        ),
      ),
    );
}
