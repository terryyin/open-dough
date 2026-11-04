// Intent's reading area offers Purpose and Proof as tabs for a selected file
// or nothing selected (../src/IntentFileReading.tsx): Purpose is chosen when
// Intent opens, the chosen tab fills the reading area and stays chosen across
// file selections, the tabs keep Intent's tab keyboard behavior without
// reaching project cycling or reading again, and a location Summary has no
// tabs. Case
// positioning across tabs is `./intent-purpose-proof-tabs-case.spec.ts`.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
  expectReadingTabChosen,
  intentLocationName,
  intentModeTab,
  readingTab,
} from "./intentPerspectivePage.ts";
import {
  contentReadsOf,
  publishIntentProject,
  pygardon,
} from "./intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherFeature,
  otherPath,
  publishedFeature,
  runFiles,
  settings,
} from "./intentCucumberProofFixtures.ts";

function projectInAddress(page: Page) {
  return new URL(page.url()).searchParams.get("project");
}

test("Purpose is chosen first, Proof stays chosen across files, the tabs use Intent's keys, and a Summary has no tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const requests = await publishIntentProject(page, pygardon, settings, {
    [featurePath]: publishedFeature,
    [otherPath]: otherFeature,
    ...runFiles,
  });
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const proof = intent.getByRole("region", { name: "Proof", exact: true });
  const source = intent.getByLabel(`${featurePath} source`);

  await test.step("nothing selected: Purpose and Proof tabs, Purpose chosen", async () => {
    await expect(
      intent
        .getByRole("tablist", { name: "Purpose and Proof" })
        .getByRole("tab"),
    ).toHaveText(["Purpose", "Proof"]);
    await expect(readingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(purpose).toContainText("Select a file to read its Purpose.");
    await expect(proof).toHaveCount(0);
    await expect(await chooseReadingTab(intent, "Proof")).toContainText(
      "Select a file to see its Proof.",
    );
    await expect(purpose).toHaveCount(0);
    await chooseReadingTab(intent, "Purpose");
  });

  await test.step("a selected file shows Purpose with its source; Proof shows that file's proof", async () => {
    await expandIntentGroup(intent, "e2e_test/features");
    await intent
      .getByRole("button", { name: featurePath, exact: true })
      .click();
    await expect(source).toBeVisible();
    await expect(source).toContainText("Feature: Jobs");
    await expect(proof).toHaveCount(0);

    await chooseReadingTab(intent, "Proof");
    await expect(
      proof.getByRole("table", { name: `${featurePath} proof` }),
    ).toContainText("Archive a job");
    await expect(source).toBeHidden();
  });

  await test.step("arrow keys, Home and End choose tabs, never the project, and read nothing again", async () => {
    const reads = contentReadsOf(requests, featurePath);
    expect(reads).toBeGreaterThan(0);
    await expectReadingTabChosen(intent, "Proof");
    for (const [key, chosen] of [
      ["ArrowLeft", "Purpose"],
      ["ArrowRight", "Proof"],
      ["ArrowRight", "Purpose"],
      ["End", "Proof"],
      ["Home", "Purpose"],
      ["End", "Proof"],
    ] as const) {
      await page.keyboard.press(key);
      await expectReadingTabChosen(intent, chosen);
      expect(projectInAddress(page)).toBe("pygardon");
    }
    await expect(
      intent.getByRole("button", { name: featurePath, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(contentReadsOf(requests, featurePath)).toBe(reads);
  });

  await test.step("selecting another file keeps Proof chosen with the new file's proof", async () => {
    await intent.getByRole("button", { name: otherPath, exact: true }).click();
    await expect(readingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      proof.getByRole("table", { name: `${otherPath} proof` }),
    ).toContainText("Report free space");
    await expect(purpose).toHaveCount(0);
  });

  await test.step("a location Summary keeps one pane without tabs; a file brings them back", async () => {
    await intentLocationName(intent, "e2e_test/features").click();
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      "e2e_test/features",
    );
    await expect(
      intent.getByRole("tablist", { name: "Purpose and Proof" }),
    ).toHaveCount(0);
    await expect(intent.locator(".intent-purpose, .intent-proof")).toHaveCount(
      0,
    );
    await intent
      .getByRole("button", { name: featurePath, exact: true })
      .click();
    await expect(readingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      proof.getByRole("table", { name: `${featurePath} proof` }),
    ).toContainText("Archive a job");
  });
});
