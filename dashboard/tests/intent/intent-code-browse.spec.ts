// Intent lists and reads configured code test source at the observed revision
// (../../src/IntentPerspective.tsx): include-pattern matches, helpers/product
// omitted, group headers, and exact text with kind styling. Doughnut and
// Pygardon kinds: ./intent-code-browse-projects.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { parts, shortRevision } from "../dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  expectIntentGroupsCollapsed,
  intentGroupToggle,
  intentFolderName,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { expectKeywordAndStringColours } from "../pageColours.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  browseSpec,
  openDough,
  publishIntentProject,
  shellCheck,
} from "../intentCodeBrowseFixtures.ts";
import { expectLabelledEntrySource } from "../intentCodeBrowsePage.ts";

test("Intent lists matched code test files under include patterns, omits helpers and product files, and reads exact text with the observed revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const settings = JSON.stringify({
    intent: {
      locations: [
        {
          path: "dashboard/tests",
          kind: "typescript",
          include: ["**/*.spec.ts"],
        },
        {
          path: "dashboard/frontend-tests",
          label: "Dashboard Frontend Test",
          kind: "typescript",
          include: ["**/*.spec.ts"],
        },
        {
          path: "dashboard/backend-tests",
          label: "Dashboard Backend Test",
          kind: "typescript",
          include: ["**/*.spec.ts"],
        },
        { path: "tests", kind: "shell", include: ["*.sh"] },
      ],
    },
  });
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
        intent.getByRole("button", {
          name: `dashboard/tests/${group}/${file}`,
          exact: true,
        }),
      ).toBeVisible();
    }
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/intent/intent-gherkin-browse.spec.ts",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/intentPerspectivePage.ts",
        exact: true,
      }),
    ).toHaveCount(0);

    await intent
      .getByRole("button", {
        name: "dashboard/tests/intent/intent-gherkin-browse.spec.ts",
        exact: true,
      })
      .click();
    const source = intent.getByLabel(
      "dashboard/tests/intent/intent-gherkin-browse.spec.ts source",
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
        intent.getByRole("button", {
          name: `${locationPath}/${group}/${file}`,
          exact: true,
        }),
      ).toBeVisible();
    }
    await expect(
      intent.getByRole("button", {
        name: `${locationPath}/launches/ownRecordContinuation.ts`,
        exact: true,
      }),
    ).toHaveCount(0);
    const intentSpec = `${locationPath}/intent/authenticated-read-intent-locations.spec.ts`;
    await intent.getByRole("button", { name: intentSpec, exact: true }).click();
    await expect(
      intent.getByLabel(`${intentSpec} source`).locator(".source-line-text"),
    ).toHaveText(browseSpec.split("\n"));
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
