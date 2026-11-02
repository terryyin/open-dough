// Switching Purpose and Proof keeps a positioned case without reading again,
// and opening a recorded file from Optimization Candidates chooses Purpose on
// its case (../src/IntentFileReading.tsx; SEED-222 examples 7 for tabs, 8;
// commitment 22). The tabs themselves are `./intent-purpose-proof-tabs.spec.ts`.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  chooseReadingTab,
  expectReadingTabChosen,
  intentModeTab,
  readingTab,
} from "./intentPerspectivePage.ts";
import { contentReadsOf } from "./intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "./intentCandidatesCasePositionFixtures.ts";

async function expectPositionedCase(intent: Locator) {
  const source = intent.getByLabel(`${doughnutCaseFeaturePath} source`);
  const target = source.locator(".source-line.is-target");
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute(
    "data-line",
    String(doughnutUniqueScenarioLine),
  );
  await expect(target).toHaveAttribute("aria-current", "location");
  await expect(target).toBeInViewport();
}

test("switching tabs keeps a positioned case without reading again, and opening a recorded file from Proof chooses Purpose on its case", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const requests = await publishDoughnutCasePosition(page);
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const openRecordedCase = async () => {
    await chooseOptimizationCandidates(intent);
    await candidatesRecord(intent)
      .getByRole("article", { name: "unique-scenario-once" })
      .getByRole("button", { name: doughnutCaseFeaturePath, exact: true })
      .click();
  };
  const fileName = intent.getByRole("button", {
    name: doughnutCaseFeaturePath,
    exact: true,
  });

  await openRecordedCase();
  await expect(readingTab(intent, "Purpose")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expectPositionedCase(intent);
  const reads = contentReadsOf(requests, doughnutCaseFeaturePath);
  expect(reads).toBe(1);

  await test.step("Ex 7: Proof and back keeps the file, its case position and the Intent tab, reading nothing", async () => {
    // A pointer click where the tab is: Playwright's own click first scrolls
    // the sticky tab's resting place into view, which a reader's click never
    // does.
    const box = await readingTab(intent, "Proof").boundingBox();
    expect(box).not.toBeNull();
    if (box !== null) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expectReadingTabChosen(intent, "Proof");
    await expect(
      intent.getByRole("region", { name: "Proof", exact: true }),
    ).toContainText("Proof is not recorded for this project.");
    await page.keyboard.press("ArrowLeft");
    await expectReadingTabChosen(intent, "Purpose");
    await expectPositionedCase(intent);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(reads);
  });

  await test.step("Ex 8: on Proof, opening the recorded file shows Purpose positioned on its case", async () => {
    // Leave Purpose read from its start, away from the case.
    await page.locator(".intent-reading").evaluate((el) => {
      el.scrollTo({ top: 0 });
    });
    await expect(intent.locator(".source-line.is-target")).not.toBeInViewport();
    await chooseReadingTab(intent, "Proof");
    await openRecordedCase();
    await expect(readingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      intent.getByRole("region", { name: "Purpose", exact: true }),
    ).toBeVisible();
    await expectPositionedCase(intent);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
  });
});
