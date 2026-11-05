// A summary drills down: a child's name selects that folder or file in
// Intent's one selection exactly as its tree name does, and reveals the
// target in the tree, opening its location and un-collapsing its folders
// (../src/IntentSummaryChildren.tsx, ../src/IntentBrowser.tsx,
// ../src/IntentLocationGroup.tsx). A file opens on Purpose.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { folderToggle } from "./support/intentStoryPage.ts";
import {
  featuresPath,
  jobsFolder,
  jobsOtherPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  stooqPath,
} from "./intentEntryFolderSummariesFixtures.ts";

const fileName = (intent: Locator, path: string) =>
  intent.getByRole("button", { name: path, exact: true });

// The control naming one immediate child of the summary.
const childName = (summary: Locator, name: string) =>
  summary
    .getByRole("list", { name: "Summary by folder and file" })
    .getByRole("button", { name, exact: true });

test("16.1, 16.2: child names select their folder or file as the tree does and reveal it, by mouse or keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(
    page,
    pygardon,
    pygardonSettings,
    pygardonFeatureSources,
  );
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await intentLocationName(intent, featuresPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    featuresPath,
  );
  const toggle = intentGroupToggle(intent, featuresPath);

  await test.step("16.1: from the closed location, the jobs name selects and reveals jobs with its own file count", async () => {
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await childName(summary, "jobs").click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      jobsFolder,
    );
    await expect(summary.locator(".intent-summary-files").first()).toHaveText(
      "2 files",
    );
  });

  await test.step("16.2 and 10.5: Enter on a file row's name shows that file's Purpose, selected in the tree", async () => {
    await childName(summary, "stooq_refresh.feature").focus();
    await page.keyboard.press("Enter");
    await expect(summary).toHaveCount(0);
    await expect(fileName(intent, stooqPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(intent.getByLabel(`${stooqPath} source`)).toContainText(
      "Feature: Stooq refresh",
    );
  });

  await test.step("10.1 and 10.5: with jobs collapsed, Space on a file name from jobs' summary un-collapses jobs to show it", async () => {
    await intentFolderName(intent, "jobs").click();
    await folderToggle(intent, "jobs", true).click();
    await expect(fileName(intent, jobsOtherPath)).toHaveCount(0);
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await childName(summary, "batch.feature").focus();
    await page.keyboard.press("Space");
    await expect(fileName(intent, jobsOtherPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(fileName(intent, jobsOtherPath)).toBeInViewport();
    await expect(intent.getByLabel(`${jobsOtherPath} source`)).toContainText(
      "Feature: Batch jobs",
    );
  });

  await test.step("13.3: a toggle alone still toggles without selecting", async () => {
    await folderToggle(intent, "jobs", true).click();
    await expect(fileName(intent, jobsOtherPath)).toHaveCount(0);
    await expect(intent.getByLabel(`${jobsOtherPath} source`)).toBeVisible();
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
