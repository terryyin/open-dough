// Intent location groups expand exclusively
// (../src/IntentPerspective.tsx): start collapsed, one open body at a time,
// all-closed reachable, Purpose survives collapse, empty/unsupported bodies
// participate, and nested folder disclosure stays local to the open group.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  collapseIntentGroup,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  doughnut,
  exclusiveSettings,
  packagedFeature,
  publishIntentProject,
  recallFeature,
} from "./intentGherkinBrowseFixtures.ts";

test("Intent group sections start collapsed, expand exclusively, keep Purpose across collapse, and leave nested folders local", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, exclusiveSettings, {
    "e2e_test/features/recall/recall_note.feature": recallFeature,
    "e2e_test/packaged/features/packaged.feature": packagedFeature,
    "empty_features/README.md": "# no features here\n",
    "frontend/src/app.ts": "export {}\n",
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  await test.step("on Intent open, group headers are visible and every file list is hidden", async () => {
    await expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible();
    await expect(
      intentGroupToggle(intent, "e2e_test/packaged/features"),
    ).toBeVisible();
    await expect(intentGroupToggle(intent, "empty_features")).toBeVisible();
    await expect(intentGroupToggle(intent, "frontend/src")).toBeVisible();
    await expectIntentGroupsCollapsed(intent);
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/packaged/features/packaged.feature",
      }),
    ).toHaveCount(0);
  });

  await test.step("expanding B while A is open closes A; collapsing leaves all closed", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
        exact: true,
      }),
    ).toBeVisible();
    await expandIntentGroup(intent, "e2e_test/packaged/features");
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/packaged/features/packaged.feature",
        exact: true,
      }),
    ).toBeVisible();
    await collapseIntentGroup(intent, "e2e_test/packaged/features");
    await expectIntentGroupsCollapsed(intent);
  });

  await test.step("select file, collapse its group: Purpose keeps it; re-expand restores the selected row", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    const feature = intent.getByRole("button", {
      name: "e2e_test/features/recall/recall_note.feature",
      exact: true,
    });
    await feature.click();
    const source = intent.getByLabel(
      "e2e_test/features/recall/recall_note.feature source",
    );
    await expect(source).toContainText("Feature: Recall a note");
    await expect(feature).toHaveAttribute("aria-pressed", "true");
    await collapseIntentGroup(intent, "e2e_test/features");
    await expect(source).toContainText("Feature: Recall a note");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  await test.step("empty and unsupported group bodies participate in exclusive expansion", async () => {
    await expandIntentGroup(intent, "empty_features");
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(intent).toContainText(
      "No gherkin files are published at empty_features for this revision.",
    );
    await expandIntentGroup(intent, "frontend/src");
    await expect(intentGroupToggle(intent, "empty_features")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(intent).not.toContainText(
      "No gherkin files are published at empty_features for this revision.",
    );
    await expect(intent).toContainText("Kind java is not yet supported.");
  });

  await test.step("nested folder toggle does not collapse the Intent group", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    const folder = intent.locator("button.story-review-folder").filter({
      hasText: "recall",
    });
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await folder.click();
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await folder.click();
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
        exact: true,
      }),
    ).toBeVisible();
  });
});
