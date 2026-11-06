// Intent code browse for Doughnut javascript and Pygardon TypeScript/Python
// locations (../../src/IntentPerspective.tsx). Companion to
// ./intent-code-browse.spec.ts Open Dough TypeScript and shell coverage.

import { expect, test } from "../dashboardTest.ts";
import { parts, shortRevision } from "../dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "../pageColours.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  aspyPage,
  devicesSpec,
  doughnut,
  doughnutSettings,
  nodeTest,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  pythonTest,
} from "../intentCodeBrowseFixtures.ts";

test("Intent lists Doughnut javascript and Pygardon TypeScript/Python matches, omits helpers and product, and styles selected source", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
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

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectIntentGroupsCollapsed(intent);

  await test.step("Ex 4 javascript: matched *.test.mjs listed; fixtures omitted; selecting shows kind styling", async () => {
    await expect(intentLocationName(intent, "scripts")).toContainText(
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
    await page.goto("/?project=pygardon&perspective=intent");
    await openUntilRead(page, "/?project=pygardon&perspective=intent");
    await expectIntentGroupsCollapsed(intent);
    const frontendHeading = intentLocationName(intent, "frontend/src");
    await expect(frontendHeading).toContainText("**/*.spec.tsx");
    await expandIntentGroup(intent, "frontend/src");
    await expandIntentFolders(intent, "frontend/src");
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

    const pythonHeading = intentLocationName(intent, "tests");
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
