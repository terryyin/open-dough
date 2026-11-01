// Intent opens a recorded test at its identified case in Purpose
// (SEED-192 commitments 23.1–23.3, 24, E4 configured variant).

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  expectCandidatesRevision,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  openDoughCaseLineNumber,
  openDoughSpecPaths,
  publishOpenDoughCaseLine,
} from "./intentCandidatesFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "./intentCandidatesCasePositionFixtures.ts";
import {
  publishPygardonConfiguredTests,
  pygardonClipCase,
  pygardonClipCaseLine,
  pygardonClipPath,
} from "./intentCandidatesOtherProjectFixtures.ts";
import { doughnut, openDough, pygardon } from "./intentCodeBrowseFixtures.ts";

async function expectTargetLine(source: Locator, line: number) {
  const target = source.locator(".source-line.is-target");
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute("data-line", String(line));
  await expect(target).toHaveAttribute("aria-current", "location");
  await expect(target).toBeInViewport();
  await expect(target.locator(".source-line-number")).toHaveText(String(line));
}

test("Intent opens a configured Pygardon ::name case at its line in Purpose", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishPygardonConfiguredTests(page);

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectCandidatesRevision(intent, pygardon.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "real-h264-codec-roundtrip",
  });
  await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
    `::${pygardonClipCase}`,
  );
  await entry
    .getByRole("button", { name: pygardonClipPath, exact: true })
    .click();

  const source = intent.getByLabel(`${pygardonClipPath} source`);
  await expect(source).toContainText(`def ${pygardonClipCase}`);
  await expectTargetLine(source, pygardonClipCaseLine);
});

test("Intent opens a Gherkin scenario named exactly once at its line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishDoughnutCasePosition(page);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectCandidatesRevision(intent, doughnut.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "unique-scenario-once",
  });
  await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
    `::${doughnutUniqueScenario}`,
  );
  await entry
    .getByRole("button", { name: doughnutCaseFeaturePath, exact: true })
    .click();

  const source = intent.getByLabel(`${doughnutCaseFeaturePath} source`);
  await expect(source).toContainText(`Scenario: ${doughnutUniqueScenario}`);
  await expectTargetLine(source, doughnutUniqueScenarioLine);
});

test("Intent opens path:line at that line and a duplicate case name at the file start", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await test.step("path:line positions and identifies the target line", async () => {
    await publishOpenDoughCaseLine(page);
    await openUntilRead(page, "/?project=open-dough");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    await expectCandidatesRevision(intent, openDough.revision);

    const entry = candidatesRecord(intent).getByRole("article", {
      name: "path-line-case",
    });
    await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
      `:${openDoughCaseLineNumber}`,
    );
    await entry
      .getByRole("button", {
        name: openDoughSpecPaths.caseLine,
        exact: true,
      })
      .click();

    const source = intent.getByLabel(`${openDoughSpecPaths.caseLine} source`);
    await expect(source).toContainText("line-anchored case");
    await expectTargetLine(source, openDoughCaseLineNumber);
  });

  await test.step("duplicate case name opens at the file start with case text beside the link", async () => {
    await publishDoughnutCasePosition(page);
    await openUntilRead(page, "/?project=doughnut");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();

    const entry = candidatesRecord(intent).getByRole("article", {
      name: "duplicate-scenario-name",
    });
    await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
      "::shared scenario",
    );
    await entry
      .getByRole("button", { name: doughnutCaseFeaturePath, exact: true })
      .click();

    const source = intent.getByLabel(`${doughnutCaseFeaturePath} source`);
    await expect(source).toContainText("Scenario: shared scenario");
    await expect(source.locator(".source-line.is-target")).toHaveCount(0);
    await expect(source.locator(".source-line-number").first()).toHaveText("1");
    await expect
      .poll(() =>
        page.locator(".intent-reading").evaluate((el) => el.scrollTop),
      )
      .toBe(0);

    await intent
      .getByRole("button", { name: "Test Optimization Candidates" })
      .click();
    const returned = candidatesRecord(intent).getByRole("article", {
      name: "duplicate-scenario-name",
    });
    await expect(
      returned.getByRole("button", {
        name: doughnutCaseFeaturePath,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      returned.locator(".intent-candidate-location-case"),
    ).toHaveText("::shared scenario");
  });
});
