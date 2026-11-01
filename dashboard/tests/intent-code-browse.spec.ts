// Intent lists and reads configured code test source at the observed revision
// (../src/IntentPerspective.tsx): include-pattern matches, helpers/product
// omitted, group headers, and exact text with kind styling.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts, shortRevision } from "./dashboardPage.ts";
import {
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
} from "./intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "./pageColours.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  aspyPage,
  browseSpec,
  devicesSpec,
  doughnut,
  doughnutSettings,
  nodeTest,
  openDough,
  openDoughSettings,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  pythonTest,
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
  await publishIntentProject(page, doughnut, doughnutSettings, {
    "scripts/backend-test-worktree-admission.test.mjs": nodeTest,
    "scripts/backend-test-worktree-admission-fixtures.mjs":
      "export const fixtures = [];\n",
  });
  await publishIntentProject(page, pygardon, pygardonSettings, {
    "frontend/src/pages/AspyPage.devices.spec.tsx": devicesSpec,
    "frontend/src/pages/AspyPage.tsx": aspyPage,
    "frontend/src/pages/AspyPage.spec.helpers.tsx":
      "export const helpers = {};\n",
    "tests/test_example.py": pythonTest,
    "tests/worktree_check_support.py": "SUPPORT = True\n",
  });

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveCount(0);
  await expectIntentGroupsCollapsed(intent);

  await test.step("Ex 1: TypeScript specs among helpers; heading names patterns; selecting shows exact text, revision, and kind styling", async () => {
    const testsHeading = intentGroupToggle(intent, "dashboard/tests");
    await expect(testsHeading).toBeVisible();
    await expect(testsHeading).toContainText("typescript");
    await expect(testsHeading).toContainText("**/*.spec.ts");
    await expandIntentGroup(intent, "dashboard/tests");
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
    const shellHeading = intentGroupToggle(intent, "tests");
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

  await test.step("Ex 4 javascript: matched *.test.mjs listed; fixtures omitted; selecting shows kind styling", async () => {
    await chooseProject(page, "Doughnut");
    await expectIntentGroupsCollapsed(intent);
    await expect(intentGroupToggle(intent, "scripts")).toContainText(
      "**/*.test.mjs",
    );
    await expandIntentGroup(intent, "scripts");
    await expect(
      intent.getByRole("button", {
        name: "scripts/backend-test-worktree-admission.test.mjs",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "scripts/backend-test-worktree-admission-fixtures.mjs",
        exact: true,
      }),
    ).toHaveCount(0);
    await intent
      .getByRole("button", {
        name: "scripts/backend-test-worktree-admission.test.mjs",
        exact: true,
      })
      .click();
    const source = intent.getByLabel(
      "scripts/backend-test-worktree-admission.test.mjs source",
    );
    await expect(source).toContainText("assert.equal(1, 1)");
    await expectKeywordAndStringColours(
      source,
      /^import$/,
      /^"node:assert\/strict"$/,
    );
  });

  await test.step("Ex 2 colocated TypeScript and Ex 3 Python: specs listed; product and support omitted; selecting shows kind styling", async () => {
    await chooseProject(page, "Pygardon");
    await expectIntentGroupsCollapsed(intent);
    const frontendHeading = intentGroupToggle(intent, "frontend/src");
    await expect(frontendHeading).toContainText("**/*.spec.tsx");
    await expandIntentGroup(intent, "frontend/src");
    await expect(
      intent.getByRole("button", {
        name: "frontend/src/pages/AspyPage.devices.spec.tsx",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "frontend/src/pages/AspyPage.tsx",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      intent.getByRole("button", {
        name: "frontend/src/pages/AspyPage.spec.helpers.tsx",
        exact: true,
      }),
    ).toHaveCount(0);

    await intent
      .getByRole("button", {
        name: "frontend/src/pages/AspyPage.devices.spec.tsx",
        exact: true,
      })
      .click();
    const tsxSource = intent.getByLabel(
      "frontend/src/pages/AspyPage.devices.spec.tsx source",
    );
    await expect(tsxSource).toContainText('return "devices";');
    await expectKeywordAndStringColours(tsxSource, /^return$/, /^"devices"$/);

    const pythonHeading = intentGroupToggle(intent, "tests");
    await expect(pythonHeading).toContainText("python");
    await expect(pythonHeading).toContainText("**/test_*.py");
    await expandIntentGroup(intent, "tests");
    await expect(
      intent.getByRole("button", {
        name: "tests/test_example.py",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "tests/worktree_check_support.py",
        exact: true,
      }),
    ).toHaveCount(0);

    await intent
      .getByRole("button", {
        name: "tests/test_example.py",
        exact: true,
      })
      .click();
    const pythonSource = intent.getByLabel("tests/test_example.py source");
    await expect(pythonSource).toContainText("def test_example():");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
    await expectKeywordAndStringColours(pythonSource, /^def$/, /^"ok"$/);
  });
});
