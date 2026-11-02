// Intent lists and reads configured code test source at the observed revision
// (../src/IntentPerspective.tsx): include-pattern matches, helpers/product
// omitted, group headers, and exact text with kind styling. Doughnut and
// Pygardon kinds: ./intent-code-browse-projects.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts, shortRevision } from "./dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "./pageColours.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
  publishIntentProject,
  shellCheck,
} from "./intentCodeBrowseFixtures.ts";

test("Intent lists matched code test files under include patterns, omits helpers and product files, and reads exact text with the observed revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, openDough, openDoughSettings, {
    "dashboard/tests/intent-gherkin-browse.spec.ts": browseSpec,
    "dashboard/tests/intentPerspectivePage.ts": "export const helper = 1;\n",
    "dashboard/tests/boundary/authenticated-read-intent-locations.spec.ts":
      browseSpec,
    "dashboard/tests/boundary/ownRecordContinuation.ts":
      "export const continuation = true;\n",
    "tests/compare-versions.sh": shellCheck,
    "tests/support/x.sh": "#!/usr/bin/env bash\necho support\n",
  });

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveCount(0);
  await expectIntentGroupsCollapsed(intent);

  await test.step("Ex 1: TypeScript specs among helpers; heading names patterns; selecting shows exact text, revision, and kind styling", async () => {
    const testsHeading = intentLocationName(intent, "dashboard/tests");
    await expect(intentGroupToggle(intent, "dashboard/tests")).toBeVisible();
    await expect(testsHeading).toBeVisible();
    await expect(testsHeading).toContainText("typescript");
    await expect(testsHeading).toContainText("**/*.spec.ts");
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/boundary/authenticated-read-intent-locations.spec.ts",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/intentPerspectivePage.ts",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/boundary/ownRecordContinuation.ts",
        exact: true,
      }),
    ).toHaveCount(0);

    await intent
      .getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      })
      .click();
    const source = intent.getByLabel(
      "dashboard/tests/intent-gherkin-browse.spec.ts source",
    );
    await expect(source).toContainText(
      'import { test } from "@playwright/test";',
    );
    await expect(source).toContainText('test("browses", async () => {});');
    await expect(intent).toContainText(
      `at revision ${shortRevision(openDough.revision)}`,
    );
    await expectKeywordAndStringColours(
      source,
      /^import$/,
      /^"@playwright\/test"$/,
    );
  });

  await test.step("Ex 4 shell: top-level *.sh listed; support scripts omitted; selecting shows kind styling", async () => {
    const shellHeading = intentLocationName(intent, "tests");
    await expect(shellHeading).toContainText("shell");
    await expect(shellHeading).toContainText("*.sh");
    await expandIntentGroup(intent, "tests");
    await expect(
      intent.getByRole("button", {
        name: "tests/compare-versions.sh",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "tests/support/x.sh",
        exact: true,
      }),
    ).toHaveCount(0);

    await intent
      .getByRole("button", {
        name: "tests/compare-versions.sh",
        exact: true,
      })
      .click();
    const source = intent.getByLabel("tests/compare-versions.sh source");
    await expect(source).toContainText("echo ok");
    await expectKeywordAndStringColours(source, /^echo$/, /^ok$/);
  });
});
