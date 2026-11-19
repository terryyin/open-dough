// Usage's chart key lists, for each shown tool, its task mark, partial mark
// and median drawn as the chart draws them and named with the tool; each tool
// summary's heading swatch is that tool's task mark.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  requestedCohort,
  usageTokenIndexEndpoint,
} from "../../src/usageTokenIndex.ts";
import { narrowWindow } from "../../test-support/accessibleReading.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import { usageChart } from "../../test-support/support/usageChartPage.ts";
import { usageLegend } from "../../test-support/support/usageLegendPage.ts";
import { visitUsage } from "../../test-support/support/systemSettingsUsagePage.ts";
import type { Page } from "@playwright/test";

const at = (date: number) =>
  new Date(Date.UTC(2026, 10, date, 12)).toISOString();

// Each tool has a measured and a partly measured task and a median.
async function comparing(page: Page) {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const tool =
        requestedCohort(new URL(route.request().url()).searchParams)?.tool ??
        "codex";
      const day = tool === "claude" ? 4 : 2;
      return route.fulfill({
        json: makeMe.aTokenIndexAnswer
          .with({ indexes: [1_000, 2_000] })
          .withTask(0, { endedAt: at(day) })
          .withTask(1, {
            endedAt: at(day + 1),
            coverage: {
              kind: "partial",
              gaps: ["missing-root-transcript-usage"],
            },
          })
          .withTrend([{ at: at(day + 1), value: 1_500 }])
          .forCohort({ tool })
          .please(),
      });
    },
  );
  return visitUsage(page);
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("the key and summary swatches show each shown tool's marks, and a hidden tool leaves the key", async ({
  page,
}) => {
  const usage = await comparing(page);
  const legend = usageLegend(page);
  await legend.showsKeyFor(["Codex"]);
  await usage.showTool("Claude Code", true);
  await legend.showsKeyFor(["Codex", "Claude Code"]);
  await legend.showsSummarySwatches(["Codex", "Claude Code"]);
  await usage.showTool("Codex", false);
  await legend.showsKeyFor(["Claude Code"]);
  await legend.showsSummarySwatches(["Claude Code"]);
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["narrowest reading window", narrowWindow],
] as const) {
  test.describe(name, () => {
    test.use({ viewport });
    test("the compared key fits without sideways scroll in light and dark", async ({
      page,
    }) => {
      const usage = await comparing(page);
      await usage.showTool("Claude Code", true);
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await usageLegend(page).showsKeyFor(["Codex", "Claude Code"]);
        await usageChart(page).fitsReadingWindow();
      }
    });
  });
}
