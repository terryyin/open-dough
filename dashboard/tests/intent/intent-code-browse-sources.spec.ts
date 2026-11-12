import {
  fileSource,
  sourceLineText,
  sourceFile,
} from "../intentCodeBrowsePage.ts";
// Intent code browse for locations declared by source entries with syntax
// hints (../../src/IntentPerspective.tsx): Doughnut's `scripts` holding Bash
// `.test` and Node `.test.mjs` files in one tree, and files with no hint or
// one Intent has no grammar for read as plain text. Companion to
// ./intent-code-browse-projects.spec.ts for kind-declared locations.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import {
  colourOf,
  expectKeywordAndStringColours,
  sourceToken,
} from "../pageColours.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  doughnut,
  nodeTest,
  publishIntentProject,
  shellCheck,
} from "../intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test("Intent lists a sources location's Bash .test and Node .test.mjs files in one tree, opens each with its hint's styling, and reads unhinted or ungrammared files as plain text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("scripts")
        .withSources(
          { include: ["**/*.test"], syntax: "shell" },
          { include: ["**/*.test.mjs"], syntax: "javascript" },
        )
        .please(),
      makeMe.anIntentLocation
        .at("checks")
        .withSources(
          { include: ["**/*.check"] },
          { include: ["**/*Test.java"], syntax: "java" },
        )
        .please(),
      makeMe.anIntentLocation
        .at("e2e")
        .withSources({ include: ["**/*.check"] })
        .please(),
    )
    .please();
  const shellTest = "scripts/test/worktree_setup.sh.test";
  const nodeTestPath = "scripts/ci/ci-proof-outcomes.test.mjs";
  const plainCheck = 'echo "plain"\n';
  await publishIntentProject(page, doughnut, settings, {
    [shellTest]: shellCheck,
    [nodeTestPath]: nodeTest,
    "scripts/ci/ci-proof-fixtures.mjs": "export const fixtures = [];\n",
    "checks/a.check": plainCheck,
    "checks/notes.md": "# Notes\n",
    "checks/FooTest.java": 'class FooTest { String s = "java"; }\n',
    "e2e/README.md": "# None\n",
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectIntentGroupsCollapsed(intent);

  await test.step("the header names the location's patterns with no kind", async () => {
    const heading = intentLocationName(intent, "scripts");
    await expect(heading).toHaveAccessibleName(
      "scripts **/*.test **/*.test.mjs",
    );
    await expect(heading.locator("code")).toHaveText([
      "scripts",
      "**/*.test",
      "**/*.test.mjs",
    ]);
    await expect(heading.locator(".intent-location-kind")).toHaveCount(0);
  });

  await test.step("both kinds of test share one tree; a helper .mjs stays out", async () => {
    await expandIntentGroup(intent, "scripts");
    await expect(
      intent.getByLabel("**/*.test, **/*.test.mjs files under scripts"),
    ).toBeVisible();
    await expandIntentFolders(intent, "scripts");
    await expect(sourceFile(intent, shellTest)).toBeVisible();
    await expect(sourceFile(intent, nodeTestPath)).toBeVisible();
    await expect(
      sourceFile(intent, "scripts/ci/ci-proof-fixtures.mjs"),
    ).toHaveCount(0);
  });

  await test.step("each opens at its path with its hint's styling", async () => {
    await sourceFile(intent, shellTest).click();
    const shellSource = fileSource(intent, shellTest);
    await expect(sourceLineText(shellSource)).toHaveText(
      shellCheck.split("\n"),
    );
    await expectKeywordAndStringColours(shellSource, /^echo$/, /^ok$/);

    await sourceFile(intent, nodeTestPath).click();
    const nodeSource = fileSource(intent, nodeTestPath);
    await expect(nodeSource).toContainText("assert.equal(1, 1)");
    await expectKeywordAndStringColours(
      nodeSource,
      /^import$/,
      /^"node:assert\/strict"$/,
    );
    // JavaScript, not the location's first (shell) hint: shell would paint
    // `import` as a command and `from` as a string.
    expect(await colourOf(sourceToken(nodeSource, /^from$/))).toBe(
      await colourOf(sourceToken(nodeSource, /^import$/)),
    );
  });

  await test.step("a file with no hint, or a hint with no grammar, stays listed and reads as plain text", async () => {
    await expandIntentGroup(intent, "checks");
    await expect(sourceFile(intent, "checks/notes.md")).toHaveCount(0);
    for (const [path, text] of [
      ["checks/a.check", plainCheck],
      ["checks/FooTest.java", 'class FooTest { String s = "java"; }\n'],
    ] as const) {
      await sourceFile(intent, path).click();
      const source = fileSource(intent, path);
      await expect(sourceLineText(source)).toHaveText(text.split("\n"));
      // The grammars already loaded would colour these at once; none does.
      await expect(sourceLineText(source).locator("span")).toHaveCount(0);
    }
  });

  await test.step("a sources location with no matching files names its patterns", async () => {
    await expandIntentGroup(intent, "e2e");
    await expect(intent.locator(".intent-location-problem")).toHaveText(
      "No files matching **/*.check are published at e2e for this revision.",
    );
  });
});
