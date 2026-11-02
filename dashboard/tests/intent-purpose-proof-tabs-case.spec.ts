// Switching Purpose and Proof keeps a positioned case without reading again,
// and opening a recorded file from Optimization Candidates chooses Purpose on
// its case (../src/IntentFileReading.tsx; SEED-222 examples 7 for tabs, 8;
// commitment 22). The tabs themselves are `./intent-purpose-proof-tabs.spec.ts`.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { pressWhereShown } from "./pageLayout.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expectReadingTabChosen,
  intentModeTab,
  readingTab,
} from "./intentPerspectivePage.ts";
import { contentReadsOf } from "./intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  expectDoughnutCasePositioned,
  openDoughnutRecordedCase,
  publishDoughnutCasePosition,
} from "./intentCandidatesCasePositionFixtures.ts";

test("switching tabs keeps a positioned case without reading again, and opening a recorded file from Proof chooses Purpose on its case", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const requests = await publishDoughnutCasePosition(page);
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const fileName = intent.getByRole("button", {
    name: doughnutCaseFeaturePath,
    exact: true,
  });

  await openDoughnutRecordedCase(intent);
  await expect(readingTab(intent, "Purpose")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expectDoughnutCasePositioned(intent);
  const reads = contentReadsOf(requests, doughnutCaseFeaturePath);
  expect(reads).toBe(1);

  await test.step("Ex 7: Proof and back keeps the file, its case position and the Intent tab, reading nothing", async () => {
    await pressWhereShown(readingTab(intent, "Proof"));
    await expectReadingTabChosen(intent, "Proof");
    await expect(
      intent.getByRole("region", { name: "Proof", exact: true }),
    ).toContainText("Proof is not recorded for this project.");
    await page.keyboard.press("ArrowLeft");
    await expectReadingTabChosen(intent, "Purpose");
    await expectDoughnutCasePositioned(intent);
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
    await openDoughnutRecordedCase(intent);
    await expect(readingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      intent.getByRole("region", { name: "Purpose", exact: true }),
    ).toBeVisible();
    await expectDoughnutCasePositioned(intent);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
  });
});
