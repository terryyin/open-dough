// Intent folder caret/name selection, keyboard operation, and caret reader
// preservation (../src/StoryReviewFileTree.tsx, ../src/IntentBrowser.tsx).
// Location caret/name: ./intent-entry-folder-summaries.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentFoldersCollapsed,
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
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

test("Intent folder caret/name, keyboard, and location caret preserve the reader", async ({
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

  await test.step("folder caret toggles without moving selection", async () => {
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(featuresPath);
    const caret = intent.getByRole("button", { name: "Collapse jobs" });
    await caret.click();
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

  await test.step("unselected folder name selects keeping open state; selected name toggles and keeps selection; E12 count line keeps Not observed", async () => {
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
      summary.getByText("5 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).toContainText(
      "5 scenarios: 2 passed, 3 not observed",
    );
    await expect(summary).not.toContainText("validated");
    const children = summary.getByRole("list", {
      name: "Summary by folder and file",
    });
    await expect(children.locator(":scope > li")).toHaveCount(2);
    await expect(children.locator(":scope > li").nth(0)).toContainText(
      "batch.feature",
    );
    await expect(children.locator(":scope > li").nth(0)).toContainText(
      "3 scenarios: 3 not observed",
    );
    await expect(children.locator(":scope > li").nth(1)).toContainText(
      "stooq_refresh.feature",
    );
    await expect(children.locator(":scope > li").nth(1)).toContainText(
      "2 scenarios: 2 passed",
    );
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
    const locationCaret = intentGroupToggle(intent, featuresPath);
    await locationCaret.press("Enter");
    await expect(locationCaret).toHaveAttribute("aria-expanded", "false");
    await locationCaret.press(" ");
    await expect(locationCaret).toHaveAttribute("aria-expanded", "true");
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      reportsFolder,
    );

    const folderCaret = intent.getByRole("button", {
      name: "Collapse reports",
    });
    await folderCaret.press("Enter");
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

  await test.step("file Purpose and Proof; E10 caret opens another location without changing reader; E11 closed original name selects summary", async () => {
    await expandIntentGroup(intent, featuresPath);
    await intent.getByRole("button", { name: stooqPath, exact: true }).click();
    const source = intent.getByLabel(`${stooqPath} source`);
    await expect(source).toContainText("Feature: Stooq refresh");
    const proof = intent.getByRole("region", { name: "Proof" });
    await expect(proof).toContainText("Refresh quotes");
    await expect(intentFolderName(intent, "jobs")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(
      intent.getByRole("button", { name: stooqPath, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    // E10: open a different location by caret; Purpose/Proof stay on the file.
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
  });
});
