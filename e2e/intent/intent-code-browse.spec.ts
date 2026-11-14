import {
  expectLabelledEntrySource,
  fileSource,
  sourceFile,
  sourceLineText,
} from "../../dashboard/tests/intentCodeBrowsePage.ts";
// Intent lists and reads configured code test source at the observed revision
// (../../dashboard/src/IntentPerspective.tsx): include-pattern matches, helpers/product
// omitted, group headers, and exact text with kind styling. Doughnut and
// Pygardon kinds: ./intent-code-browse-projects.spec.ts.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { parts, shortRevision } from "../../dashboard/tests/dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  intentFolderName,
  intentLocationName,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "../../dashboard/tests/pageColours.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  browseSpec,
  openDough,
  publishIntentProject,
  shellCheck,
} from "../../dashboard/tests/intentCodeBrowseFixtures.ts";

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test("Intent lists matched code test files under include patterns, omits helpers and product files, and reads exact text with the observed revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .please(),
      makeMe.anIntentLocation
        .at("dashboard/frontend-tests")
        .labelled("Dashboard Frontend Test")
        .ofKind("typescript", ["**/*.spec.ts"])
        .please(),
      makeMe.anIntentLocation
        .at("dashboard/backend-tests")
        .labelled("Dashboard Backend Test")
        .ofKind("typescript", ["**/*.spec.ts"])
        .please(),
      makeMe.anIntentLocation.at("tests").ofKind("shell", ["*.sh"]).please(),
    )
    .please();
  const groupedSources = [
    ["configuration", "project-add.spec.ts"],
    ["stories", "story-readiness.spec.ts"],
    ["launches", "agent-launch-start-codex.spec.ts"],
    ["sessions", "agent-completion-attention.spec.ts"],
    ["terminals", "agent-terminal.spec.ts"],
    ["review", "story-review.spec.ts"],
    ["intent", "intent-gherkin-browse.spec.ts"],
    ["navigation", "story-card-selection.spec.ts"],
    ["observation", "read-failure.spec.ts"],
    ["runtime", "quiet-reporter.spec.ts"],
  ] as const;
  const backendGroupedSources = [
    ["configuration", "project-add-boundary.spec.ts"],
    ["launches", "agent-launch-start.spec.ts"],
    ["sessions", "agent-completion-binding.spec.ts"],
    ["terminals", "agent-terminal-boundary.spec.ts"],
    ["review", "story-review-refusal.spec.ts"],
    ["intent", "authenticated-read-intent-locations.spec.ts"],
    ["observation", "authenticated-read-shared.spec.ts"],
    ["runtime", "serving-modes.spec.ts"],
  ] as const;
  await publishIntentProject(page, openDough, settings, {
    ...Object.fromEntries(
      groupedSources.map(([group, file]) => [
        `dashboard/tests/${group}/${file}`,
        browseSpec,
      ]),
    ),
    "dashboard/tests/intentPerspectivePage.ts": "export const helper = 1;\n",
    "dashboard/frontend-tests/touch-reading-observation.spec.ts": browseSpec,
    "dashboard/frontend-tests/pageLayout.ts": "export const helper = 1;\n",
    ...Object.fromEntries(
      backendGroupedSources.map(([group, file]) => [
        `dashboard/backend-tests/${group}/${file}`,
        browseSpec,
      ]),
    ),
    "dashboard/backend-tests/launches/ownRecordContinuation.ts":
      "export const continuation = true;\n",
    "tests/compare-versions.sh": shellCheck,
    "tests/support/x.sh": "#!/usr/bin/env bash\necho support\n",
  });

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(
    intent.getByRole("heading", { name: "No story selected", exact: true }),
  ).toBeVisible();
  await expectIntentGroupsCollapsed(intent);

  await test.step("Ex 1: TypeScript specs among helpers; heading names patterns; selecting shows exact text, revision, and kind styling", async () => {
    const testsHeading = intentLocationName(intent, "dashboard/tests");
    await expect(intentGroupToggle(intent, "dashboard/tests")).toBeVisible();
    await expect(testsHeading).toBeVisible();
    await expect(testsHeading).toContainText("typescript");
    await expect(testsHeading).toContainText("**/*.spec.ts");
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    for (const [group, file] of groupedSources) {
      await expect(intentFolderName(intent, group)).toBeVisible();
      await expect(
        sourceFile(intent, `dashboard/tests/${group}/${file}`),
      ).toBeVisible();
    }
    await expect(
      sourceFile(
        intent,
        "dashboard/tests/intent/intent-gherkin-browse.spec.ts",
      ),
    ).toBeVisible();
    await expect(
      sourceFile(intent, "dashboard/tests/intentPerspectivePage.ts"),
    ).toHaveCount(0);

    await sourceFile(
      intent,
      "dashboard/tests/intent/intent-gherkin-browse.spec.ts",
    ).click();
    const source = fileSource(
      intent,
      "dashboard/tests/intent/intent-gherkin-browse.spec.ts",
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

  await test.step("A labelled frontend entry keeps its canonical source path", async () => {
    await expectLabelledEntrySource(
      intent,
      "dashboard/frontend-tests",
      "Dashboard Frontend Test",
      "touch-reading-observation.spec.ts",
      "pageLayout.ts",
      browseSpec.split("\n"),
    );
  });

  await test.step("A labelled backend entry keeps its canonical source path and feature folders", async () => {
    const locationPath = "dashboard/backend-tests";
    const heading = intentLocationName(intent, locationPath);
    await expect(heading).toContainText("Dashboard Backend Test");
    await expect(intentGroupToggle(intent, locationPath)).toHaveAccessibleName(
      "Expand Dashboard Backend Test",
    );
    await heading.click();
    const summary = intent.getByRole("region", {
      name: "Summary",
      exact: true,
    });
    await expect(summary).toContainText("Dashboard Backend Test");
    await expect(summary).toContainText(locationPath);
    await expandIntentGroup(intent, locationPath);
    await expandIntentFolders(intent, locationPath);
    for (const [group, file] of backendGroupedSources) {
      await expect(intentFolderName(intent, group)).toBeVisible();
      await expect(
        sourceFile(intent, `${locationPath}/${group}/${file}`),
      ).toBeVisible();
    }
    await expect(
      sourceFile(intent, `${locationPath}/launches/ownRecordContinuation.ts`),
    ).toHaveCount(0);
    const intentSpec = `${locationPath}/intent/authenticated-read-intent-locations.spec.ts`;
    await sourceFile(intent, intentSpec).click();
    await expect(sourceLineText(fileSource(intent, intentSpec))).toHaveText(
      browseSpec.split("\n"),
    );
  });

  await test.step("Ex 4 shell: top-level *.sh listed; support scripts omitted; selecting shows kind styling", async () => {
    const shellHeading = intentLocationName(intent, "tests");
    await expect(shellHeading).toContainText("shell");
    await expect(shellHeading).toContainText("*.sh");
    await expandIntentGroup(intent, "tests");
    await expect(sourceFile(intent, "tests/compare-versions.sh")).toBeVisible();
    await expect(sourceFile(intent, "tests/support/x.sh")).toHaveCount(0);

    await sourceFile(intent, "tests/compare-versions.sh").click();
    const source = fileSource(intent, "tests/compare-versions.sh");
    await expect(source).toContainText("echo ok");
    await expectKeywordAndStringColours(source, /^echo$/, /^ok$/);
  });
});
