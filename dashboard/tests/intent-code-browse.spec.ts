// Intent lists and reads configured TypeScript, Python, JavaScript, and shell
// test source at the observed revision (../src/IntentPerspective.tsx): matched
// files under include patterns, helpers and product files omitted, headings
// naming path/kind/patterns, and exact text with the observed revision
// (plain text until grammars load in a later slice).

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts, shortRevision } from "./dashboardPage.ts";
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

  await test.step("Ex 1: TypeScript specs among helpers; heading names patterns; selecting shows exact text and revision", async () => {
    const testsHeading = intent.getByRole("heading", {
      name: /dashboard\/tests/,
    });
    await expect(testsHeading).toBeVisible();
    await expect(testsHeading).toContainText("typescript");
    await expect(testsHeading).toContainText("**/*.spec.ts");
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
  });

  await test.step("Ex 4 shell: top-level *.sh listed; support scripts omitted", async () => {
    const shellHeading = intent.getByRole("heading", { name: /^tests / });
    await expect(shellHeading).toContainText("shell");
    await expect(shellHeading).toContainText("*.sh");
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
  });

  await test.step("Ex 4 javascript: matched *.test.mjs listed; fixtures omitted", async () => {
    await chooseProject(page, "Doughnut");
    await expect(
      intent.getByRole("heading", { name: /scripts/ }),
    ).toContainText("**/*.test.mjs");
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
    await expect(
      intent.getByLabel(
        "scripts/backend-test-worktree-admission.test.mjs source",
      ),
    ).toContainText("assert.equal(1, 1)");
  });

  await test.step("Ex 2 colocated TypeScript and Ex 3 Python: specs listed; product and support omitted", async () => {
    await chooseProject(page, "Pygardon");
    const frontendHeading = intent.getByRole("heading", {
      name: /frontend\/src/,
    });
    await expect(frontendHeading).toContainText("**/*.spec.tsx");
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

    const pythonHeading = intent.getByRole("heading", { name: /^tests / });
    await expect(pythonHeading).toContainText("python");
    await expect(pythonHeading).toContainText("**/test_*.py");
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
    await expect(
      intent.getByLabel("tests/test_example.py source"),
    ).toContainText("def test_example():");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
  });
});
