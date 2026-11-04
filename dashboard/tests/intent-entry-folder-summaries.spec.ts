// Intent location toggle/name selection shows a summary page
// (../src/IntentBrowser.tsx, ../src/IntentSummary.tsx,
// ../src/IntentLocationGroup.tsx): toggle opens or closes without moving selection;
// unselected name selects keeping open state; selected name toggles and
// keeps selection; closed location name selects without opening. Gherkin
// summaries give scenario totals, aggregate count lines, and child
// breakdown. Partial coverage, unread retry, and unavailable totals:
// ./intent-entry-folder-summary-partial.spec.ts. Folder controls, keyboard,
// and toggle reader preservation:
// ./intent-entry-folder-summaries-folders.spec.ts. Absent-Proof wording:
// ./intent-entry-folder-summary-explanations.spec.ts. Review changes keeps
// disclosure-only folders (./story-review-tree*.spec.ts).

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  expandIntentGroup,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  featuresPath,
  packagedPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
} from "./intentEntryFolderSummariesFixtures.ts";

test("Intent location toggle/name select a summary without opening on first name click", async ({
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

  await test.step("unselected location name selects without opening; summary names path and file count", async () => {
    const toggle = intentGroupToggle(intent, featuresPath);
    const name = intentLocationName(intent, featuresPath);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await name.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(name).toHaveAttribute("aria-pressed", "true");
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(featuresPath);
    await expect(summary).toContainText("4 files");
    await expect(intent.getByRole("region", { name: "Purpose" })).toHaveCount(
      0,
    );
  });

  await test.step("location toggle opens or closes without moving selection; selected name toggles and keeps summary", async () => {
    const toggle = intentGroupToggle(intent, featuresPath);
    const name = intentLocationName(intent, featuresPath);
    const summary = intent.getByRole("region", { name: "Summary" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(name).toHaveAttribute("aria-pressed", "true");
    await expect(summary).toContainText(featuresPath);
    await name.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(name).toHaveAttribute("aria-pressed", "true");
    await expect(summary).toContainText("4 files");
    await name.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(summary).toContainText(featuresPath);
  });

  await test.step("closed location name while another is open: selects, stays closed, other stays open", async () => {
    await expandIntentGroup(intent, featuresPath);
    await expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await intentLocationName(intent, packagedPath).click();
    await expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentLocationName(intent, packagedPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(packagedPath);
    await expect(summary).toContainText("1 file");
    await intentLocationName(intent, packagedPath).click();
    await expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(summary).toContainText(packagedPath);
  });

  await test.step("Gherkin location summary: scenario total, aggregate count line with No successful proof, child breakdown", async () => {
    await intentLocationName(intent, featuresPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(
      summary.getByText("9 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).toContainText(
      "9 scenarios: 2 passed, 7 without successful proof",
    );
    const children = summary.getByRole("list", {
      name: "Summary by folder and file",
    });
    await expect(children.locator(":scope > li")).toHaveCount(3);
    await expect(children.locator(":scope > li").nth(0)).toContainText("jobs");
    await expect(children.locator(":scope > li").nth(0)).toContainText(
      "5 scenarios: 2 passed, 3 without successful proof",
    );
    await expect(children.locator(":scope > li").nth(1)).toContainText(
      "reports",
    );
    await expect(children.locator(":scope > li").nth(1)).toContainText(
      "1 scenario: 1 without successful proof",
    );
    await expect(children.locator(":scope > li").nth(2)).toContainText(
      "disk_space.feature",
    );
    await expect(children.locator(":scope > li").nth(2)).toContainText(
      "3 scenarios: 3 without successful proof",
    );
  });
});
