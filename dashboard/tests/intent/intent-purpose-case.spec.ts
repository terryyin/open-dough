// Opening a recorded file from Optimization Candidates shows Purpose
// positioned on its case, and opening it again after reading away from the
// case starts a fresh reading positioned on it once more
// (../../src/IntentBrowser.tsx, ../../src/IntentFileReading.tsx). The case targets
// themselves are `./intent-test-optimization-candidates-case.spec.ts`.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { intentModeTab } from "../intentModePage.ts";
import { purposeRegion } from "../intentPerspectivePage.ts";
import { contentReadsOf } from "../intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  expectDoughnutCasePositioned,
  openDoughnutRecordedCase,
  publishDoughnutCasePosition,
} from "../intentCandidatesCasePositionFixtures.ts";

test("opening a recorded file shows Purpose on its case, reading it once, and opening it again after reading away returns to the case", async ({
  page,
}) => {
  // Short enough that the case sits below the start of Purpose.
  await page.setViewportSize({ width: 1280, height: 640 });
  const requests = await publishDoughnutCasePosition(page);
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const fileName = intent.getByRole("button", {
    name: doughnutCaseFeaturePath,
    exact: true,
  });

  await openDoughnutRecordedCase(intent);
  await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expectDoughnutCasePositioned(intent);
  await expect(fileName).toHaveAttribute("aria-pressed", "true");
  expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(1);

  await test.step("read from the start, opening the recorded file again shows Purpose on its case", async () => {
    await page.locator(".intent-reading").evaluate((el) => {
      el.scrollTo({ top: 0 });
    });
    await expect(intent.locator(".source-line.is-target")).not.toBeInViewport();
    await openDoughnutRecordedCase(intent);
    await expect(purposeRegion(intent)).toBeVisible();
    await expectDoughnutCasePositioned(intent);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
  });
});
