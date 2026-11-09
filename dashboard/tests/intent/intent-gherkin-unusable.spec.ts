// Intent distinguishes unusable locations and failed reads
// (../../src/IntentPerspective.tsx): empty or missing paths, pattern misses,
// unsupported kinds, failed reads with retry, and settings problems, while
// other locations stay browseable after expanding their group. Selecting an
// unusable location's name shows its Summary with path, file count, and the
// same location explanation the expanded body uses.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { publishIntentProject } from "../intentCodeBrowseFixtures.ts";
import {
  doughnut,
  mixedSettings,
  usableFeature,
} from "../intentGherkinUnusableFixtures.ts";
// Settings problems: ./intent-gherkin-settings-problems.spec.ts

test("Intent names empty, missing, and unsupported locations while others browse; failed file reads retry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, mixedSettings, {
    "e2e_test/features/usable/usable.feature": usableFeature,
    "empty_features/README.md": "# no features here\n",
    "frontend/src/app.ts": "export {}\n",
    "scripts/helpers.mjs": "export const helpers = {};\n",
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(
    intent.getByRole("heading", { name: "No story selected", exact: true }),
  ).toBeVisible();
  await expectIntentGroupsCollapsed(intent);

  await test.step("commitment 55/57: unusable location names show Summary with path, 0 files, and the location explanation", async () => {
    await intentLocationName(intent, "no_such_dir").click();
    await expect(intentGroupToggle(intent, "no_such_dir")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    let summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("no_such_dir");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText(
      "No gherkin files are published at no_such_dir for this revision.",
    );

    await intentLocationName(intent, "empty_features").click();
    await expect(intentGroupToggle(intent, "empty_features")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("empty_features");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText(
      "No gherkin files are published at empty_features for this revision.",
    );

    await intentLocationName(intent, "frontend/src").click();
    summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("frontend/src");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText("Kind java is not yet supported.");

    await intentLocationName(intent, "scripts").click();
    summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("scripts");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText(
      "No files matching **/*.test.mjs are published at scripts for this revision.",
    );
    await expectIntentGroupsCollapsed(intent);
  });

  await test.step("a missing location and one with no matching files say so by path; the usable location still browses", async () => {
    await expandIntentGroup(intent, "no_such_dir");
    await expect(intent).toContainText(
      "No gherkin files are published at no_such_dir for this revision.",
    );
    await expandIntentGroup(intent, "empty_features");
    await expect(intentGroupToggle(intent, "no_such_dir")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(intent).toContainText(
      "No gherkin files are published at empty_features for this revision.",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await expandIntentFolders(intent, "e2e_test/features");
    const usable = intent.getByRole("button", {
      name: "e2e_test/features/usable/usable.feature",
      exact: true,
    });
    await expect(usable).toBeVisible();
    await usable.click();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
  });

  await test.step("Ex 6: a pattern location with no match names path and patterns; others still browse", async () => {
    await expandIntentGroup(intent, "scripts");
    await expect(intent).toContainText(
      "No files matching **/*.test.mjs are published at scripts for this revision.",
    );
    await expect(intentLocationName(intent, "scripts")).toContainText(
      "**/*.test.mjs",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      }),
    ).toBeVisible();
  });

  await test.step("kind java says it is not yet supported, naming it; others still browse", async () => {
    await expandIntentGroup(intent, "frontend/src");
    await expect(intent).toContainText("Kind java is not yet supported.");
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
  });

  await test.step("a failed feature read says so with retry; the tree stays usable", async () => {
    let failures = 0;
    await page.route(`**${authenticatedReadEndpoint}?*`, async (route) => {
      const url = new URL(route.request().url());
      if (
        url.searchParams.get("path") ===
          "e2e_test/features/usable/usable.feature" &&
        failures < 1
      ) {
        failures += 1;
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "feature unavailable for proof",
          }),
        });
        return;
      }
      await route.continue();
    });
    // Remount the Intent browser so selecting the feature asks again under
    // the failing route (a second click on the already-selected row does not).
    await page.reload();
    await openUntilRead(page, "/?project=doughnut&perspective=intent");
    await expectIntentGroupsCollapsed(intent);
    await expandIntentGroup(intent, "e2e_test/features");
    await expandIntentFolders(intent, "e2e_test/features");
    await intent
      .getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      })
      .click();
    const alert = intent.getByRole("alert");
    await expect(alert).toContainText(
      "e2e_test/features/usable/usable.feature could not be read.",
    );
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      }),
    ).toBeVisible();
    await expandIntentGroup(intent, "no_such_dir");
    await expect(intent).toContainText(
      "No gherkin files are published at no_such_dir for this revision.",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
    await page.unroute(`**${authenticatedReadEndpoint}?*`);
  });
});
