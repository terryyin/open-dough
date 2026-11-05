// Intent folder toggle/name selection, keyboard operation, and toggle reader
// preservation (../src/StoryReviewFileTree.tsx, ../src/IntentBrowser.tsx).
// Location toggle/name: ./intent-entry-folder-summaries.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  chooseReadingTab,
  expandIntentFolders,
  expandIntentGroup,
  expectIntentFoldersCollapsed,
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
  readingTab,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  featuresPath,
  jobsFolder,
  packagedPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  reportsFolder,
  stooqPath,
  topFeaturePath,
} from "./intentEntryFolderSummariesFixtures.ts";

test("Intent folder toggle/name, keyboard, and location toggle preserve the reader", async ({
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
  await expandIntentGroup(intent, featuresPath);

  await test.step("Ex 8: with no story selected, every folder in the opened location starts collapsed", async () => {
    await expectIntentFoldersCollapsed(intent, featuresPath);
    for (const folder of ["jobs", "reports"]) {
      await expect(
        intent.getByRole("button", { name: `Expand ${folder}` }),
      ).toBeVisible();
    }
    await expect(
      intent.getByRole("button", { name: stooqPath, exact: true }),
    ).toBeHidden();
    await expect(
      intent.getByRole("button", { name: topFeaturePath, exact: true }),
    ).toBeVisible();
    await expandIntentFolders(intent, featuresPath);
  });

  await intentLocationName(intent, featuresPath).click();

  await test.step("folder toggle opens or closes without moving selection", async () => {
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(featuresPath);
    const toggle = intent.getByRole("button", { name: "Collapse jobs" });
    await toggle.click();
    await expect(
      intent.getByRole("button", { name: "Expand jobs" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(summary).toContainText(featuresPath);
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await intent.getByRole("button", { name: "Expand jobs" }).click();
    await expect(
      intent.getByRole("button", { name: "Collapse jobs" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(summary).toContainText(featuresPath);
  });

  await test.step("unselected folder name selects keeping open state; selected name toggles and keeps selection", async () => {
    const jobsName = intentFolderName(intent, "jobs");
    await expect(jobsName).toHaveAttribute("aria-pressed", "false");
    await jobsName.click();
    await expect(jobsName).toHaveAttribute("aria-pressed", "true");
    await expect(
      intent.getByRole("button", { name: "Collapse jobs" }),
    ).toHaveAttribute("aria-expanded", "true");
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(jobsFolder);
    await expect(summary).toContainText("2 files");
    await expect(
      summary
        .getByRole("list", { name: "Summary by folder and file" })
        .locator(":scope > li > button"),
    ).toHaveText(["batch.feature", "stooq_refresh.feature"]);
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await jobsName.click();
    await expect(jobsName).toHaveAttribute("aria-pressed", "true");
    await expect(
      intent.getByRole("button", { name: "Expand jobs" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(summary).toContainText(jobsFolder);
    await expect(summary).toContainText("2 files");

    await jobsName.click();
    await expect(
      intent.getByRole("button", { name: "Collapse jobs" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(summary).toContainText(jobsFolder);
  });

  await test.step("E8: selecting a different folder name moves selection and summary", async () => {
    const jobsName = intentFolderName(intent, "jobs");
    const reportsName = intentFolderName(intent, "reports");
    await expect(jobsName).toHaveAttribute("aria-pressed", "true");
    await reportsName.click();
    await expect(reportsName).toHaveAttribute("aria-pressed", "true");
    await expect(jobsName).toHaveAttribute("aria-pressed", "false");
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(reportsFolder);
    await expect(summary).toContainText("1 file");
    await expect(summary).not.toContainText(jobsFolder);
  });

  await test.step("location and folder controls work by keyboard", async () => {
    const locationToggle = intentGroupToggle(intent, featuresPath);
    await locationToggle.press("Enter");
    await expect(locationToggle).toHaveAttribute("aria-expanded", "false");
    await locationToggle.press(" ");
    await expect(locationToggle).toHaveAttribute("aria-expanded", "true");
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      reportsFolder,
    );

    const folderToggle = intent.getByRole("button", {
      name: "Collapse reports",
    });
    await folderToggle.press("Enter");
    await expect(
      intent.getByRole("button", { name: "Expand reports" }),
    ).toHaveAttribute("aria-expanded", "false");
    await intent.getByRole("button", { name: "Expand reports" }).press(" ");
    await expect(
      intent.getByRole("button", { name: "Collapse reports" }),
    ).toHaveAttribute("aria-expanded", "true");

    await intent
      .getByRole("button", { name: topFeaturePath, exact: true })
      .click();
    await expect(intent.getByRole("region", { name: "Purpose" })).toContainText(
      "Feature: Disk space",
    );
    const jobsName = intentFolderName(intent, "jobs");
    await jobsName.press("Enter");
    await expect(jobsName).toHaveAttribute("aria-pressed", "true");
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      jobsFolder,
    );
    await intentLocationName(intent, featuresPath).press("Enter");
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      featuresPath,
    );
  });

  await test.step("file Purpose and Proof; E10 toggle opens another location without changing reader; E11 closed original name selects summary", async () => {
    await expandIntentGroup(intent, featuresPath);
    await intent.getByRole("button", { name: stooqPath, exact: true }).click();
    const source = intent.getByLabel(`${stooqPath} source`);
    await expect(source).toContainText("Feature: Stooq refresh");
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof).toContainText("Refresh quotes");
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(
      intent.getByRole("button", { name: stooqPath, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    // E10: open a different location by toggle; Purpose/Proof stay on the file.
    await intentGroupToggle(intent, packagedPath).click();
    await expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(source).toContainText("Feature: Stooq refresh");
    await expect(proof).toContainText("Refresh quotes");
    await expect(intent.getByRole("region", { name: "Summary" })).toHaveCount(
      0,
    );

    // E11: closed original location name replaces Purpose; stays closed; other stays open.
    await intentLocationName(intent, featuresPath).click();
    await expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentLocationName(intent, featuresPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(featuresPath);
    await expect(summary).toContainText("4 files");
    await expect(source).toHaveCount(0);
    await expect(intent.getByRole("region", { name: "Purpose" })).toHaveCount(
      0,
    );
    await expect(readingTab(intent, "Purpose")).toHaveCount(0);
  });
});
