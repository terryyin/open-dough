// Tree file rows and location headers consume the shared CI comparison cues
// (../../src/IntentLocationGroup.tsx, ../../src/intentTreeComparison.ts): cue
// state and accessible names match Proof words; selection and keyboard focus
// stay distinct from count borders and duration tints; a location with story
// changes keeps its change mark beside a count cue; no story means no cues.
// Folder rows stay uncued (deferred).

import { expect, test } from "../support/preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import {
  expandIntentGroup,
  fileReadingTab,
  intentLocationName,
  proofRegion,
} from "../intentPerspectivePage.ts";
import {
  intentLocationHeader,
  locationHeaderLook,
} from "../intentLocationHeaderLook.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import { captureTreeCiCueScreenshots } from "../support/captureTreeCiCueScreenshots.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  folderItem,
  folderRow,
  intentFile,
  locationGroup,
} from "../support/intentStoryPage.ts";
import { selectDoneStoryForSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { modifiedFileRow } from "../support/summaryComparisonFileExpectedRows.ts";

test.setTimeout(120_000);

const cuedFileLabel = summaryComparisonChanges.modified;
const cuedFilePath = "dashboard/tests/folder/a.spec.ts";
const proofCounts = modifiedFileRow[1];
const proofAfter = modifiedFileRow[4];

test("tree file rows and location headers show shared CI cues with distinct selection and focus", async ({
  page,
  origin,
}, testInfo) => {
  await publishSummaryComparisonStory(page, origin);
  const { intent, card } = await selectDoneStoryForSummaryComparison(page);

  await expandIntentGroup(intent, "dashboard/tests");
  const folderToggle = intent
    .locator(".intent-locations")
    .getByRole("button", { name: "Expand folder", exact: true });
  if ((await folderToggle.count()) > 0) await folderToggle.click();
  await expect(
    intent
      .locator(".intent-locations")
      .getByRole("button", { name: "Collapse folder", exact: true }),
  ).toBeVisible();

  const locationHeader = intentLocationHeader(intent, "dashboard/tests");
  const locationName = intentLocationName(intent, "dashboard/tests");
  const file = intentFile(intent, cuedFileLabel);

  await test.step("cued location header and file expose cue state and Proof words in accessible names", async () => {
    await expectCueState(locationHeader, {
      count: "more-light",
      duration: "slower-strong",
    });
    await expect(locationName).toHaveAttribute(
      "aria-label",
      "dashboard/tests, typescript, **/*.spec.ts, 4 → 5 tests (+1), 12.0 s → 18.5 s (+6.5 s, +54%)",
    );

    await expectCueState(file, {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    });
    await expect(file).toHaveAttribute(
      "aria-label",
      `${cuedFileLabel}, ${proofCounts}, ${proofAfter}`,
    );

    await file.click();
    await fileReadingTab(intent, "Proof").click();
    const proof = proofRegion(intent);
    const proofRow = proof
      .getByRole("table", { name: `CI proof of ${cuedFilePath}` })
      .locator("tbody")
      .getByRole("row")
      .first();
    await expectCueState(proofRow, {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    });
    await expect(proofRow.getByRole("cell").nth(0)).toHaveText(proofCounts);
    await expect(proofRow.getByRole("cell").nth(3)).toHaveText(proofAfter);
  });

  await test.step("selecting and keyboard-focusing a cued file keeps cues with a distinct selection border and focus ring", async () => {
    await file.click();
    await expect(file).toHaveAttribute("aria-pressed", "true");
    await expectCueState(file, {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    });
    const selected = await file.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        background: style.backgroundColor,
      };
    });
    // Duration tint stays (no accent fill that would hide it); selection is
    // the accent border, distinct from any inset count edge.
    expect(selected.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(selected.borderColor).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);

    // Shared keyboard focus ring (styles.css :focus-visible) stays a 3px
    // accent outline with offset — distinct from the selection border and
    // from cue tint/inset. Focus the file and keep cue state.
    const focusRing = await page.evaluate(() => {
      const rule = [...document.styleSheets]
        .flatMap((sheet) => {
          try {
            return [...sheet.cssRules];
          } catch {
            return [];
          }
        })
        .find(
          (entry) =>
            entry instanceof CSSStyleRule &&
            entry.selectorText === ":focus-visible",
        ) as CSSStyleRule | undefined;
      return rule === undefined
        ? undefined
        : {
            outline: rule.style.outline,
            offset: rule.style.outlineOffset,
          };
    });
    expect(focusRing).toEqual({
      outline: "3px solid var(--accent)",
      offset: "2px",
    });
    await file.focus();
    await expect(file).toBeFocused();
    const focused = await file.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        borderColor: style.borderColor,
      };
    });
    expect(focused.background).toBe(selected.background);
    expect(focused.borderColor).toBe(selected.borderColor);
    await expectCueState(file, {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    });
  });

  await test.step("location with story changes keeps its change mark beside the count cue when selected", async () => {
    await expect(locationGroup(intent, "dashboard/tests")).toHaveAttribute(
      "data-contains-changes",
      "true",
    );
    const unselected = await locationHeaderLook(locationHeader);
    expect(unselected.mark).not.toBe("none");
    expect(unselected.mark).toMatch(/rgb/);

    await locationName.click();
    await expect(locationName).toHaveAttribute("aria-pressed", "true");
    await expectCueState(locationHeader, {
      count: "more-light",
      duration: "slower-strong",
    });
    const selected = await locationHeaderLook(locationHeader);
    expect(selected.mark).not.toBe("none");
    // Change mark (ready) and count cue both present in the leading inset.
    expect(selected.mark.split(/,(?![^(]*\))/).length).toBeGreaterThanOrEqual(
      2,
    );
    const selectedStyle = await locationHeader.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        background: style.backgroundColor,
      };
    });
    // Duration tint stays; selection uses accent border, not accent fill alone.
    expect(selectedStyle.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(selectedStyle.borderColor).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
  });

  await test.step("folder rows stay without cues", async () => {
    await expect(folderItem(intent, "folder")).not.toHaveAttribute(
      "data-ci-count-cue",
    );
    await expect(folderItem(intent, "folder")).not.toHaveAttribute(
      "data-ci-duration-cue",
    );
    await expect(
      folderRow(intent, "folder").locator("[data-ci-count-cue]"),
    ).toHaveCount(0);
  });

  await test.step("screenshot review light and dark at desktop and phone widths", async () => {
    await expandIntentGroup(intent, "dashboard/tests");
    await intentFile(intent, cuedFileLabel).click();
    await captureTreeCiCueScreenshots(
      page,
      intent,
      testInfo.outputPath("screenshots"),
    );
  });

  await test.step("no story selected shows no tree cues", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await expect(card).toBeVisible();
    await card.click({ position: { x: 8, y: 8 } });
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).toBeVisible();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(
      intent.locator(".intent-locations [data-ci-count-cue]"),
    ).toHaveCount(0);
    await expect(
      intent.locator(".intent-locations [data-ci-duration-cue]"),
    ).toHaveCount(0);
  });
});
