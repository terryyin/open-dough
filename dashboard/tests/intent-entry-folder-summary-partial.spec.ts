// Gherkin location and folder summaries label Partial scenario and Proof
// totals while contained files are still reading or unread, name a failed
// file with a retry that rereads only it, and say scenario total unavailable
// (not zero) when a nonempty selection has no readable files
// (../src/IntentGherkinSummary.tsx, ../src/intentSummaryCoverage.ts).
// Companion to ./intent-entry-folder-summaries.spec.ts caret/name and complete
// aggregation coverage.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { intentLocationName } from "./intentPerspectivePage.ts";
import {
  authenticatedReadRoute,
  holdAuthenticatedReadsOf,
} from "./holdAuthenticatedReads.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  featuresPath,
  jobsOtherPath,
  packagedFeaturePath,
  packagedPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  reportsFeaturePath,
  stooqPath,
  topFeaturePath,
} from "./intentEntryFolderSummariesFixtures.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("Gherkin summary Partial progress, unread retry, and unavailable totals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(
    page,
    pygardon,
    pygardonSettings,
    pygardonFeatureSources,
  );
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  await test.step("while a contained file is held: Partial totals and reading progress; complete siblings stay complete", async () => {
    const held = await holdAuthenticatedReadsOf(page, topFeaturePath, releases);
    await intentLocationName(intent, featuresPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect.poll(held.held).toBeGreaterThan(0);
    await expect(summary).toContainText(/of 4 files read/);
    await expect(summary).toContainText("Partial:");
    await expect(summary).toContainText("across 3 of 4 files");
    await expect(summary).toContainText("1 file reading");
    const children = summary.getByRole("list", {
      name: "Summary by folder and file",
    });
    await expect(children.locator(":scope > li").nth(0)).toContainText(
      "5 scenarios: 2 passed, 3 without successful proof",
    );
    await expect(children.locator(":scope > li").nth(0)).not.toContainText(
      "Partial:",
    );
    await expect(children.locator(":scope > li").nth(2)).toContainText(
      "Partial:",
    );
    held.release();
    await expect(
      summary.getByText("9 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).not.toContainText("Partial:");
  });

  await test.step("failed file is named unread with retry that rereads only it and restores complete totals", async () => {
    const requests: string[] = [];
    let failStooq = true;
    await page.route(authenticatedReadRoute, async (route) => {
      const path = new URL(route.request().url()).searchParams.get("path");
      if (path === stooqPath && failStooq) {
        requests.push(path);
        failStooq = false;
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "stooq unavailable" }),
        });
        return;
      }
      if (path !== null && path.endsWith(".feature")) requests.push(path);
      await route.continue();
    });
    await page.reload();
    await openUntilRead(page, "/?project=pygardon&perspective=intent");
    const { intent: afterReload } = parts(page);
    await intentLocationName(afterReload, featuresPath).click();
    const summary = afterReload.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("Partial:");
    await expect(summary).toContainText("across 3 of 4 files");
    await expect(summary).toContainText("1 file unread");
    const alert = summary.getByRole("alert");
    await expect(alert).toContainText(`${stooqPath} could not be read.`);
    const children = summary.getByRole("list", {
      name: "Summary by folder and file",
    });
    await expect(children.locator(":scope > li").nth(0)).toContainText(
      "Partial:",
    );
    await expect(children.locator(":scope > li").nth(1)).not.toContainText(
      "Partial:",
    );
    const beforeRetry = requests.filter((path) => path === stooqPath).length;
    const otherBefore = requests.filter(
      (path) =>
        path === jobsOtherPath ||
        path === reportsFeaturePath ||
        path === topFeaturePath,
    ).length;
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(
      summary.getByText("9 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).not.toContainText("Partial:");
    await expect(summary).toContainText(
      "9 scenarios: 2 passed, 7 without successful proof",
    );
    const afterRetry = requests.filter((path) => path === stooqPath).length;
    expect(afterRetry).toBe(beforeRetry + 1);
    const otherAfter = requests.filter(
      (path) =>
        path === jobsOtherPath ||
        path === reportsFeaturePath ||
        path === topFeaturePath,
    ).length;
    expect(otherAfter).toBe(otherBefore);
    await page.unroute(authenticatedReadRoute);
  });

  await test.step("nonempty selection with no readable files: scenario total unavailable, not 0 scenarios", async () => {
    await page.route(authenticatedReadRoute, async (route) => {
      const path = new URL(route.request().url()).searchParams.get("path");
      if (path === packagedFeaturePath) {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "packaged unavailable" }),
        });
        return;
      }
      await route.continue();
    });
    const { intent: current } = parts(page);
    await intentLocationName(current, packagedPath).click();
    const summary = current.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("1 file");
    await expect(summary).toContainText("Scenario total unavailable");
    await expect(summary).not.toContainText("0 scenarios");
    await page.unroute(authenticatedReadRoute);
  });
});
