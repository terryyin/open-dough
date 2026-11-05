// Opening a recorded file from Optimization Candidates with Side by side on
// shows Purpose positioned on its case, and switching layouts keeps that case
// in view without reading again (../src/IntentFileReading.tsx). Side by side
// itself is
// `./intent-purpose-proof-side-by-side.spec.ts`.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { pressWhereShown } from "./pageLayout.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { intentModeTab } from "./intentModePage.ts";
import {
  expectSideBySide,
  readingTab,
  sideBySideToggle,
} from "./intentFileReadingPage.ts";
import { contentReadsOf } from "./intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  expectDoughnutCasePositioned,
  openDoughnutRecordedCase,
  publishDoughnutCasePosition,
} from "./intentCandidatesCasePositionFixtures.ts";

test("with Side by side on, a recorded file opens on its case in Purpose, and switching layouts keeps the case in view without reading again", async ({
  page,
}) => {
  // Short enough that the case sits below the start of Purpose.
  await page.setViewportSize({ width: 1280, height: 640 });
  const requests = await publishDoughnutCasePosition(page);
  // Layout preference applies when a file opens; empty selection is CI home
  // and has no Side by side control.
  await page.addInitScript(() => {
    localStorage.setItem("open-dough.intent.layout", "side-by-side");
  });
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const toggle = sideBySideToggle(intent);
  const readingArea = page.locator(".intent-reading");
  const purposeBody = intent
    .getByRole("region", { name: "Purpose", exact: true })
    .locator(".intent-reading-panel-body");
  const fileName = intent.getByRole("button", {
    name: doughnutCaseFeaturePath,
    exact: true,
  });
  const unchanged = async () => {
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  };

  await test.step("side by side, opening the recorded file positions Purpose's own panel on its case", async () => {
    await openDoughnutRecordedCase(intent);
    await expectSideBySide(intent);
    await expectSideBySide(intent);
    await expectDoughnutCasePositioned(intent);
    expect(
      await purposeBody.evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    expect(await readingArea.evaluate((element) => element.scrollTop)).toBe(0);
    await unchanged();
    expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(1);
  });

  await test.step("off and on keeps the case in view in either layout, reading nothing", async () => {
    await pressWhereShown(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(readingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expectDoughnutCasePositioned(intent);
    await pressWhereShown(toggle);
    await expectSideBySide(intent);
    await expectDoughnutCasePositioned(intent);
    await unchanged();
  });

  await test.step("from Proof in tabs, Side by side shows Purpose where it was read, on the case", async () => {
    await pressWhereShown(toggle);
    await pressWhereShown(readingTab(intent, "Proof"));
    await expect(readingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      intent.getByRole("region", { name: "Proof", exact: true }),
    ).toContainText("Proof is not recorded for this project.");
    await pressWhereShown(toggle);
    await expectSideBySide(intent);
    await expectDoughnutCasePositioned(intent);
    await unchanged();
    expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(1);
  });
});
