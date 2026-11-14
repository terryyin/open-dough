import {
  fileSource,
  sourceFile,
} from "../../dashboard/tests/intentCodeBrowsePage.ts";
// Intent code browse for Doughnut javascript and Pygardon TypeScript/Python
// locations (../../dashboard/src/IntentPerspective.tsx). Companion to
// ./intent-code-browse.spec.ts Open Dough TypeScript and shell coverage, and
// ./intent-code-browse-sources.spec.ts for locations declared by source entries.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { parts, shortRevision } from "../../dashboard/tests/dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentLocationName,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "../../dashboard/tests/pageColours.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
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
} from "../../dashboard/tests/intentCodeBrowseFixtures.ts";

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
      sourceFile(intent, "scripts/backend-test-worktree-admission.test.mjs"),
    ).toBeVisible();
    await expect(
      sourceFile(
        intent,
        "scripts/backend-test-worktree-admission-fixtures.mjs",
      ),
    ).toHaveCount(0);
    await sourceFile(
      intent,
      "scripts/backend-test-worktree-admission.test.mjs",
    ).click();
    const source = fileSource(
      intent,
      "scripts/backend-test-worktree-admission.test.mjs",
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
      sourceFile(intent, "frontend/src/pages/AspyPage.devices.spec.tsx"),
    ).toBeVisible();
    await expect(
      sourceFile(intent, "frontend/src/pages/AspyPage.tsx"),
    ).toHaveCount(0);
    await expect(
      sourceFile(intent, "frontend/src/pages/AspyPage.spec.helpers.tsx"),
    ).toHaveCount(0);

    await sourceFile(
      intent,
      "frontend/src/pages/AspyPage.devices.spec.tsx",
    ).click();
    const tsxSource = fileSource(
      intent,
      "frontend/src/pages/AspyPage.devices.spec.tsx",
    );
    await expect(tsxSource).toContainText('return "devices";');
    await expectKeywordAndStringColours(tsxSource, /^return$/, /^"devices"$/);

    const pythonHeading = intentLocationName(intent, "tests");
    await expect(pythonHeading).toContainText("python");
    await expect(pythonHeading).toContainText("**/test_*.py");
    await expandIntentGroup(intent, "tests");
    await expect(sourceFile(intent, "tests/test_example.py")).toBeVisible();
    await expect(
      sourceFile(intent, "tests/worktree_check_support.py"),
    ).toHaveCount(0);

    await sourceFile(intent, "tests/test_example.py").click();
    const pythonSource = fileSource(intent, "tests/test_example.py");
    await expect(pythonSource).toContainText("def test_example():");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
    await expectKeywordAndStringColours(pythonSource, /^def$/, /^"ok"$/);
  });
});
