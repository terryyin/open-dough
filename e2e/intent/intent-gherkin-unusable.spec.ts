import {
  readFailure,
  readRetry,
} from "../../dashboard/test-support/intentReadRecoveryPage.ts";
import {
  fileSource,
  sourceFile,
  openLocationSummary,
  testConfiguration,
} from "../../dashboard/test-support/intentCodeBrowsePage.ts";
// Intent distinguishes unusable locations and failed reads
// (../../dashboard/src/IntentPerspective.tsx): empty or missing paths, pattern misses,
// unsupported kinds, failed reads with retry, and settings problems, while
// other locations stay browseable. Selecting an unusable location shows its
// configuration, path, file count, and explanation in Summary.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { publishIntentProject } from "../../dashboard/test-support/intentCodeBrowseFixtures.ts";
import {
  doughnut,
  mixedSettings,
  usableFeature,
} from "../../dashboard/test-support/intentGherkinUnusableFixtures.ts";
// Settings problems: ../../dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts

test("Intent names empty, missing, and unsupported locations while others browse; failed file reads retry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  publishIntentProject(page, doughnut, mixedSettings, {
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
    await openLocationSummary(intent, "no_such_dir");
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

    await openLocationSummary(intent, "empty_features");
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

    await openLocationSummary(intent, "frontend/src");
    summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("frontend/src");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText(
      "Kind unfamiliar-language is not yet supported.",
    );

    await openLocationSummary(intent, "scripts");
    summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("scripts");
    await expect(summary).toContainText("0 files");
    await expect(summary).toContainText(
      "No files matching **/*.test.mjs are published at scripts for this revision.",
    );
  });

  await test.step("a missing location and one with no matching files say so by path; the usable location still browses", async () => {
    await openLocationSummary(intent, "no_such_dir");
    await expect(intent).toContainText(
      "No gherkin files are published at no_such_dir for this revision.",
    );
    await openLocationSummary(intent, "empty_features");
    await expect(intentGroupToggle(intent, "no_such_dir")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(intent).toContainText(
      "No gherkin files are published at empty_features for this revision.",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await expandIntentFolders(intent, "e2e_test/features");
    const usable = sourceFile(
      intent,
      "e2e_test/features/usable/usable.feature",
    );
    await expect(usable).toBeVisible();
    await usable.click();
    await expect(
      fileSource(intent, "e2e_test/features/usable/usable.feature"),
    ).toContainText("Feature: Usable");
  });

  await test.step("Ex 6: a pattern location with no match names path and patterns; others still browse", async () => {
    const summary = await openLocationSummary(intent, "scripts");
    await expect(summary).toContainText(
      "No files matching **/*.test.mjs are published at scripts for this revision.",
    );
    await expect(testConfiguration(summary)).toContainText("**/*.test.mjs");
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      sourceFile(intent, "e2e_test/features/usable/usable.feature"),
    ).toBeVisible();
  });

  await test.step("kind unfamiliar-language says it is not yet supported, naming it; others still browse", async () => {
    await openLocationSummary(intent, "frontend/src");
    await expect(intent).toContainText(
      "Kind unfamiliar-language is not yet supported.",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await expect(
      sourceFile(intent, "e2e_test/features/usable/usable.feature"),
    ).toBeVisible();
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
    await sourceFile(intent, "e2e_test/features/usable/usable.feature").click();
    const alert = readFailure(intent);
    await expect(alert).toContainText(
      "e2e_test/features/usable/usable.feature could not be read.",
    );
    await expect(
      sourceFile(intent, "e2e_test/features/usable/usable.feature"),
    ).toBeVisible();
    await expandIntentGroup(intent, "no_such_dir");
    await expect(intentGroupToggle(intent, "no_such_dir")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expandIntentGroup(intent, "e2e_test/features");
    await readRetry(alert).click();
    await expect(
      fileSource(intent, "e2e_test/features/usable/usable.feature"),
    ).toContainText("Feature: Usable");
    await page.unroute(`**${authenticatedReadEndpoint}?*`);
  });
});
