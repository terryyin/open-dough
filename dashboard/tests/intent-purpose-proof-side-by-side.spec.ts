// Side by side shows Purpose and Proof together for a selected file or
// nothing selected (../src/IntentFileReading.tsx): a keyboard-operable
// pressed toggle beside the tabs, two panels that each scroll on their own and
// follow the selection, stacking Purpose above Proof where the reading area is
// too narrow, and off bringing back the tab chosen before; switching layouts
// keeps the selection, the Intent reading tab and the selected story, and
// reads nothing again. A positioned case across layouts is
// `./intent-purpose-proof-side-by-side-case.spec.ts`.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
  expectSideBySide,
  intentModeTab,
  readingTab,
  sideBySideToggle,
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
import {
  box,
  expectOnOneLine,
  expectSideBySideInOrder,
  expectStackedInOrder,
} from "./partArrangement.ts";
import { expectSelected, selectStory } from "./storyCardSelection.ts";

// Purpose before Proof across the reading area, or down it.
async function expectArranged(
  regions: { readonly purpose: Locator; readonly proof: Locator },
  arrangement: "beside" | "stacked",
) {
  const order = [regions.purpose, regions.proof];
  await expect(async () => {
    await (arrangement === "beside"
      ? expectSideBySideInOrder(order)
      : expectStackedInOrder(order));
  }).toPass();
}

function scrollTopOf(locator: Locator) {
  return locator.evaluate((element) => element.scrollTop);
}

test("Side by side shows both panels scrolling on their own, follows the selection, stacks when narrow, and restores the chosen tab without changing the selection or reading again", async ({
  page,
}) => {
  // Short enough that the feature's Purpose overflows its panel.
  await page.setViewportSize({ width: 1280, height: 640 });
  const requests = await publishIntentProject(page, pygardon, settings, {
    [featurePath]: publishedFeature,
    [otherPath]: otherFeature,
    ...runFiles,
  });
  await openUntilRead(page, "/?project=pygardon");
  const { backlog, intent, intentChoice } = parts(page);
  const story = backlog.getByRole("article", { name: pygardon.queued });
  await selectStory(story).click();
  await expectSelected(story, true);
  await intentChoice.click();
  const selectedStory =
    (await intent.getAttribute("data-selected-story")) ?? "";
  expect(selectedStory).not.toBe("");
  const toggle = sideBySideToggle(intent);
  const readingArea = page.locator(".intent-reading");
  const fileName = (path: string) =>
    intent.getByRole("button", { name: path, exact: true });

  await test.step("nothing selected: the toggle sits beside the tabs, unpressed, and shows both panels", async () => {
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expectOnOneLine([
      intent.getByRole("tablist", { name: "Purpose and Proof" }),
      toggle,
    ]);
    await toggle.click();
    const regions = await expectSideBySide(intent);
    await expect(regions.purpose).toContainText(
      "Select a feature file to read its Purpose.",
    );
    await expect(regions.proof).toContainText(
      "Select a feature file to see its Proof.",
    );
    await expectArranged(regions, "beside");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  // With tabs on Proof, so turning Side by side off must bring Proof back.
  await expandIntentGroup(intent, "e2e_test/features");
  await fileName(featurePath).click();
  // Read before counting: the file's read is answered once its source shows.
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    "Feature: Jobs",
  );
  await chooseReadingTab(intent, "Proof");
  const reads = contentReadsOf(requests, featurePath);
  expect(reads).toBe(1);
  const unchanged = async (path: string) => {
    await expect(fileName(path)).toHaveAttribute("aria-pressed", "true");
    await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(intent).toHaveAttribute("data-selected-story", selectedStory);
  };

  await test.step("pressed by keyboard, both panels show the same file beside each other", async () => {
    await toggle.focus();
    await page.keyboard.press("Enter");
    const regions = await expectSideBySide(intent);
    await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
      "Feature: Jobs",
    );
    await expect(
      regions.proof.getByRole("table", { name: `${featurePath} proof` }),
    ).toContainText("Archive a job");
    await expectArranged(regions, "beside");
    await unchanged(featurePath);
    expect(contentReadsOf(requests, featurePath)).toBe(reads);
  });

  await test.step("scrolling Purpose keeps Proof where it is; the reading area holds still", async () => {
    const purposeBody = intent
      .getByRole("region", { name: "Purpose", exact: true })
      .locator(".intent-reading-panel-body");
    const proof = intent.getByRole("region", { name: "Proof", exact: true });
    const proofBody = proof.locator(".intent-reading-panel-body");
    const proofBefore = await box(proof);
    const purposeAt = await box(purposeBody);
    await page.mouse.move(
      purposeAt.x + purposeAt.width / 2,
      purposeAt.y + purposeAt.height / 2,
    );
    await page.mouse.wheel(0, 400);
    await expect.poll(() => scrollTopOf(purposeBody)).toBeGreaterThan(0);
    expect(await scrollTopOf(proofBody)).toBe(0);
    expect(await scrollTopOf(readingArea)).toBe(0);
    expect(await box(proof)).toEqual(proofBefore);
    await expect(
      proof.getByRole("table", { name: `${featurePath} proof` }),
    ).toBeInViewport();
  });

  await test.step("selecting another file updates both panels", async () => {
    await fileName(otherPath).click();
    const regions = await expectSideBySide(intent);
    await expect(intent.getByLabel(`${otherPath} source`)).toContainText(
      "Feature: Disk space",
    );
    await expect(
      regions.proof.getByRole("table", { name: `${otherPath} proof` }),
    ).toContainText("Report free space");
  });

  await test.step("narrowed until the locations sit above, Purpose stacks above Proof with the toggle on; widened, beside again", async () => {
    await page.setViewportSize({ width: 800, height: 900 });
    await expect(async () => {
      const locations = await box(page.locator(".intent-locations"));
      expect(locations.y + locations.height).toBeLessThanOrEqual(
        (await box(readingArea)).y + 1,
      );
    }).toPass();
    await expectArranged(await expectSideBySide(intent), "stacked");
    await page.setViewportSize({ width: 1280, height: 640 });
    await expectArranged(await expectSideBySide(intent), "beside");
  });

  await test.step("off by keyboard brings back Proof, chosen before; switching reads nothing and keeps the selection", async () => {
    const otherReads = contentReadsOf(requests, otherPath);
    expect(otherReads).toBe(1);
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(readingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      intent.getByRole("region", { name: "Purpose", exact: true }),
    ).toHaveCount(0);
    await expect(
      intent
        .getByRole("region", { name: "Proof", exact: true })
        .getByRole("heading", { name: "Proof" }),
    ).toHaveClass(/visually-hidden/);
    await page.keyboard.press("Space");
    await expectSideBySide(intent);
    await page.keyboard.press("Enter");
    await expect(readingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await unchanged(otherPath);
    expect(contentReadsOf(requests, otherPath)).toBe(otherReads);
    expect(contentReadsOf(requests, featurePath)).toBe(reads);
  });
});
