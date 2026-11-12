import {
  scopeHistory,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
// Dark system appearance for a selected Done story's Intent reading: CI
// comparison, Changed tests with files shown/hidden, Intent coverage, cued
// rows, diffs, and source stay legible; captures support visual review against
// the approved dark mockup; live preference changes keep reading state.

import path from "node:path";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import {
  expectChartMarkContrast,
  expectReadableContrast,
} from "../accessibleReading.ts";
import {
  expectDarkSurface,
  expectLightSurface,
  expectNoAppearanceSwitch,
  expectSourceReadable,
  setColorScheme,
  sourceAppearance,
} from "../systemAppearanceReading.ts";
import { expandIntentGroup, fileReadingTab } from "../intentPerspectivePage.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  chooseStoryTab,
  intentFile,
  intentDiffReading,
} from "../support/intentStoryPage.ts";
import { expectFilesShown, filesToggle } from "../intentModePage.ts";
import { colourOf } from "../pageColours.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const cuedFileLabel = summaryComparisonChanges.modified;
const unchangedPath = "dashboard/tests/root.spec.ts";

test("a Done story's Intent evidence stays readable under the system dark appearance", async ({
  page,
  origin,
}, testInfo) => {
  // Real Done-story publication plus multi-tab contrast and live appearance.
  test.setTimeout(120_000);
  const setup = await publishSummaryComparisonStory(page, origin);
  await setColorScheme(page, "dark");
  const { intent } = await selectDoneStoryForSummaryComparison(page);

  await test.step("dark CI comparison and story chrome stay readable", async () => {
    await expectDarkSurface(page);
    await chooseStoryTab(intent, "CI comparison");
    const comparison = intent.getByRole("region", {
      name: "CI timing comparison",
      exact: true,
    });
    await expect(comparison).toBeVisible();
    await expectReadableContrast(comparison.getByRole("heading").first());
    await expectReadableContrast(comparison.locator("thead th").first());
    await expectNoAppearanceSwitch(page);
  });

  await test.step("Changed tests with files shown and hidden stay readable at desktop and phone widths", async () => {
    await chooseStoryTab(intent, "Changed tests");
    await expect(filesToggle(intent)).toHaveText("Hide files");
    await expandIntentGroup(intent, "dashboard/tests");
    await expectReadableContrast(
      intentFile(intent, cuedFileLabel).locator("code"),
    );
    for (const width of [1280, 390] as const) {
      await page.setViewportSize({ width, height: 844 });
      await expectDarkSurface(page);
      await filesToggle(intent).click();
      await expectFilesShown(intent, false);
      await filesToggle(intent).click();
      await expectFilesShown(intent, true);
      await intent.screenshot({
        path: path.join(
          testInfo.outputPath("screenshots"),
          `story-dark-${width}.png`,
        ),
      });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  await test.step("Intent coverage and missing-evidence text stay readable", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    const coverage = intent.getByRole("region", { name: "Intent coverage" });
    await expect(coverage).toBeVisible();
    await expectReadableContrast(
      coverage.getByRole("heading", { name: "Intent coverage" }),
    );
    await expectReadableContrast(
      coverage.locator("p, .intent-story-coverage-text").first(),
    );
  });

  await test.step("cued rows, Purpose diffs, and highlighted source stay distinguishable", async () => {
    await chooseStoryTab(intent, "Changed tests");
    await expandIntentGroup(intent, "dashboard/tests");
    const file = intentFile(intent, cuedFileLabel);
    await expectCueState(file, {
      count: "none",
      duration: "slower-light",
      countReason: "unchanged",
    });
    await file.click();
    await expect(file).toHaveAttribute("aria-pressed", "true");
    await file.focus();
    await expect(file).toBeFocused();
    await fileReadingTab(intent, "Purpose").click();
    const diff = intentDiffReading(intent).code;
    await expect(diff).toBeVisible();
    for (const kind of [
      ".story-review-added",
      ".story-review-removed",
    ] as const) {
      const line = diff.locator(kind).first();
      if ((await line.count()) > 0) await expectReadableContrast(line);
    }

    await intentFile(intent, unchangedPath).click();
    await fileReadingTab(intent, "Purpose").click();
    await expectSourceReadable(intent, unchangedPath);
  });

  await test.step("Summary timing history marks stay readable on the dark chart", async () => {
    const previous = "1".repeat(40);
    const collected = makeMe.aCiScopeHistory
      .with({
        path: "dashboard/tests",
        selectedRevision: setup.completion,
        availability: "retained",
        entries: [
          {
            key: "run/1/1",
            kind: "point",
            date: "2026-11-05T10:00:00Z",
            selected: false,
            landings: [
              {
                revision: previous,
                receivedAt: "2026-11-05T10:00:00Z",
                selected: false,
              },
            ],
            build: {
              revision: previous,
              runId: 1,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/1",
              provenance: "exact",
            },
            readings: [
              {
                kind: "point",
                unit: "case",
                ms: 1200,
                entry: "dashboard/tests",
                segment: "case/1",
              },
            ],
          },
          {
            key: "run/2/1",
            kind: "point",
            date: "2026-11-06T10:00:00Z",
            selected: true,
            landings: [
              {
                revision: setup.completion,
                receivedAt: "2026-11-06T10:00:00Z",
                selected: true,
              },
            ],
            build: {
              revision: setup.completion,
              runId: 2,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/2",
              provenance: "exact",
            },
            readings: [
              {
                kind: "point",
                unit: "case",
                ms: 900,
                entry: "dashboard/tests",
                segment: "case/1",
              },
            ],
          },
        ],
      })
      .please();
    await page.route(
      /\/__authenticated-read\?.*intent=ci-history.*scope=/,
      async (route) => {
        await route.fulfill({ json: collected });
      },
    );
    const summary = await openSummaryComparison(intent, "dashboard/tests");
    const history = scopeHistory(summary);
    const reading = scopeHistoryReading(history);
    await expect(history).toBeVisible();
    await expectReadableContrast(reading.extent);
    await expectChartMarkContrast(reading.unselectedPoints.first());
  });

  await test.step("changing system appearance keeps the selected story and reading place", async () => {
    await chooseStoryTab(intent, "Changed tests");
    await expandIntentGroup(intent, "dashboard/tests");
    await intentFile(intent, unchangedPath).click();
    await fileReadingTab(intent, "Purpose").click();
    const { source, token } = sourceAppearance(intent, unchangedPath);
    await expect(source).toBeVisible();
    const darkColour =
      (await token.count()) > 0 ? await colourOf(token) : undefined;

    await setColorScheme(page, "light");
    await expectLightSurface(page);
    await expect(intent).toHaveAttribute("data-selected-story", /SEED-A#a/);
    await expect(source).toBeVisible();
    if (darkColour !== undefined && (await token.count()) > 0) {
      expect(await colourOf(token)).not.toBe(darkColour);
    }

    await setColorScheme(page, "dark");
    await expectDarkSurface(page);
    await expect(intent).toHaveAttribute("data-selected-story", /SEED-A#a/);
    await expect(source).toBeVisible();
    if (darkColour !== undefined && (await token.count()) > 0) {
      expect(await colourOf(token)).toBe(darkColour);
    }
  });
});
