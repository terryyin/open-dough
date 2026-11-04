// Intent location groups expand exclusively
// (../src/IntentPerspective.tsx): start collapsed, one open body at a time,
// all-closed reachable, Purpose survives caret collapse, empty/unsupported
// bodies participate, and nested folder caret disclosure stays local to the
// open group. With no story selected, every location header has its own
// background apart from folder and file rows; a selected header takes the
// selected background caret to edge, while an expanded one shows only its
// open caret.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  collapseIntentGroup,
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  intentLocationHeader,
  intentLocationName,
  locationHeaderLook,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  doughnut,
  exclusiveSettings,
  packagedFeature,
  publishIntentProject,
  recallFeature,
} from "./intentGherkinBrowseFixtures.ts";

test("Intent group sections start collapsed, expand exclusively, keep Purpose across collapse, leave nested folders local, and stand apart from their rows", async ({
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
    await expect(intentLocationName(intent, "e2e_test/features")).toBeVisible();
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
    await expandIntentFolders(intent, "e2e_test/features");
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

  await test.step("nested folder caret toggles without collapsing the Intent group", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    const caret = intent.getByRole("button", { name: "Collapse recall" });
    await expect(caret).toHaveAttribute("aria-expanded", "true");
    await caret.click();
    await expect(
      intent.getByRole("button", { name: "Expand recall" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await intent.getByRole("button", { name: "Expand recall" }).click();
    await expect(
      intent.getByRole("button", { name: "Collapse recall" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
        exact: true,
      }),
    ).toBeVisible();
  });

  await test.step("with no story selected, headers stand apart from rows; selection fills one header, expansion shows only in the caret", async () => {
    await expect(
      intent.getByRole("region", { name: "Selected story", exact: true }),
    ).toHaveCount(0);
    const expandedPath = "e2e_test/features";
    const selectedPath = "e2e_test/packaged/features";
    const transparent = "rgba(0, 0, 0, 0)";
    const folderRow = intent.locator(".story-review-folder-row").first();
    const fileRow = intent.getByRole("button", {
      name: "e2e_test/features/recall/recall_note.feature",
      exact: true,
    });
    await intentLocationName(intent, selectedPath).click();
    await expect(intentLocationName(intent, selectedPath)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(fileRow).toHaveAttribute("aria-pressed", "false");
    const rowBackgrounds = [
      await folderRow.evaluate((row) => getComputedStyle(row).backgroundColor),
      await fileRow.evaluate((row) => getComputedStyle(row).backgroundColor),
    ];
    expect(rowBackgrounds).toEqual([transparent, transparent]);

    const looks = new Map<
      string,
      Awaited<ReturnType<typeof locationHeaderLook>>
    >();
    for (const location of [
      expandedPath,
      selectedPath,
      "empty_features",
      "frontend/src",
    ])
      looks.set(
        location,
        await locationHeaderLook(intentLocationHeader(intent, location)),
      );
    const expanded = looks.get(expandedPath);
    const selected = looks.get(selectedPath);
    await expect(intentGroupToggle(intent, expandedPath)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentGroupToggle(intent, selectedPath)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(expanded?.background).not.toBe(transparent);
    expect(rowBackgrounds).not.toContain(expanded?.background);
    for (const location of ["empty_features", "frontend/src"])
      expect(looks.get(location)?.background).toBe(expanded?.background);
    expect(selected?.background).not.toBe(expanded?.background);
    expect(rowBackgrounds).not.toContain(selected?.background);
    for (const look of looks.values())
      expect(look).toMatchObject({
        mark: "none",
        controlsShowHeader: true,
        fullWidth: true,
      });
  });
});
